import { Hono } from "hono";
import { db } from "../database";
import { messages, connections } from "../database/schema";
import { eq, and, or, asc } from "drizzle-orm";
import { moderateMessage } from "../lib/openrouter";

export const messagesRoutes = new Hono()

  // Get messages for a connection
  .get("/:connectionId", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { connectionId } = c.req.param();

    // Verify user is part of this connection
    const connection = await db.query.connections.findFirst({
      where: and(
        eq(connections.id, connectionId),
        or(eq(connections.userA, userId), eq(connections.userB, userId)),
      ),
    });
    if (!connection) return c.json({ error: "Not found" }, 404);

    const msgs = await db.query.messages.findMany({
      where: eq(messages.connectionId, connectionId),
      orderBy: [asc(messages.createdAt)],
      limit: 100,
    });

    return c.json(msgs, 200);
  })

  // Send a message (REST fallback — real-time via Socket.io)
  .post("/", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { connectionId, text } = await c.req.json();

    // Verify connection and match status
    const connection = await db.query.connections.findFirst({
      where: and(
        eq(connections.id, connectionId),
        or(eq(connections.userA, userId), eq(connections.userB, userId)),
        eq(connections.status, "matched"),
      ),
    });
    if (!connection) return c.json({ error: "Must be matched to message" }, 403);

    // GuardianSpark moderation
    const safety = await moderateMessage(text);
    if (!safety.safe) {
      return c.json({ error: `Message blocked by Guardian Spark: ${safety.reason || safety.flags.join(", ")}` }, 400);
    }

    const [msg] = await db.insert(messages).values({
      connectionId,
      senderId: userId,
      text,
      isFlagged: false,
    }).returning();

    return c.json(msg, 200);
  });
