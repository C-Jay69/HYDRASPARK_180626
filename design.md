# HydraSpark Design System

## Brand
- Name: HydraSpark
- Tagline: "Ignite Real Connections"
- Vibe: Premium dating/social "Country Club" — safety-first, high-accountability, community-driven

## Colors
- Background: #000000 (pure black)
- Card Dark: #2a2a2a
- Card Darker: #1a1a1a
- Primary Purple: #a855f7
- Accent Cyan: #06b6d4
- Gradient: linear-gradient(90deg, #a855f7 0%, #06b6d4 100%)
- Success: #22c55e
- Danger: #ef4444
- Warning: #f59e0b
- Gold: #f59e0b (Gold Spark)
- Text Primary: #ffffff
- Text Muted: #9ca3af

## Typography
- Font: Plus Jakarta Sans (Google Fonts)
- Weights: 400, 500, 600, 700, 800
- Headings: 700-800 weight, gradient text effect
- Body: 400-500 weight, #d1d5db
- Monospace: JetBrains Mono (badges/scores)

## Gradient Utilities
- .gradient-text: bg-clip-text text-transparent, purple→cyan
- .gradient-bg: background purple→cyan
- .glass-card: rgba(42,42,42,0.6) backdrop-blur-12px border border-white/10
- .gold-glow: box-shadow 0 0 20px rgba(245,158,11,0.4) (Gold Spark users)
- .purple-glow: box-shadow 0 0 20px rgba(168,85,247,0.3)

## Components
- Nav: glass nav, blur, HydraSpark logo left, links center, auth/CTA right
- Cards: rounded-2xl, card-dark bg, border border-white/10, hover glow
- Buttons: primary = gradient bg, secondary = border border-purple-500 text-purple
- Badges: Gold Spark = gold gradient, Verified = cyan, Response Score = colored ring
- Discovery Card: full-height card, swipe overlay, vibe score chip, action buttons below
- Safety Alert: bright red/orange, pulsing indicator, full-screen modal
- Guardian Timer: countdown ring, check-in button, emergency contact display

## Layout
- Max width: 1280px centered
- Sidebar layouts for dashboards (260px sidebar, main content)
- Mobile-first responsive
- Generous padding: p-6 md:p-10
- Grid: 3-col for discovery, 2-col for chat, 1-col mobile

## Motion
- Page load: fade-in + slide-up stagger
- Discovery card: drag/swipe physics (CSS transform)
- Gold Spark: pulsing golden glow animation
- Guardian alert: pulse animation on red dot
- Modals: scale + fade in

## Routes Map
/ → Landing
/country-club → Country Club landing
/auth/login → Login
/auth/register → Register
/onboarding → Onboarding (5 steps)
/discover → Discovery Deck
/match/:id → Match + Icebreaker
/chat → Chat list
/chat/:id → Real-time chat room
/guardian → Guardian Spark active safety
/profile → My profile
/profile/:id → User profile view
/verification → Verification overview
/verification/selfie → Selfie upload
/verification/id → ID upload
/verification/status → Pending status
/meetups → Community meetups
/meetups/:id → Meetup detail + booking
/meetups/create → Event creation
/virtual-date → Virtual date interface
/virtual-date/prompts → Prompt engine
/zen → Zen mode settings
/premium → Gold Spark upsell
/checkout → Secure checkout
/invite → Priority invite
/admin → Admin analytics (protected)
/admin/users → User & safety management
/admin/revenue → Revenue management
/admin/verification → ID approval queue
/admin/login → Admin login
/marshal → Safety marshal command center
/organiser → Community organiser dashboard
/attendees → Event attendee management
