import { Hono } from "hono";
import { db } from "../database";
import { users, safetyLogs, stripeSubscriptions, events, eventBookings, connections } from "../database/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-05-28.basil" });

export const adminRoutes = new Hono()

  // Analytics dashboard stats
  .get("/stats", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const [
      totalUsers,
      goldSparkUsers,
      verifiedUsers,
      pendingVerifications,
      totalEvents,
      totalMatches,
      totalSafetyLogs,
      activeSubs,
    ] = await Promise.all([
      db.$count(users),
      db.$count(users, eq(users.isGoldSpark, true)),
      db.$count(users, eq(users.verificationStatus, "verified")),
      db.$count(users, eq(users.verificationStatus, "pending")),
      db.$count(events),
      db.$count(connections, eq(connections.status, "matched")),
      db.$count(safetyLogs),
      db.$count(stripeSubscriptions, eq(stripeSubscriptions.status, "active")),
    ]);

    // MRR from Stripe
    let mrr = 0;
    try {
      const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
      mrr = subs.data.reduce((acc, sub) => {
        const amount = sub.items.data[0]?.price?.unit_amount || 0;
        return acc + amount / 100;
      }, 0);
    } catch {}

    return c.json({
      totalUsers,
      goldSparkUsers,
      verifiedUsers,
      pendingVerifications,
      totalEvents,
      totalMatches,
      totalSafetyLogs,
      activeSubs,
      mrr,
    }, 200);
  })

  // Get all users
  .get("/users", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true, name: true, email: true, username: true, role: true,
        isGoldSpark: true, verificationStatus: true, responseScore: true,
        createdAt: true,
      },
    });

    return c.json(allUsers, 200);
  })

  // Update user role / suspend
  .patch("/users/:id", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const { id } = c.req.param();
    const body = await c.req.json();

    await db.update(users).set({
      ...(body.role && { role: body.role }),
      ...(body.isGoldSpark !== undefined && { isGoldSpark: body.isGoldSpark }),
      ...(body.verificationStatus && { verificationStatus: body.verificationStatus }),
      updatedAt: new Date(),
    }).where(eq(users.id, id));

    return c.json({ success: true }, 200);
  })

  // Verification queue
  .get("/verification-queue", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const pending = await db.query.users.findMany({
      where: eq(users.verificationStatus, "pending"),
      columns: {
        id: true, name: true, email: true, selfieUrl: true,
        idDocumentUrl: true, createdAt: true,
      },
      orderBy: [desc(users.createdAt)],
    });

    return c.json(pending, 200);
  })

  // Approve / reject verification
  .post("/verify/:id", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const { id } = c.req.param();
    const { action } = await c.req.json(); // "approve" | "reject"

    const status = action === "approve" ? "verified" : "rejected";

    await db.update(users).set({
      verificationStatus: status,
      ...(action === "approve" && { verifiedAt: new Date() }),
      updatedAt: new Date(),
    }).where(eq(users.id, id));

    return c.json({ success: true, status }, 200);
  })

  // Safety logs
  .get("/safety-logs", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin" && role !== "marshal") return c.json({ error: "Forbidden" }, 403);

    const logs = await db.query.safetyLogs.findMany({
      orderBy: [desc(safetyLogs.createdAt)],
      limit: 100,
    });

    return c.json(logs, 200);
  })

  // Resolve safety log
  .patch("/safety-logs/:id/resolve", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin" && role !== "marshal") return c.json({ error: "Forbidden" }, 403);

    const { id } = c.req.param();
    await db.update(safetyLogs).set({ resolved: true }).where(eq(safetyLogs.id, id));

    return c.json({ success: true }, 200);
  })

  // Revenue / subscriptions
  .get("/revenue", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const subs = await db.query.stripeSubscriptions.findMany({
      orderBy: [desc(stripeSubscriptions.createdAt)],
      limit: 100,
    });

    return c.json(subs, 200);
  });
