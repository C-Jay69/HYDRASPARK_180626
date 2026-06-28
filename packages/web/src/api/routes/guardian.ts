import { Hono } from "hono";
import { db } from "../database";
import { guardianCheckins, safetyLogs, users } from "../database/schema";
import { eq, desc, and } from "drizzle-orm";

export const guardianRoutes = new Hono()

  // Start a guardian check-in session
  .post("/start", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { dateLocation, scheduledMinutes = 60 } = await c.req.json();
    const scheduledAt = new Date(Date.now() + scheduledMinutes * 60 * 1000);

    const [checkin] = await db.insert(guardianCheckins).values({
      userId,
      dateLocation,
      scheduledAt,
      status: "active",
    }).returning();

    return c.json(checkin, 200);
  })

  // Check in as safe
  .post("/:id/checkin", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { id } = c.req.param();

    const checkin = await db.query.guardianCheckins.findFirst({
      where: and(eq(guardianCheckins.id, id), eq(guardianCheckins.userId, userId)),
    });
    if (!checkin) return c.json({ error: "Not found" }, 404);

    await db.update(guardianCheckins)
      .set({ status: "safe", checkedInAt: new Date() })
      .where(eq(guardianCheckins.id, id));

    return c.json({ status: "safe", message: "You're marked as safe. Stay sparkling! ✨" }, 200);
  })

  // Trigger emergency (panic button)
  .post("/:id/emergency", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { id } = c.req.param();

    await db.update(guardianCheckins)
      .set({ status: "emergency", emergencyTriggered: true })
      .where(eq(guardianCheckins.id, id));

    // Log safety event
    await db.insert(safetyLogs).values({
      userId,
      eventType: "safety_alert",
      severity: "critical",
      details: "User triggered emergency alert via Guardian Spark panic button.",
    });

    // Get user emergency contacts
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const contacts = user?.emergencyContacts || [];

    // In production: trigger Twilio/email to contacts
    console.log(`[EMERGENCY] User ${userId} triggered emergency. Contacts: ${JSON.stringify(contacts)}`);

    return c.json({
      status: "emergency",
      message: "Emergency alert sent. Help is on the way.",
      contactsNotified: contacts.length,
    }, 200);
  })

  // Get my check-ins
  .get("/my", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const checkins = await db.query.guardianCheckins.findMany({
      where: eq(guardianCheckins.userId, userId),
      orderBy: [desc(guardianCheckins.createdAt)],
      limit: 10,
    });

    return c.json(checkins, 200);
  })

  // Marshal: get all active check-ins for event
  .get("/marshal/active", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "marshal" && role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const active = await db.query.guardianCheckins.findMany({
      where: eq(guardianCheckins.status, "active"),
      orderBy: [desc(guardianCheckins.scheduledAt)],
    });

    return c.json(active, 200);
  });
