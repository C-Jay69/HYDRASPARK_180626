import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, Zap, Crown, Star, Gift, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const TIERS = [
  {
    id: "standard",
    name: "Standard",
    price: "$0",
    period: "",
    icon: Zap,
    gradient: "from-gray-600 to-gray-500",
    borderColor: "border-gray-700",
    features: [
      "15 swipes per day",
      "Basic profile",
      "Standard event access",
      "Basic matching algorithm",
    ],
    cta: "Your Current Plan",
    ctaStyle: "bg-gray-700 text-gray-400 cursor-default",
    popular: false,
  },
  {
    id: "gold_monthly",
    name: "Gold Spark",
    price: "$19.99",
    period: "/mo",
    quarterlyPrice: "$49.99",
    quarterlyPeriod: "/quarter",
    icon: Crown,
    gradient: "from-purple-500 to-cyan-400",
    borderColor: "border-purple-500",
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
    ctaStyle: "bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold hover:opacity-90",
    popular: true,
  },
  {
    id: "verification",
    name: "Verified",
    price: "$9.99",
    period: "one-time",
    icon: Shield,
    gradient: "from-amber-400 to-yellow-500",
    borderColor: "border-amber-500",
    features: [
      "ID Verified badge",
      "Country Club event access",
      "Higher VibeScore weighting",
      "Priority trust ranking",
      "Expedited 24hr: $14.99",
    ],
    cta: "Get Verified",
    ctaStyle: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold hover:opacity-90",
    popular: false,
  },
];

const MICRO = [
  { id: "super_swipe",       icon: "⚡", name: "Super Swipe",          price: "$1.99", desc: "Guarantee they see your profile" },
  { id: "profile_boost_24h", icon: "🚀", name: "Profile Boost",        price: "$4.99", desc: "Top of the Discovery stack for 24h" },
  { id: "spark_emotes",      icon: "✨", name: "Spark Emote Pack",     price: "$0.99", desc: "Custom emotes for your chats" },
  { id: "gift_card_roses",   icon: "🌹", name: "Virtual Roses",        price: "$1.99", desc: "Send roses to someone special" },
];

export default function Premium() {
  const { user } = useAuth();
  const [quarterly, setQuarterly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(type: string, extra?: Record<string, any>) {
    setLoading(type);
    try {
      let url = "";
      if (type === "gold_monthly" || type === "gold_quarterly") {
        const res = await api.post("/payments/gold-spark/checkout", {
          plan: quarterly ? "quarterly" : "monthly",
        });
        url = res.url;
      } else if (type === "verification") {
        const res = await api.post("/payments/verification/checkout", {
          expedited: extra?.expedited || false,
        });
        url = res.url;
      } else {
        const res = await api.post("/payments/micro/checkout", { item: type });
        url = res.url;
      }
      if (url) window.location.href = url;
    } catch (err: any) {
      alert(err.message || "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-1 mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm">Upgrade your spark</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent mb-3">
          Choose Your Spark
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          More connections. Better events. Real safety.
        </p>

        {/* Monthly / Quarterly toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm ${!quarterly ? "text-white" : "text-gray-500"}`}>Monthly</span>
          <button
            onClick={() => setQuarterly(!quarterly)}
            className={`w-12 h-6 rounded-full transition-colors ${quarterly ? "bg-purple-500" : "bg-gray-700"}`}
          >
            <span
              className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${quarterly ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
          <span className={`text-sm ${quarterly ? "text-white" : "text-gray-500"}`}>
            Quarterly{" "}
            <span className="text-cyan-400 font-semibold">Save 17%</span>
          </span>
        </div>
      </motion.div>

      {/* Tier Cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const isGold = tier.id === "gold_monthly";
          const displayPrice = isGold && quarterly ? tier.quarterlyPrice : tier.price;
          const displayPeriod = isGold && quarterly ? tier.quarterlyPeriod : tier.period;
          const isCurrentPlan = tier.id === "standard" && !user?.isGoldSpark;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border bg-[#111] transition-all ${tier.borderColor} ${
                tier.popular ? "ring-2 ring-purple-500 scale-105" : ""
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-400 text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </span>
              )}

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-black" />
              </div>

              <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{displayPrice}</span>
                {displayPeriod && <span className="text-gray-400">{displayPeriod}</span>}
              </div>

              {isGold && quarterly && (
                <p className="text-xs text-gray-500 mt-1">Billed as $49.99 every 3 months</p>
              )}

              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-gray-300 text-sm">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: isCurrentPlan ? 1 : 1.02 }}
                whileTap={{ scale: isCurrentPlan ? 1 : 0.98 }}
                disabled={isCurrentPlan || loading !== null}
                onClick={() => {
                  if (!isCurrentPlan) {
                    checkout(tier.id === "gold_monthly" ? (quarterly ? "gold_quarterly" : "gold_monthly") : tier.id);
                  }
                }}
                className={`w-full mt-8 py-3 rounded-xl transition-all text-sm ${tier.ctaStyle} ${
                  loading === tier.id ? "opacity-50 cursor-wait" : ""
                }`}
              >
                {loading === tier.id ? "Redirecting..." : tier.cta}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Verification Expedite Banner */}
      <div className="max-w-5xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="text-amber-300 font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Need it faster?
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Expedited verification — verified badge within <strong className="text-white">24 hours</strong> for just $14.99
            </p>
          </div>
          <button
            onClick={() => checkout("verification", { expedited: true })}
            className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition whitespace-nowrap text-sm"
          >
            Get Expedited ($14.99) <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </motion.div>
      </div>

      {/* Micro-transactions */}
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Power-Ups</h2>
            <span className="text-gray-500 text-sm">One-time add-ons</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MICRO.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="bg-[#111] border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-semibold text-white text-sm">{item.name}</p>
                <p className="text-gray-500 text-xs mt-1 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">{item.price}</span>
                  <button
                    onClick={() => checkout(item.id)}
                    disabled={loading !== null}
                    className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-500/40 transition"
                  >
                    {loading === item.id ? "..." : "Buy"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue footnote / social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-5xl mx-auto mt-16 text-center"
      >
        <div className="grid grid-cols-3 gap-8 py-8 border-t border-gray-800">
          {[
            { value: "10k+", label: "Active Members" },
            { value: "500+", label: "Events Hosted" },
            { value: "98%", label: "Safety Record" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-4">
          Cancel anytime. No hidden fees. Stripe-secured payments.
        </p>
      </motion.div>
    </div>
  );
}
