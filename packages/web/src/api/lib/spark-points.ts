import { db } from "../database";
import { users, sparkPointsLedger } from "../database/schema";
import { eq, sql } from "drizzle-orm";

// Points per action
export const POINT_VALUES: Record<string, number> = {
  complete_profile:    10,
  verify_id:           50,
  attend_event:        30,
  check_in_safe:       15,
  daily_login:          5,
  get_matched:          5,
  referral:            50,
  send_messages:       10,
};

// XP thresholds per level
export function levelFromXp(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

// Badges unlocked at levels
export const LEVEL_BADGES: Record<number, string> = {
  2:  "rising_spark",
  5:  "connector",
  10: "social_butterfly",
  15: "safety_champion",
  20: "hydra_elite",
};

export async function awardSparkPoints(
  userId: string,
  action: string,
  overridePoints?: number,
  metadata: Record<string, any> = {}
) {
  const points = overridePoints ?? POINT_VALUES[action] ?? 0;
  if (points === 0) return;

  // Insert ledger entry
  await db.insert(sparkPointsLedger).values({
    userId,
    action: action as any,
    points,
    metadata,
  });

  // Update user totals
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return;

  const newPoints = (user.sparkPoints || 0) + points;
  const newXp = (user.sparkXp || 0) + points;
  const newLevel = levelFromXp(newXp);

  const updates: Record<string, any> = {
    sparkPoints: newPoints,
    sparkXp: newXp,
    sparkLevel: newLevel,
  };

  // Unlock badge if level just crossed a threshold
  if (newLevel > (user.sparkLevel || 1) && LEVEL_BADGES[newLevel]) {
    const badges = [...(user.sparkBadges || [])];
    if (!badges.includes(LEVEL_BADGES[newLevel])) {
      badges.push(LEVEL_BADGES[newLevel]);
      updates.sparkBadges = badges;
    }
  }

  await db.update(users).set(updates).where(eq(users.id, userId));
}

export async function redeemSparkPoints(userId: string, cost: number, rewardId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("User not found");
  if ((user.sparkPoints || 0) < cost) throw new Error("Insufficient Spark Points");

  await db.insert(sparkPointsLedger).values({
    userId,
    action: "redeem",
    points: -cost,
    metadata: { rewardId },
  });

  await db.update(users)
    .set({ sparkPoints: sql`${users.sparkPoints} - ${cost}` })
    .where(eq(users.id, userId));

  return { success: true, newBalance: (user.sparkPoints || 0) - cost };
}
