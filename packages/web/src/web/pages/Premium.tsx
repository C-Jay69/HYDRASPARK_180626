import { useState } from "react";
import { useLocation } from "wouter";

const PERKS = [
  { icon: "⚡", title: "Unlimited Swipes", desc: "No daily cap. Match at your pace." },
  { icon: "🏆", title: "Priority Meetup Access", desc: "2-hour head start on event bookings." },
  { icon: "✓", title: "Gold Spark Badge", desc: "Verified premium status on your profile." },
  { icon: "💬", title: "Virtual Date Access", desc: "AI-powered date prompts and video stubs." },
  { icon: "🌍", title: "Country Club Access", desc: "Exclusive international member events." },
  { icon: "🔍", title: "Advanced Filters", desc: "Filter by vibe, language, verification status." },
];

export default function Premium() {
  const [, nav] = useLocation();
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId") || "";

  const checkout = async () => {
    setLoading(true);
    const res = await fetch("/api/payments/gold-spark/checkout", {
      method: "POST", headers: { "x-user-id": userId },
    });
    const d = await res.json();
    if (d.url) window.location.href = d.url;
    setLoading(false);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center" },
    header: { width: "100%", padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center" },
    hero: { textAlign: "center" as const, padding: "3rem 2rem 2rem" },
    badge: { display: "inline-block", padding: "0.4rem 1.2rem", borderRadius: "2rem", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "1.5rem" },
    h1: { fontSize: "2rem", fontWeight: 900, background: "linear-gradient(135deg,#f59e0b,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.75rem" },
    sub: { color: "#9ca3af", fontSize: "0.95rem", maxWidth: 340, margin: "0 auto 2rem" },
    price: { color: "#fff", fontSize: "3rem", fontWeight: 900 },
    priceSub: { color: "#9ca3af", fontSize: "0.9rem" },
    perks: { width: "100%", maxWidth: 480, padding: "0 1.5rem 2rem", display: "flex", flexDirection: "column" as const, gap: 12 },
    perk: { display: "flex", alignItems: "flex-start", gap: 12, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1rem" },
    perkIcon: { fontSize: "1.3rem", flexShrink: 0 },
    perkTitle: { color: "#fff", fontWeight: 600, fontSize: "0.9rem" },
    perkDesc: { color: "#9ca3af", fontSize: "0.8rem", marginTop: 2 },
    cta: { width: "calc(100% - 3rem)", maxWidth: 480, padding: "1rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#f59e0b,#a855f7)", border: "none", color: "#fff", fontWeight: 900, fontSize: "1.1rem", cursor: "pointer", marginBottom: "2rem" },
    fine: { color: "#4b5563", fontSize: "0.75rem", textAlign: "center" as const, padding: "0 2rem 2rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
      </div>

      <div style={s.hero}>
        <div style={s.badge}>★ Gold Spark</div>
        <h1 style={s.h1}>Ignite Your<br />Real Connections</h1>
        <p style={s.sub}>Upgrade to Gold Spark and access the full HydraSpark experience. No limits, no waiting.</p>
        <div style={s.price}>$19.99<span style={{ fontSize: "1rem", fontWeight: 400, color: "#9ca3af" }}>/month</span></div>
        <p style={s.priceSub}>Cancel anytime.</p>
      </div>

      <div style={s.perks}>
        {PERKS.map(p => (
          <div key={p.title} style={s.perk}>
            <span style={s.perkIcon}>{p.icon}</span>
            <div>
              <div style={s.perkTitle}>{p.title}</div>
              <div style={s.perkDesc}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button style={s.cta} onClick={checkout} disabled={loading}>
        {loading ? "Redirecting to checkout..." : "Upgrade to Gold Spark →"}
      </button>

      <p style={s.fine}>Secure checkout via Stripe. Your payment info never touches our servers. By subscribing you agree to our Terms of Service.</p>
    </div>
  );
}
