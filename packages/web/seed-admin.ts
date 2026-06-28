/**
 * HydraSpark Admin Seed Script
 * Run: bun --env-file=../../.env packages/web/seed-admin.ts
 */
import { db } from "./src/api/database";
import { users } from "./src/api/database/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "/home/user/hydraspark-app/node_modules/.bun/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/password.node.mjs";

const ADMIN_EMAIL = "simon@hydraforge.tech";
const ADMIN_PASSWORD = "HydraSpark@Admin2024!";
const ADMIN_NAME = "Simon (Admin)";

async function seed() {
  console.log("🌱 Seeding admin user...");

  const existing = await db.query.users.findFirst({ where: eq(users.email, ADMIN_EMAIL) });

  if (existing) {
    await db.update(users).set({ role: "admin", emailVerified: true }).where(eq(users.email, ADMIN_EMAIL));
    console.log(`✓ Existing user promoted to admin: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await db.insert(users).values({
    email: ADMIN_EMAIL,
    emailVerified: true,
    name: ADMIN_NAME,
    role: "admin",
    passwordHash,
    language: "en",
  });

  console.log(`✓ Admin seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Login at: /admin/login`);
  process.exit(0);
}

seed().catch(e => { console.error("❌", e.message); process.exit(1); });
