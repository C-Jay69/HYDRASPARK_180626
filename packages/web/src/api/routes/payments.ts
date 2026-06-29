import { Hono } from "hono";
import Stripe from "stripe";
import { db } from "../database";
import { users, stripeSubscriptions, microTransactions, sparkPointsLedger, eventBookings, events } from "../database/schema";
import { eq } from "drizzle-orm";
import { awardSparkPoints } from "../lib/spark-points";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-05-28.basil" });

// Pricing constants
const PRICES = {
  gold_monthly:           { amount: 1999, name: "Gold Spark — Monthly",    interval: "month" as const },
  gold_quarterly:         { amount: 4999, name: "Gold Spark — Quarterly",  interval: "month" as const, intervalCount: 3 },
  verification:           { amount:  999, name: "ID Verification",          oneTime: true },
  verification_expedited: { amount: 1499, name: "ID Verification (24hr)",   oneTime: true },
  super_swipe:            { amount:  199, name: "Super Swipe",              oneTime: true },
  profile_boost_24h:      { amount:  499, name: "Profile Boost (24hr)",     oneTime: true },
  spark_emotes:           { amount:   99, name: "Spark Emote Pack",         oneTime: true },
  gift_card_roses:        { amount:  199, name: "Virtual Roses Gift Card",  oneTime: true },
};

async function getOrCreateCustomer(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) return { customerId: user.stripeCustomerId, user };

  const customer = await stripe.customers.create({ email: user.email, name: user.name });
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  return { customerId: customer.id, user: { ...user, stripeCustomerId: customer.id } };
}

