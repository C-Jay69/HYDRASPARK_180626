import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://hydraspark.app",
    "X-Title": "HydraSpark",
  },
});

export async function moderateMessage(message: string): Promise<{ safe: boolean; flags: string[]; reason?: string }> {
  const redFlagPatterns = [
    { pattern: /send\s*money/i, label: "money request" },
    { pattern: /gift\s*card/i, label: "gift card scam" },
    { pattern: /whatsapp\s*me/i, label: "off-platform redirect" },
    { pattern: /password/i, label: "password phishing" },
    { pattern: /credit\s*card/i, label: "financial data" },
    { pattern: /urgent\s*help/i, label: "urgency manipulation" },
    { pattern: /invest\s*in/i, label: "investment scam" },
    { pattern: /crypto/i, label: "crypto scam" },
    { pattern: /bitcoin/i, label: "crypto scam" },
    { pattern: /venmo|cashapp|zelle/i, label: "payment app redirect" },
    { pattern: /my\s*address/i, label: "personal info sharing" },
  ];

  const flags = redFlagPatterns
    .filter(({ pattern }) => pattern.test(message))
    .map(({ label }) => label);

  if (flags.length > 0) {
    return { safe: false, flags, reason: `Detected: ${flags.join(", ")}` };
  }

  // AI moderation for edge cases
  try {
    const response = await openrouter.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: `You are a safety moderator for a dating app. Analyze the message for scams, harassment, inappropriate content, or dangerous behavior. Respond with JSON only: {"safe": true/false, "reason": "explanation if unsafe"}`,
        },
        { role: "user", content: `Message: "${message}"` },
      ],
      max_tokens: 100,
    });

    const text = response.choices[0]?.message?.content || '{"safe": true}';
    const result = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return { safe: result.safe ?? true, flags: [], reason: result.reason };
  } catch {
    return { safe: true, flags: [] };
  }
}

export async function generateVirtualDatePrompt(interests: string[], vibeScore: number): Promise<string[]> {
  try {
    const response = await openrouter.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: "You are a creative date conversation prompt generator for a premium dating app. Generate fun, engaging conversation starters.",
        },
        {
          role: "user",
          content: `Generate 5 creative virtual date conversation prompts for two people with a ${vibeScore}% vibe score who share interests in: ${interests.join(", ")}. Return as a JSON array of strings.`,
        },
      ],
      max_tokens: 300,
    });
    const text = response.choices[0]?.message?.content || "[]";
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      "What's the most spontaneous thing you've ever done?",
      "If you could have dinner with anyone, dead or alive, who would it be?",
      "What's your idea of a perfect weekend?",
      "What's something most people don't know about you?",
      "If you could master any skill instantly, what would it be?",
    ];
  }
}
