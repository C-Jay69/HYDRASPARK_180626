import { db } from "../database";
import { vibeScores, users } from "../database/schema";
import { eq, or, and } from "drizzle-orm";

export const VIBE_QUESTIONS = [
  { id: 1, question: "Your ideal Saturday is...", options: ["Hiking with friends", "Netflix marathon alone", "Brunch + explore city", "Gaming all day"] },
  { id: 2, question: "Pick your vibe...", options: ["Beach sunset", "Cozy cabin", "City rooftop", "Road trip"] },
  { id: 3, question: "In a group, you're usually...", options: ["The planner", "The joker", "The listener", "The wildcard"] },
  { id: 4, question: "Your love language is...", options: ["Words of affirmation", "Physical touch", "Acts of service", "Quality time"] },
  { id: 5, question: "Pet peeve?", options: ["Bad timekeeping", "Loud chewing", "One-word replies", "Interrupting"] },
  { id: 6, question: "Dealbreaker?", options: ["No ambition", "Bad hygiene", "Never reads", "Glued to phone"] },
  { id: 7, question: "Your communication style...", options: ["Daily good morning texts", "Check in when needed", "Long calls", "Voice notes gang"] },
  { id: 8, question: "Biggest green flag?", options: ["Makes you laugh", "Remembers details", "Ambitious", "Kind to strangers"] },
  { id: 9, question: "First date vibe...", options: ["Coffee and walk", "Fancy dinner", "Activity (bowling etc)", "Picnic in the park"] },
  { id: 10, question: "How do you handle conflict?", options: ["Talk it out immediately", "Need space first", "Avoid it", "Direct and move on"] },
  { id: 11, question: "Night in or night out?", options: ["Night in always", "Night out always", "Depends on mood", "Mix it up weekly"] },
  { id: 12, question: "You feel most like yourself when...", options: ["Creating something", "Helping others", "Learning new things", "Having adventures"] },
];

export async function calculateVibeScore(userAId: string, userBId: string): Promise<number> {
  const [userA, userB] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userAId) }),
    db.query.users.findFirst({ where: eq(users.id, userBId) }),
  ]);

  if (!userA || !userB) return 50;

  const answersA = userA.vibeAnswers || [];
  const answersB = userB.vibeAnswers || [];

  if (answersA.length === 0 || answersB.length === 0) return 50;

  const totalQuestions = Math.min(answersA.length, answersB.length);
  let matches = 0;

  for (let i = 0; i < totalQuestions; i++) {
    if (answersA[i] && answersB[i] && answersA[i] === answersB[i]) matches++;
  }

  const score = Math.round((matches / totalQuestions) * 100);

  // Sort IDs for consistent pair storage
  const pair = [userAId, userBId].sort();

  const existing = await db.query.vibeScores.findFirst({
    where: and(eq(vibeScores.userA, pair[0]), eq(vibeScores.userB, pair[1])),
  });

  if (existing) {
    await db.update(vibeScores)
      .set({ score, calculatedAt: new Date() })
      .where(eq(vibeScores.id, existing.id));
  } else {
    await db.insert(vibeScores).values({ userA: pair[0], userB: pair[1], score });
  }

  return score;
}
