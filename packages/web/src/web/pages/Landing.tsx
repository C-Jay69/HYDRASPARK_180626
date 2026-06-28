import { Link } from "wouter";
import { motion } from "framer-motion";

const features = [
  { icon: "⚡", title: "VibeScore Matching", desc: "12 quirky questions reveal your true compatibility — not just looks." },
  { icon: "🛡️", title: "Guardian Spark Safety", desc: "Real-world date check-ins with emergency contact alerts. Safety is non-negotiable." },
  { icon: "✦", title: "Gold Spark Verified", desc: "Country Club-level verification. Only real people, no catfishing, no BS." },
  { icon: "🌐", title: "Community Meetups", desc: "IRL events with priority booking, marshal safety, and verified attendee lists." },
  { icon: "💬", title: "AI-Guarded Chat", desc: "GuardianSpark AI monitors for scams and red flags so you can connect safely." },
  { icon: "🎭", title: "Virtual Dates", desc: "AI-powered conversation prompts to break the ice before meeting in person." },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen hero-mesh">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 border border-amber-400/30 rounded-full px-4 py-2 mb-6">
            ✦ The dating app that actually respects you
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Ignite <span className="gradient-text">Real</span><br />Connections
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            HydraSpark isn't just a dating app. It's a safety-first, community-driven ecosystem where verified real people meet, connect, and build something genuine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <motion.span
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-block gradient-bg text-white font-bold text-lg px-8 py-4 rounded-full cursor-pointer purple-glow"
              >
                Ignite Your Spark ⚡
              </motion.span>
            </Link>
            <Link href="/country-club">
              <motion.span
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-block border border-white/20 text-white font-semibold text-lg px-8 py-4 rounded-full cursor-pointer hover:border-purple-500/50 transition-colors"
              >
                Explore Country Club ✦
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-10 mt-20 text-center"
        >
          {[["50K+", "Verified Members"], ["94%", "Safety Rating"], ["12K+", "Real Connections"], ["200+", "IRL Events"]].map(([n, l]) => (
            <div key={l}>
              <div className="text-4xl font-extrabold gradient-text">{n}</div>
              <div className="text-sm text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold mb-4">Built different. <span className="gradient-text">On purpose.</span></h2>
          <p className="text-gray-400 text-lg">Every feature exists to make connections safer, richer, and more real.</p>
        </div>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}
              className="glass-card rounded-2xl p-6 hover:border-purple-500/30 transition-colors group"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2 group-hover:gradient-text transition-all">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Guardian Spark section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-3xl font-extrabold mb-4">Guardian Spark™</h2>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            Going on a first date? Set a check-in timer. If you don't check in as safe, our system automatically alerts your emergency contacts. Because your safety isn't optional.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Emergency contact alerts", "AI message moderation", "Safety marshal events", "Identity verification"].map(f => (
              <span key={f} className="text-sm text-cyan-400 border border-cyan-400/30 rounded-full px-4 py-1">{f}</span>
            ))}
          </div>
          <Link href="/auth/register">
            <span className="inline-block gradient-bg text-white font-bold px-8 py-3 rounded-full cursor-pointer">Get Protected</span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Ready to spark something real?</h2>
        <p className="text-gray-400 text-lg mb-8">Join the country club for real connections.</p>
        <Link href="/auth/register">
          <motion.span
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="inline-block gradient-bg text-white font-bold text-xl px-10 py-5 rounded-full cursor-pointer purple-glow"
          >
            Create Your Profile ⚡
          </motion.span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-600 text-sm">
        <p className="gradient-text font-bold text-base mb-2">HydraSpark ⚡</p>
        <p>© 2024 HydraSpark. Ignite real connections.</p>
      </footer>
    </div>
  );
}
