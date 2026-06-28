import { Hono } from "hono";
import { db } from "../database";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";
import { generateVirtualDatePrompt } from "../lib/openrouter";
import { calculateVibeScore } from "../lib/vibe-score";

export const virtualDateRoutes = new Hono()

  // Generate conversation prompts for a virtual date
  .post("/prompts", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { partnerId } = await c.req.json();

    const [me, partner] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, userId) }),
      db.query.users.findFirst({ where: eq(users.id, partnerId) }),
    ]);

    if (!me || !partner) return c.json({ error: "Users not found" }, 404);

    const vibeScore = await calculateVibeScore(userId, partnerId);
    const sharedInterests = (me.interests || []).filter((i: string) =>
      (partner.interests || []).includes(i)
    );
    const allInterests = sharedInterests.length > 0 ? sharedInterests : [...(me.interests || []), ...(partner.interests || [])].slice(0, 5);

    const prompts = await generateVirtualDatePrompt(allInterests, vibeScore);

    return c.json({ prompts, vibeScore, sharedInterests }, 200);
  })

  // Get icebreakers for a match
  .get("/icebreakers/:partnerId", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { partnerId } = c.req.param();
    const vibeScore = await calculateVibeScore(userId, partnerId);

    const templates = [
      { minScore: 80, text: "Our Vibe Score is off the charts! What's your most unpopular opinion?" },
      { minScore: 60, text: "We've got great energy! Tell me something that instantly makes you smile." },
      { minScore: 40, text: "I'm curious about you — what's a skill you're secretly proud of?" },
      { minScore: 0, text: "Hi! What's the story behind your username?" },
    ];

    const template = templates.find(t => vibeScore >= t.minScore) || templates[templates.length - 1];

    return c.json({
      vibeScore,
      icebreakers: [
        template.text,
        "What's the last thing that genuinely surprised you?",
        "If our Vibe Score is your compatibility rating, what would make it 100%?",
      ],
    }, 200);
  });
