import { Hono } from "hono";
import { db } from "../database";
import { events, eventBookings, users } from "../database/schema";
import { eq, asc, desc, and, sql } from "drizzle-orm";

export const eventsRoutes = new Hono()

  // List all upcoming events
  .get("/", async (c) => {
    const userId = c.req.header("x-user-id");
    const isGoldSpark = c.req.header("x-gold-spark") === "true";
    const now = new Date();

    const allEvents = await db.query.events.findMany({
      orderBy: [asc(events.date)],
    });

    // For each event, attach booking count and whether user booked
    const enriched = await Promise.all(
      allEvents.map(async (event) => {
        const bookingCount = await db.$count(eventBookings, eq(eventBookings.eventId, event.id));
        const userBooked = userId
          ? !!(await db.query.eventBookings.findFirst({
              where: and(eq(eventBookings.eventId, event.id), eq(eventBookings.userId, userId)),
            }))
          : false;

        // Priority access: Gold Spark gets 2h head start
        const openTime = event.premiumOnly || isGoldSpark
          ? event.date
          : new Date(event.date.getTime() - (event.premiumEarlyAccessHours || 2) * 3600000);

        const canBook = now >= openTime && bookingCount < event.maxAttendees;

        return {
          ...event,
          bookingCount,
          spotsLeft: event.maxAttendees - bookingCount,
          userBooked,
          canBook,
          isPremiumLocked: event.premiumOnly && !isGoldSpark,
          priorityOpenTime: openTime,
        };
      })
    );

    return c.json(enriched, 200);
  })

  // Get single event
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const event = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!event) return c.json({ error: "Not found" }, 404);

    const bookingCount = await db.$count(eventBookings, eq(eventBookings.eventId, id));
    const attendees = await db.query.eventBookings.findMany({
      where: eq(eventBookings.eventId, id),
      limit: 50,
    });

    return c.json({
      ...event,
      bookingCount,
      spotsLeft: event.maxAttendees - bookingCount,
      attendees,
    }, 200);
  })

  // Create event (organiser/admin)
  .post("/", async (c) => {
    const userId = c.req.header("x-user-id");
    const role = c.req.header("x-user-role");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    if (role !== "organiser" && role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const body = await c.req.json();
    const [event] = await db.insert(events).values({
      ...body,
      hostId: userId,
      date: new Date(body.date),
    }).returning();

    return c.json(event, 200);
  })

  // Book an event
  .post("/:id/book", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { id } = c.req.param();
    const isGoldSpark = c.req.header("x-gold-spark") === "true";

    const event = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!event) return c.json({ error: "Event not found" }, 404);

    if (event.premiumOnly && !isGoldSpark) {
      return c.json({ error: "This event is Gold Spark members only" }, 403);
    }

    // Check priority window
    const now = new Date();
    if (!isGoldSpark && event.premiumEarlyAccessHours) {
      const openTime = new Date(event.date.getTime() - event.premiumEarlyAccessHours * 3600000);
      if (now < openTime) {
        const minutesLeft = Math.ceil((openTime.getTime() - now.getTime()) / 60000);
        return c.json({ error: `Booking opens in ${minutesLeft} minutes for standard members. Gold Spark members have priority access.` }, 403);
      }
    }

    const bookingCount = await db.$count(eventBookings, eq(eventBookings.eventId, id));
    if (bookingCount >= event.maxAttendees) {
      return c.json({ error: "Event is full" }, 400);
    }

    const existing = await db.query.eventBookings.findFirst({
      where: and(eq(eventBookings.eventId, id), eq(eventBookings.userId, userId)),
    });
    if (existing) return c.json({ error: "Already booked" }, 400);

    const [booking] = await db.insert(eventBookings).values({
      eventId: id,
      userId,
      status: "confirmed",
    }).returning();

    return c.json(booking, 200);
  })

  // Cancel booking
  .delete("/:id/book", async (c) => {
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { id } = c.req.param();

    await db.update(eventBookings)
      .set({ status: "cancelled" })
      .where(and(eq(eventBookings.eventId, id), eq(eventBookings.userId, userId)));

    return c.json({ success: true }, 200);
  })

  // Get event attendees (marshal/admin)
  .get("/:id/attendees", async (c) => {
    const role = c.req.header("x-user-role");
    if (role !== "marshal" && role !== "admin" && role !== "organiser") {
      return c.json({ error: "Forbidden" }, 403);
    }
    const { id } = c.req.param();
    const attendees = await db.query.eventBookings.findMany({
      where: eq(eventBookings.eventId, id),
    });
    return c.json(attendees, 200);
  });
