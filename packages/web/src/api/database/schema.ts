import {
  pgTable, text, integer, boolean, timestamp, real, jsonb, pgEnum, uuid
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const verificationStatusEnum = pgEnum("verification_status", ["unverified", "pending", "verified", "rejected"]);
export const connectionStatusEnum = pgEnum("connection_status", ["pending", "matched", "blocked"]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);
export const safetyEventEnum = pgEnum("safety_event", ["behavior_flag", "safety_alert", "identity_mismatch", "checkin_missed"]);
export const roleEnum = pgEnum("user_role", ["user", "admin", "marshal", "organiser"]);
export const guardianStatusEnum = pgEnum("guardian_status", ["active", "safe", "missed", "emergency"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled", "waitlist"]);
export const subStatusEnum = pgEnum("sub_status", ["active", "cancelled", "past_due"]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  name: text("name").notNull(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  bio: text("bio"),
  age: integer("age"),
  location: text("location"),
  avatarUrl: text("avatar_url"),
  interests: jsonb("interests").$type<string[]>().default([]),
  vibeAnswers: jsonb("vibe_answers").$type<string[]>().default([]),
  responseScore: integer("response_score").default(100),
  isGoldSpark: boolean("is_gold_spark").default(false),
  verificationStatus: verificationStatusEnum("verification_status").default("unverified"),
  selfieUrl: text("selfie_url"),
  idDocumentUrl: text("id_document_url"),
  verifiedAt: timestamp("verified_at"),
  role: roleEnum("role").default("user"),
  language: text("language").default("en"),
  zenModeEnabled: boolean("zen_mode_enabled").default(false),
  zenDailyLimit: integer("zen_daily_limit").default(50),
  emergencyContacts: jsonb("emergency_contacts").$type<{ name: string; phone: string; email: string }[]>().default([]),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions (better-auth)
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accounts (better-auth social)
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verifications (better-auth email)
export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connections (swipes/matches)
export const connections = pgTable("connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userA: uuid("user_a").notNull().references(() => users.id),
  userB: uuid("user_b").notNull().references(() => users.id),
  status: connectionStatusEnum("status").default("pending"),
  vibeScoreAtMatch: real("vibe_score_at_match"),
  matchedAt: timestamp("matched_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").notNull().references(() => connections.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  isIcebreaker: boolean("is_icebreaker").default(false),
  isFlagged: boolean("is_flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vibe Scores
export const vibeScores = pgTable("vibe_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userA: uuid("user_a").notNull().references(() => users.id),
  userB: uuid("user_b").notNull().references(() => users.id),
  score: real("score").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Safety Logs
export const safetyLogs = pgTable("safety_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  eventType: safetyEventEnum("event_type").notNull(),
  severity: severityEnum("severity").notNull(),
  details: text("details"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guardian Check-ins
export const guardianCheckins = pgTable("guardian_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  dateLocation: text("date_location"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  checkedInAt: timestamp("checked_in_at"),
  status: guardianStatusEnum("status").default("active"),
  emergencyTriggered: boolean("emergency_triggered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events / Meetups
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  hostId: uuid("host_id").notNull().references(() => users.id),
  location: text("location").notNull(),
  address: text("address"),
  date: timestamp("date").notNull(),
  maxAttendees: integer("max_attendees").notNull(),
  premiumOnly: boolean("premium_only").default(false),
  premiumEarlyAccessHours: integer("premium_early_access_hours").default(2),
  ticketPrice: real("ticket_price").default(0),
  stripePriceId: text("stripe_price_id"),
  imageUrl: text("image_url"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Bookings
export const eventBookings = pgTable("event_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  status: bookingStatusEnum("status").default("confirmed"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  bookedAt: timestamp("booked_at").defaultNow(),
});

// Stripe Subscriptions (Gold Spark)
export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubId: text("stripe_sub_id").notNull().unique(),
  status: subStatusEnum("status").default("active"),
  plan: text("plan").default("gold_spark"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  connectionsAsA: many(connections, { relationName: "userA" }),
  connectionsAsB: many(connections, { relationName: "userB" }),
  messages: many(messages),
  safetyLogs: many(safetyLogs),
  guardianCheckins: many(guardianCheckins),
  hostedEvents: many(events),
  eventBookings: many(eventBookings),
  subscriptions: many(stripeSubscriptions),
}));

export const connectionsRelations = relations(connections, ({ one, many }) => ({
  userA: one(users, { fields: [connections.userA], references: [users.id], relationName: "userA" }),
  userB: one(users, { fields: [connections.userB], references: [users.id], relationName: "userB" }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  connection: one(connections, { fields: [messages.connectionId], references: [connections.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  host: one(users, { fields: [events.hostId], references: [users.id] }),
  bookings: many(eventBookings),
}));

export const eventBookingsRelations = relations(eventBookings, ({ one }) => ({
  event: one(events, { fields: [eventBookings.eventId], references: [events.id] }),
  user: one(users, { fields: [eventBookings.userId], references: [users.id] }),
}));
