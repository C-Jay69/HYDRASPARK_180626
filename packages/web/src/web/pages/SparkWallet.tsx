import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Gift, Zap, Trophy, TrendingUp, Clock } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const REDEEM_OPTIONS = [
  { id: "profile_boost",    name: "Profile Boost (24h)",  cost: 100, icon: "🚀", desc: "Top of Discovery for 24hrs" },
  { id: "super_swipe",      name: "Super Swipe",           cost:  50, icon: "⚡", desc: "Guarantee they see you" },
  { id: "event_discount",   name: "Event Discount ($5)",   cost:  75, icon: "🎟️", desc: "$5 off your next event ticket" },
  { id: "gold_trial_3d",    name: "Gold Trial (3 days)",   cost: 200, icon: "👑", desc: "3 days of Gold Spark free" },
  { id: "guardian_month",   name: "Guardian Spark Month",  cost: 150, icon: "🛡️", desc: "1 month Guardian Spark add-on" },
];

const EARN_ACTIONS = [
  { action: "complete_profile",  points:  10, icon: "👤", label: "Complete your profile" },
  { action: "verify_id",         points:  50, icon: "✅", label: "Verify your ID" },
  { action: "attend_event",      points:  30, icon: "🎉", label: "Attend an event" },
  { action: "check_in_safe",     points:  15, icon: "🛡️", label: "Guardian check-in" },
  { action: "get_matched",       points:   5, icon: "💫", label: "Get matched" },
  { action: "referral",          points:  50, icon: "🔗", label: "Refer a friend" },
  { action: "daily_login",       points:   5, icon: "📅", label: "Daily login streak" },
  { action: "send_messages",     points:  10, icon: "💬", label: "Send 5 messages" },
];

const BADGE_INFO: Record<string, { emoji: string; label: string; desc: string }> = {
  rising_spark:      { emoji: "⭐", label: "Rising Spark",      desc: "Reached Level 2" },
  connector:         { emoji: "🔗", label: "Connector",          desc: "Reached Level 5" },
  social_butterfly:  { emoji: "🦋", label: "Social Butterfly",   desc: "Reached Level 10" },
  safety_champion:   { emoji: "🛡️", label: "Safety Champion",   desc: "Reached Level 15" },
  hydra_elite:       { emoji: "👑", label: "Hydra Elite",        desc: "Reached Level 20" },
};

export default function SparkWallet() {
  const { user } = useAuth();
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [tab, setTab] = useState<"wallet" | "earn" | "badges">("wallet");

  const points = (user as any)?.sparkPoints || 0;
  const level = (user as any)?.sparkLevel || 1;
  const xp = (user as any)?.sparkXp || 0;
  const badges: string[] = (user as any)?.sparkBadges || [];
  const xpToNextLevel = (level * 500) - xp;

  useEffect(() => {
    api.get("/spark/ledger").then((r) => setLedger(r.entries || [])).catch(() => {});
  }, []);

  async function redeem(rewardId: string, cost: number) {
    if (points < cost) {
      alert(`You need ${cost} Spark Points. You have ${points}.`);
      return;
    }
    setRedeeming(rewardId);
    try {
      await api.post("/spark/redeem", { rewardId });
      alert("Redeemed! Check your profile for your reward.");
    } catch (err: any) {
      alert(err.message || "Redemption failed");
    } finally {
      setRedeeming(null);
    }
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/40 to-cyan-900/20 border border-purple-500/30 rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Your Spark Points</p>
              <div className="flex items-center gap-3 mt-1">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <span className="text-5xl font-bold text-white">{points.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">Level {level}</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">{xpToNextLevel} XP to Level {level + 1}</p>
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((xp % 500) / 500) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{xp % 500} XP</span>
            <span>500 XP</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["wallet", "earn", "badges"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-purple-500 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Wallet tab — redeem */}
        {tab === "wallet" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4">Redeem Points</h2>
            {REDEEM_OPTIONS.map((opt, i) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between bg-[#111] border rounded-xl p-4 transition ${
                  points >= opt.cost ? "border-gray-800 hover:border-purple-500/50" : "border-gray-900 opacity-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{opt.name}</p>
                    <p className="text-gray-500 text-xs">{opt.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-purple-400 font-bold text-sm">{opt.cost} pts</p>
                    <p className={`text-xs ${points >= opt.cost ? "text-green-400" : "text-red-400"}`}>
                      {points >= opt.cost ? "Available" : `Need ${opt.cost - points} more`}
                    </p>
                  </div>
                  <button
                    onClick={() => redeem(opt.id, opt.cost)}
                    disabled={points < opt.cost || redeeming !== null}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {redeeming === opt.id ? "..." : "Redeem"}
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Ledger */}
            {ledger.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Activity
                </h3>
                <div className="space-y-2">
                  {ledger.slice(0, 10).map((entry: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-900">
                      <span className="text-gray-400 text-sm capitalize">{entry.action.replace(/_/g, " ")}</span>
                      <span className={`font-bold text-sm ${entry.points > 0 ? "text-green-400" : "text-red-400"}`}>
                        {entry.points > 0 ? "+" : ""}{entry.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Earn tab */}
        {tab === "earn" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              How to Earn Spark Points
            </h2>
            {EARN_ACTIONS.map((a, i) => (
              <motion.div
                key={a.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-[#111] border border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-white text-sm">{a.label}</p>
                </div>
                <span className="text-purple-400 font-bold text-sm">+{a.points} pts</span>
              </motion.div>
            ))}
            <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <p className="text-purple-300 text-sm font-semibold">💡 Referral Bonus</p>
              <p className="text-gray-400 text-xs mt-1">
                Earn <strong className="text-white">50 points</strong> for every friend who signs up and verifies with your referral code.
                Your friend also gets <strong className="text-white">25 points</strong> for joining.
              </p>
            </div>
          </div>
        )}

        {/* Badges tab */}
        {tab === "badges" && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Your Badges
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(BADGE_INFO).map(([key, badge], i) => {
                const unlocked = badges.includes(key);
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-[#111] border rounded-xl p-5 text-center transition ${
                      unlocked ? "border-purple-500/50" : "border-gray-800 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-4xl">{badge.emoji}</span>
                    <p className="text-white font-semibold mt-2 text-sm">{badge.label}</p>
                    <p className="text-gray-500 text-xs mt-1">{badge.desc}</p>
                    {unlocked && (
                      <span className="inline-block mt-2 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        Unlocked ✓
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
