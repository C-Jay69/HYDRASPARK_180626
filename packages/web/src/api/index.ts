import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { db } from "./database";
import { users } from "./database/schema";
import { eq } from "drizzle-orm";
import { usersRoutes } from "./routes/users";
import { messagesRoutes } from "./routes/messages";
import { guardianRoutes } from "./routes/guardian";
import { eventsRoutes } from "./routes/events";
import { adminRoutes } from "./routes/admin";
import { paymentsRoutes } from "./routes/payments";
import { verificationRoutes } from "./routes/verification";
import { virtualDateRoutes } from "./routes/virtual-date";
import { sparkRoutes } from "./routes/spark";
import { VIBE_QUESTIONS } from "./lib/vibe-score";

const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors({ origin: "*", credentials: true }));

// Auth middleware — inject user context from session token
app.use("*", async (c, next) => {
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (session?.user) {
        c.req.raw.headers.set("x-user-id", session.user.id);
        // Fetch full user for role / gold spark
        const fullUser = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
        if (fullUser) {
          c.req.raw.headers.set("x-user-role", fullUser.role || "user");
          c.req.raw.headers.set("x-gold-spark", String(fullUser.isGoldSpark));
        }
      }
    } catch {}
  }
  await next();
});

// Health check
app.get("/health", (c) => c.json({ status: "ok", service: "HydraSpark API", ts: Date.now() }, 200));

// Auth routes (better-auth handles all /api/auth/*)
app.on(["GET", "POST"], "/auth/**", (c) => auth.handler(c.req.raw));

// Vibe questions
app.get("/vibe-questions", (c) => c.json(VIBE_QUESTIONS, 200));

// Feature routes
app.route("/users", usersRoutes);
app.route("/messages", messagesRoutes);
app.route("/guardian", guardianRoutes);
app.route("/events", eventsRoutes);
app.route("/admin", adminRoutes);
app.route("/payments", paymentsRoutes);
app.route("/verification", verificationRoutes);
app.route("/virtual-date", virtualDateRoutes);
app.route("/spark", sparkRoutes);

export default app;
export type AppType = typeof app;
