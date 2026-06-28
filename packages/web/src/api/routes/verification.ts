import { Hono } from "hono";
import { db } from "../database";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

export const verificationRoutes = new Hono()

  // Submit selfie URL (from file upload)
  .post("/selfie", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { selfieUrl } = await c.req.json();
    await db.update(users)
      .set({ selfieUrl, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return c.json({ success: true }, 200);
  })

  // Submit ID document URL
  .post("/id-document", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { idDocumentUrl } = await c.req.json();

    // Mark as pending once both are submitted
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const newStatus = user?.selfieUrl ? "pending" : "unverified";

    await db.update(users)
      .set({ idDocumentUrl, verificationStatus: newStatus, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return c.json({ success: true, status: newStatus }, 200);
  })

  // Get verification status
  .get("/status", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { verificationStatus: true, selfieUrl: true, idDocumentUrl: true, verifiedAt: true },
    });

    return c.json(user, 200);
  });
