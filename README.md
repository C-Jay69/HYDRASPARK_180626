# HydraSpark 🔥

> Real connections. Verified humans. Global community meetups.

HydraSpark is a full-stack dating/social platform with AI-powered safety, real-time chat, community meetups, and Gold Spark premium subscriptions.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Wouter + TailwindCSS v4 |
| Backend | Hono (on Bun) |
| Database | Neon Postgres via Drizzle ORM |
| Auth | better-auth (email/password) |
| Real-time | Socket.io |
| Payments | Stripe (subscriptions + events) |
| AI | OpenRouter (GuardianSpark + Virtual Date prompts) |
| Deploy | Docker / Coolify |

## Features

- **VibeScore Matching** — 12-question compatibility algorithm
- **Guardian Spark** — Real-world date check-ins + panic button
- **ID Verification** — Selfie + government ID review queue
- **Community Meetups** — IRL events with priority booking (Gold Spark gets 2h head start)
- **Real-time Chat** — Socket.io powered, AI-moderated (GuardianSpark flags scams/red flags)
- **Virtual Dates** — AI-generated conversation prompts via OpenRouter
- **Gold Spark Premium** — $19.99/month via Stripe
- **Country Club** — Global curated events (Gold Spark exclusive)
- **Zen Mode** — Anti-burnout swipe limits and app breaks
- **Multi-language** — EN, ES, ZH, FR, HI
- **Admin Dashboard** — Users, revenue (MRR/ARR), verification queue
- **Marshal Dashboard** — Live safety monitoring
- **Community Organiser** — Event management tools

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/country-club` | Country Club landing |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/onboarding` | 5-step onboarding flow |
| `/discover` | Swipe deck |
| `/match/:id` | Match screen + icebreaker |
| `/chat` | Message inbox |
| `/chat/:id` | Real-time chat room |
| `/guardian` | Guardian Spark safety |
| `/profile` | My profile |
| `/profile/:id` | User profile view |
| `/verification` | Verification overview |
| `/meetups` | Community meetups |
| `/meetups/:id` | Event detail + booking |
| `/events/create` | Create event |
| `/premium` | Gold Spark upsell |
| `/virtual-date` | Virtual date (Gold only) |
| `/zen` | Zen mode settings |
| `/invite` | Invite & earn |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin login |
| `/admin/users` | User management |
| `/admin/revenue` | Revenue / MRR |
| `/admin/verification` | ID approval queue |
| `/marshal` | Safety marshal command |
| `/organiser` | Community organiser |
| `/attendees` | My event bookings |

## Local Development

```bash
# 1. Clone
git clone https://github.com/C-Jay69/HYDRASPARK_180626.git
cd HYDRASPARK_180626

# 2. Environment
cp .env.example .env
# Edit .env with your Neon DB, Stripe, OpenRouter keys

# 3. Install
bun install

# 4. Push DB schema
cd packages/web && bun node_modules/.bin/drizzle-kit push

# 5. Seed admin user
bun --env-file=../../.env packages/web/seed-admin.ts

# 6. Dev server (frontend hot-reload)
bun run dev

# 7. API server (in a second terminal)
bun --env-file=.env packages/web/src/server.ts
```

## Coolify Deployment

### Prerequisites
- Coolify installed on your server (GMKTEC NucBox or any Docker host)
- Neon Postgres database (free tier works)
- Stripe account + webhook configured
- OpenRouter API key

### Deploy Steps

1. **Create New Project** in Coolify → New Resource → Docker

2. **Set Source** → GitHub → select `C-Jay69/HYDRASPARK_180626`

3. **Build Settings**:
   - Build Pack: `Dockerfile`
   - Dockerfile: `./Dockerfile`
   - Port: `3000`

4. **Environment Variables** → Add all from `.env.example`:
   ```
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=<generate: openssl rand -hex 32>
   BETTER_AUTH_URL=https://your-domain.com
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   OPENROUTER_API_KEY=sk-or-v1-...
   VITE_APP_URL=https://your-domain.com
   PORT=3000
   ```

5. **Deploy** → Coolify builds and starts the container

6. **Seed Admin** (first deploy only):
   ```bash
   # SSH into your server or use Coolify terminal
   docker exec -it <container-id> bun packages/web/seed-admin.ts
   ```

7. **Stripe Webhook** → In Stripe Dashboard → Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
   - Copy webhook secret → set as `STRIPE_WEBHOOK_SECRET`

### Admin Access

- URL: `https://your-domain.com/admin/login`
- Email: `simon@hydraforge.tech`
- Password: `HydraSpark@Admin2024!`

> ⚠️ Change the admin password after first login.

## Database Schema

9 tables: `users`, `sessions`, `accounts`, `verifications`, `connections`, `messages`, `vibe_scores`, `safety_logs`, `guardian_checkins`, `events`, `event_bookings`, `stripe_subscriptions`

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Register |
| POST | `/api/auth/sign-in/email` | Login |
| GET | `/api/users/discover` | Discovery feed |
| POST | `/api/users/swipe` | Swipe left/right |
| GET | `/api/messages/conversations` | Chat list |
| GET | `/api/messages/:connectionId` | Chat history |
| POST | `/api/guardian/checkin` | Start safety timer |
| POST | `/api/guardian/panic` | Trigger panic alert |
| GET | `/api/events` | List meetups |
| POST | `/api/events/:id/book` | Book event |
| POST | `/api/payments/gold-spark/checkout` | Stripe checkout |
| POST | `/api/verification/selfie` | Upload selfie |
| POST | `/api/verification/id` | Upload ID |
| GET | `/api/admin/stats` | Admin analytics |
| GET | `/api/admin/verification/queue` | Pending verifications |
| POST | `/api/virtual-date/prompt` | AI date prompt |

## License

Private — HydraSpark © 2024
