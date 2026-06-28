import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword() {},
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user" },
      isGoldSpark: { type: "boolean", defaultValue: false },
      verificationStatus: { type: "string", defaultValue: "unverified" },
      responseScore: { type: "number", defaultValue: 100 },
      username: { type: "string", required: false },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4200",
});
