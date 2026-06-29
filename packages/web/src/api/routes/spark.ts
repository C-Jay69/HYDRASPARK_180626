import { Hono } from "hono";
import { db } from "../database";
import { users, sparkPointsLedger } from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { awardSparkPoints, redeemSparkPoints, POINT_VALUES } from "../lib/spark-points";

export const sparkRoutes = new Hono()

  // Get user's spark points + ledger
  .get("/ledger", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const entries = await db.query.sparkPointsLedger.findMany({
      where: eq(sparkPointsLedger.userId, userId),
      orderBy: [desc(sparkPointsLedger.createdAt)],
      limit: 50,
    });

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

    return c.json({
      balance: user?.sparkPoints || 0,
      level: user?.sparkLevel || 1,
      xp: user?.sparkXp || 0,
      badges: user?.sparkBadges || [],
      entries: entries.map((e) => ({
        action: e.action,
        points: e.points,
        metadata: e.metadata,
        createdAt: e.createdAt,
      })),
    });
  })

  // Redeem spark points
  .post("/redeem", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { rewardId } = await c.req.json();

    const REWARD_COSTS: Record<string, number> = {
      profile_boost:  100,
      super_swipe:     50,
      event_discount:  75,
      gold_trial_3d:  200,
      guardian_month: 150,
    };

    const cost = REWARD_COSTS[rewardId];
    if (!cost) return c.json({ error: "Invalid reward" }, 400);

    try {
      const result = await redeemSparkPoints(userId, cost, rewardId);
      return c.json(result);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  })

  // Award points manually (internal / admin)
  .post("/award", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { action, targetUserId } = await c.req.json();
    const awardTo = targetUserId || userId;

    const points = POINT_VALUES[action];
    if (!points) return c.json({ error: "Unknown action" }, 400);

    await awardSparkPoints(awardTo, action);
    return c.json({ success: true, awarded: points });
  })

  // Daily login check-in
  .post("/daily-checkin", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    // Check last login entry to prevent double-award
    const last = await db.query.sparkPointsLedger.findFirst({
      where: eq(sparkPointsLedger.userId, userId),
      orderBy: [desc(sparkPointsLedger.createdAt)],
    });

    const lastDate = last?.createdAt ? new Date(last.createdAt).toDateString() : null;
    const today = new Date().toDateString();

    if (lastDate === today) {
      return c.json({ alreadyClaimed: true, message: "Come back tomorrow!" });
    }

    await awardSparkPoints(userId, "daily_login", 5, { date: today });
    return c.json({ awarded: 5, message: "+5 Spark Points for logging in!" });
  });