export const paymentsRoutes = new Hono()

  // ── Gold Spark Monthly Checkout ──────────────────────────────────────────
  .post("/gold-spark/checkout", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => ({}));
    const plan = body.plan === "quarterly" ? "gold_quarterly" : "gold_monthly";

    const { customerId } = await getOrCreateCustomer(userId);
    const appUrl = process.env.VITE_APP_URL || "http://localhost:4200";
    const p = PRICES[plan as keyof typeof PRICES] as any;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: p.name,
            description: "Priority booking • Unlimited swipes • Gold badge • See who liked you • Advanced filters",
          },
          unit_amount: p.amount,
          recurring: { interval: p.interval, interval_count: p.intervalCount || 1 },
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/premium?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/premium?cancelled=true`,
      metadata: { userId, plan },
    });

    return c.json({ url: session.url }, 200);
  })

  // ── Verification Checkout ────────────────────────────────────────────────
  .post("/verification/checkout", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => ({}));
    const expedited = body.expedited === true;
    const type = expedited ? "verification_expedited" : "verification";
    const p = PRICES[type];
    const { customerId } = await getOrCreateCustomer(userId);
    const appUrl = process.env.VITE_APP_URL || "http://localhost:4200";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: p.name,
            description: expedited
              ? "Verified badge within 24 hours + Country Club event access"
              : "Verified badge within 72 hours + Country Club event access",
          },
          unit_amount: p.amount,
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/verification?success=true`,
      cancel_url: `${appUrl}/verification`,
      metadata: { userId, type },
    });

    return c.json({ url: session.url }, 200);
  })

  // ── Micro-transaction Checkout (super swipe, boost, emotes, gifts) ───────
  .post("/micro/checkout", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => ({}));
    const { item } = body; // 'super_swipe' | 'profile_boost_24h' | 'spark_emotes' | 'gift_card_roses'

    const p = PRICES[item as keyof typeof PRICES] as any;
    if (!p || !p.oneTime) return c.json({ error: "Invalid item" }, 400);

    const { customerId } = await getOrCreateCustomer(userId);
    const appUrl = process.env.VITE_APP_URL || "http://localhost:4200";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: p.name },
          unit_amount: p.amount,
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/discover?item=${item}&success=true`,
      cancel_url: `${appUrl}/discover`,
      metadata: { userId, type: item },
    });

    return c.json({ url: session.url }, 200);
  })

  // ── Event Ticket Checkout ────────────────────────────────────────────────
  .post("/event/:eventId/checkout", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { eventId } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const isVip = body.vip === true;
    const appUrl = process.env.VITE_APP_URL || "http://localhost:4200";

    const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
    if (!event) return c.json({ error: "Event not found" }, 404);

    const price = isVip ? (event.vipPrice || event.ticketPrice) : event.ticketPrice;
    if (!price || price === 0) {
      return c.json({ error: "Free event — use /book directly" }, 400);
    }

    // Priority booking enforcement
    const now = new Date();
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (event.goldPresaleStart && event.generalSaleStart) {
      if (now >= event.goldPresaleStart && now < event.generalSaleStart) {
        if (!user?.isGoldSpark) {
          return c.json({ error: "Gold Spark members only during pre-sale. Upgrade to book early!" }, 403);
        }
      }
    }

    const { customerId } = await getOrCreateCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: isVip ? `VIP — ${event.title}` : event.title,
            description: `${event.location} • ${new Date(event.date).toLocaleDateString()}`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/meetups/${eventId}?booked=true`,
      cancel_url: `${appUrl}/meetups/${eventId}`,
      metadata: { userId, eventId, type: "event_ticket", isVip: String(isVip) },
    });

    return c.json({ url: session.url }, 200);
  })

  // ── Stripe Webhook ───────────────────────────────────────────────────────
  .post("/webhook", async (c) => {
    const sig = c.req.header("stripe-signature");
    const body = await c.req.text();

    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return c.json({ error: `Webhook error: ${err.message}` }, 400);
    }

    switch (stripeEvent.type) {

      // ── Checkout completed ──────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const type = session.metadata?.type || session.metadata?.plan;
        if (!userId) break;

        // Gold subscription
        if (session.mode === "subscription") {
          const plan = session.metadata?.plan || "gold_monthly";
          const subId = session.subscription as string;
          const sub = await stripe.subscriptions.retrieve(subId);
          const isQuarterly = plan === "gold_quarterly";

          const expiry = new Date((sub as any).current_period_end * 1000);

          await db.update(users).set({
            isGoldSpark: true,
            goldSparkTier: isQuarterly ? "quarterly" : "monthly",
            goldSparkExpiry: expiry,
          }).where(eq(users.id, userId));

          // Upsert subscription record
          await db.insert(stripeSubscriptions).values({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubId: subId,
            status: "active",
            plan,
            currentPeriodEnd: expiry,
          }).onConflictDoUpdate({
            target: stripeSubscriptions.stripeSubId,
            set: { status: "active", currentPeriodEnd: expiry },
          });

          // Award 100 spark points for going Gold
          await awardSparkPoints(userId, "complete_profile", 100, { reason: "gold_upgrade" });
        }

        // One-time payments
        if (session.mode === "payment") {
          const piId = session.payment_intent as string;

          // Verification
          if (type === "verification" || type === "verification_expedited") {
            await db.update(users).set({ verificationStatus: "pending" }).where(eq(users.id, userId));
            await db.insert(microTransactions).values({
              userId,
              type: type as any,
              stripePaymentIntentId: piId,
              amount: type === "verification_expedited" ? 1499 : 999,
              metadata: { expedited: type === "verification_expedited" },
            });
            // Award 50 spark points for starting verification
            await awardSparkPoints(userId, "verify_id", 50, { reason: "verification_paid" });
          }

          // Event ticket
          if (type === "event_ticket") {
            const eventId = session.metadata?.eventId!;
            const isVip = session.metadata?.isVip === "true";
            await db.insert(eventBookings).values({
              eventId,
              userId,
              status: "confirmed",
              isVip,
              stripePaymentIntentId: piId,
            });
            await db.insert(microTransactions).values({
              userId,
              type: "event_ticket",
              stripePaymentIntentId: piId,
              amount: Math.round((stripeEvent.data.object as any).amount_total),
              metadata: { eventId, isVip },
            });
          }

          // Micro-transactions
          if (["super_swipe", "profile_boost_24h", "spark_emotes", "gift_card_roses"].includes(type || "")) {
            const priceKey = type as keyof typeof PRICES;
            await db.insert(microTransactions).values({
              userId,
              type: type === "profile_boost_24h" ? "profile_boost" : type as any,
              stripePaymentIntentId: piId,
              amount: PRICES[priceKey]?.amount || 0,
              metadata: { activatedAt: new Date().toISOString() },
            });
          }
        }
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object as Stripe.Subscription;
        const existing = await db.query.stripeSubscriptions.findFirst({
          where: eq(stripeSubscriptions.stripeSubId, sub.id),
        });
        if (existing) {
          await db.update(stripeSubscriptions)
            .set({ status: "cancelled" })
            .where(eq(stripeSubscriptions.stripeSubId, sub.id));
          await db.update(users)
            .set({ isGoldSpark: false, goldSparkTier: null, goldSparkExpiry: null })
            .where(eq(users.id, existing.userId));
        }
        break;
      }

      // ── Subscription renewed ─────────────────────────────────────────────
      case "customer.subscription.updated": {
        const sub = stripeEvent.data.object as Stripe.Subscription;
        const existing = await db.query.stripeSubscriptions.findFirst({
          where: eq(stripeSubscriptions.stripeSubId, sub.id),
        });
        if (existing) {
          const newExpiry = new Date((sub as any).current_period_end * 1000);
          await db.update(stripeSubscriptions)
            .set({ status: sub.status as any, currentPeriodEnd: newExpiry })
            .where(eq(stripeSubscriptions.stripeSubId, sub.id));
          await db.update(users)
            .set({ goldSparkExpiry: newExpiry, isGoldSpark: sub.status === "active" })
            .where(eq(users.id, existing.userId));
        }
        break;
      }
    }

    return c.json({ received: true }, 200);
  })

  // ── Get pricing info (public) ────────────────────────────────────────────
  .get("/pricing", async (c) => {
    return c.json({
      plans: [
        {
          id: "standard",
          name: "Standard",
          price: 0,
          period: null,
          features: [
            "15 swipes/day",
            "Basic profile",
            "Standard event access",
            "Basic matching",
          ],
          cta: "Start Free",
          highlight: false,
        },
        {
          id: "gold_monthly",
          name: "Gold Spark",
          price: 19.99,
          period: "/mo",
          quarterlyPrice: 49.99,
          quarterlyPeriod: "/quarter",
          features: [
            "Unlimited swipes",
            "Gold Spark badge",
            "2hr priority event booking",
            "See who liked you",
            "Advanced filters",
            "Read receipts",
            "Weekly profile boost",
          ],
          cta: "Go Gold",
          highlight: true,
        },
        {
          id: "verification",
          name: "Verified",
          price: 9.99,
          period: "one-time",
          expeditedPrice: 14.99,
          features: [
            "ID Verified badge",
            "Country Club event access",
            "Higher VibeScore weighting",
            "Priority trust ranking",
            "Expedited option: 24hr ($14.99)",
          ],
          cta: "Get Verified",
          highlight: false,
        },
      ],
      microTransactions: [
        { id: "super_swipe",        name: "Super Swipe",          price: 1.99 },
        { id: "profile_boost_24h",  name: "Profile Boost (24hr)", price: 4.99 },
        { id: "spark_emotes",       name: "Spark Emote Pack",     price: 0.99 },
        { id: "gift_card_roses",    name: "Virtual Roses",        price: 1.99 },
      ],
    });
  });
