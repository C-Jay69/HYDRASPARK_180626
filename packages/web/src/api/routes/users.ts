import { Hono } from "hono";
import { db } from "../database";
import { users, connections, vibeScores } from "../database/schema";
import { eq, ne, and, or, notInArray, sql } from "drizzle-orm";
import { calculateVibeScore } from "../lib/vibe-score";

export const usersRoutes = new Hono()

  // Get current user profile
  .get("/me", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return c.json({ error: "Not found" }, 404);

    const { passwordHash, ...safe } = user;
    return c.json(safe, 200);
  })

  // Update profile
  .patch("/me", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const { name, bio, age, location, interests, language, zenModeEnabled, zenDailyLimit, emergencyContacts } = body;

    await db.update(users).set({
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(age !== undefined && { age }),
      ...(location !== undefined && { location }),
      ...(interests && { interests }),
      ...(language && { language }),
      ...(zenModeEnabled !== undefined && { zenModeEnabled }),
      ...(zenDailyLimit !== undefined && { zenDailyLimit }),
      ...(emergencyContacts && { emergencyContacts }),
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    return c.json({ success: true }, 200);
  })

  // Save vibe answers
  .post("/me/vibe-answers", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { answers } = await c.req.json();
    await db.update(users).set({ vibeAnswers: answers, updatedAt: new Date() }).where(eq(users.id, userId));

    return c.json({ success: true }, 200);
  })

  // Get discovery feed (users to swipe on)
  .get("/discover", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    // Find already-connected users
    const existingConnections = await db.query.connections.findMany({
      where: or(eq(connections.userA, userId), eq(connections.userB, userId)),
    });

    const seenIds = existingConnections.flatMap(c => [c.userA, c.userB]).filter(id => id !== userId);

    const discoverUsers = await db.query.users.findMany({
      where: and(
        ne(users.id, userId),
        seenIds.length > 0 ? notInArray(users.id, seenIds) : undefined,
      ),
      limit: 20,
      columns: {
        id: true, name: true, username: true, bio: true, age: true,
        location: true, avatarUrl: true, interests: true,
        isGoldSpark: true, verificationStatus: true, responseScore: true,
      },
    });

    // Attach vibe scores
    const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const withScores = await Promise.all(
      discoverUsers.map(async (u) => {
        let vibeScore = 50;
        if ((currentUser?.vibeAnswers || []).length > 0) {
          vibeScore = await calculateVibeScore(userId, u.id);
        }
        return { ...u, vibeScore };
      })
    );

    withScores.sort((a, b) => b.vibeScore - a.vibeScore);
    return c.json(withScores, 200);
  })

  // Swipe / connect
  .post("/connect", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { targetUserId, action } = await c.req.json(); // action: "like" | "pass"
    if (userId === targetUserId) return c.json({ error: "Cannot swipe yourself" }, 400);

    if (action === "pass") return c.json({ status: "passed", match: false }, 200);

    const pair = [userId, targetUserId].sort();
    const [userA, userB] = pair;

    const existing = await db.query.connections.findFirst({
      where: and(eq(connections.userA, userA), eq(connections.userB, userB)),
    });

    if (!existing) {
      await db.insert(connections).values({ userA, userB, status: "pending" });
      return c.json({ status: "pending", match: false }, 200);
    }

    if (existing.status === "blocked") return c.json({ error: "Connection blocked" }, 400);

    if (existing.status === "pending") {
      const score = await calculateVibeScore(userId, targetUserId);
      await db.update(connections)
        .set({ status: "matched", vibeScoreAtMatch: score, matchedAt: new Date() })
        .where(eq(connections.id, existing.id));
      return c.json({ status: "matched", match: true, vibeScore: score }, 200);
    }

    return c.json({ status: existing.status, match: false }, 200);
  })

  // Get matches
  .get("/matches", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const matches = await db.query.connections.findMany({
      where: and(
        or(eq(connections.userA, userId), eq(connections.userB, userId)),
        eq(connections.status, "matched"),
      ),
    });

    const matchedUserIds = matches.map(m => m.userA === userId ? m.userB : m.userA);

    const matchedUsers = await Promise.all(
      matches.map(async (m) => {
        const otherId = m.userA === userId ? m.userB : m.userA;
        const other = await db.query.users.findFirst({
          where: eq(users.id, otherId),
          columns: { id: true, name: true, avatarUrl: true, isGoldSpark: true, verificationStatus: true, responseScore: true },
        });
        return { connectionId: m.id, user: other, vibeScore: m.vibeScoreAtMatch, matchedAt: m.matchedAt };
      })
    );

    return c.json(matchedUsers, 200);
  })

  // Get user by ID
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true, name: true, username: true, bio: true, age: true,
        location: true, avatarUrl: true, interests: true,
        isGoldSpark: true, verificationStatus: true, responseScore: true,
        createdAt: true,
      },
    });
    if (!user) return c.json({ error: "Not found" }, 404);
    return c.json(user, 200);
  });
