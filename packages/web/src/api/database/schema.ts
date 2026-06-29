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
export const transactionTypeEnum = pgEnum("transaction_type", [
  "gold_monthly", "gold_quarterly", "verification", "verification_expedited",
  "super_swipe", "profile_boost", "spark_emote", "gift_card", "event_ticket"
]);
export const pointsActionEnum = pgEnum("points_action", [
  "complete_profile", "verify_id", "attend_event", "check_in_safe",
  "daily_login", "get_matched", "referral", "send_messages", "redeem"
]);

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
  goldSparkTier: text("gold_spark_tier"), // 'monthly' | 'quarterly'
  goldSparkExpiry: timestamp("gold_spark_expiry"),
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
  // Spark Points & Gamification
  sparkPoints: integer("spark_points").default(0),
  sparkXp: integer("spark_xp").default(0),
  sparkLevel: integer("spark_level").default(1),
  sparkBadges: jsonb("spark_badges").$type<string[]>().default([]),
  totalEventsAttended: integer("total_events_attended").default(0),
  // Referral
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by"),
  referralCount: integer("referral_count").default(0),
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
  venueId: uuid("venue_id"),
  date: timestamp("date").notNull(),
  maxAttendees: integer("max_attendees").notNull(),
  premiumOnly: boolean("premium_only").default(false),
  premiumEarlyAccessHours: integer("premium_early_access_hours").default(2),
  goldPresaleStart: timestamp("gold_presale_start"), // T-10 days, Gold only window
  generalSaleStart: timestamp("general_sale_start"), // T-10 days + 2hrs
  ticketPrice: real("ticket_price").default(0),
  vipPrice: real("vip_price"),                       // VIP upsell
  stripePriceId: text("stripe_price_id"),
  imageUrl: text("image_url"),
  category: text("category"),                         // speed_dating | mixer | gala | dinner | day_trip | corporate
  venueType: text("venue_type"),                      // silver | gold | platinum
  dynamicPricing: boolean("dynamic_pricing").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Bookings
export const eventBookings = pgTable("event_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  status: bookingStatusEnum("status").default("confirmed"),
  isVip: boolean("is_vip").default(false),
  priorityScore: integer("priority_score").default(0),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  checkedInAt: timestamp("checked_in_at"),
  zone: text("zone"),
  bookedAt: timestamp("booked_at").defaultNow(),
});

// Stripe Subscriptions (Gold Spark)
export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubId: text("stripe_sub_id").notNull().unique(),
  status: subStatusEnum("status").default("active"),
  plan: text("plan").default("gold_spark"), // gold_monthly | gold_quarterly
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Micro-transactions (one-time purchases)
export const microTransactions = pgTable("micro_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: integer("amount").notNull(), // cents
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spark Points Ledger
export const sparkPointsLedger = pgTable("spark_points_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  action: pointsActionEnum("action").notNull(),
  points: integer("points").notNull(), // positive = earned, negative = redeemed
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Venues (for event partnerships)
export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  capacity: integer("capacity"),
  rating: real("rating"),
  tier: text("tier").default("silver"), // silver | gold | platinum
  outreachStatus: text("outreach_status").default("pending"), // pending | emailed | followed_up | contracted
  contactEmail: text("contact_email"),
  revenueSharePercent: integer("revenue_share_percent").default(30),
  placeId: text("place_id"),
  photoUrl: text("photo_url"),
  contracted: boolean("contracted").default(false),
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
  microTransactions: many(microTransactions),
  sparkPointsLedger: many(sparkPointsLedger),
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

export const microTransactionsRelations = relations(microTransactions, ({ one }) => ({
  user: one(users, { fields: [microTransactions.userId], references: [users.id] }),
}));

export const sparkPointsLedgerRelations = relations(sparkPointsLedger, ({ one }) => ({
  user: one(users, { fields: [sparkPointsLedger.userId], references: [users.id] }),
}));
