import { Hono } from "hono";
import Stripe from "stripe";
import { db } from "../database";
import { users, stripeSubscriptions } from "../database/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-05-28.basil" });

export const paymentsRoutes = new Hono()

  // Create Gold Spark checkout session
  .post("/gold-spark/checkout", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return c.json({ error: "User not found" }, 404);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
    }

    const appUrl = process.env.VITE_APP_URL || "http://localhost:4200";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Gold Spark — HydraSpark Premium", description: "Priority meetup access, verification badge, unlimited swipes, virtual dates." },
            unit_amount: 1999, // $19.99/month
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/premium?success=true`,
      cancel_url: `${appUrl}/premium?cancelled=true`,
      metadata: { userId },
    });

    return c.json({ url: session.url }, 200);
  })

  // Create event ticket checkout
  .post("/event/:eventId/checkout", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { eventId } = c.req.param();
    const appUrl = process.env.VITE_APP_URL || "http://localhost:4200";

    const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
    if (!event) return c.json({ error: "Event not found" }, 404);

    if (!event.ticketPrice || event.ticketPrice === 0) {
      return c.json({ error: "This event is free — use the book endpoint directly" }, 400);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `HydraSpark Event: ${event.title}`, description: `${event.location} — ${event.date}` },
            unit_amount: Math.round(event.ticketPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/meetups/${eventId}?booked=true`,
      cancel_url: `${appUrl}/meetups/${eventId}`,
      metadata: { userId, eventId },
    });

    return c.json({ url: session.url }, 200);
  })

  // Stripe webhook
  .post("/webhook", async (c) => {
    const sig = c.req.header("stripe-signature");
    const body = await c.req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return c.json({ error: `Webhook error: ${err.message}` }, 400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) return c.json({ received: true }, 200);

      if (session.mode === "subscription") {
        const subId = session.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subId);

        await db.update(users).set({ isGoldSpark: true }).where(eq(users.id, userId));
        await db.insert(stripeSubscriptions).values({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubId: subId,
          status: "active",
          plan: "gold_spark",
          currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await db.query.stripeSubscriptions.findFirst({
        where: eq(stripeSubscriptions.stripeSubId, sub.id),
      });
      if (existing) {
        await db.update(stripeSubscriptions).set({ status: "cancelled" }).where(eq(stripeSubscriptions.stripeSubId, sub.id));
        await db.update(users).set({ isGoldSpark: false }).where(eq(users.id, existing.userId));
      }
    }

    return c.json({ received: true }, 200);
  });
