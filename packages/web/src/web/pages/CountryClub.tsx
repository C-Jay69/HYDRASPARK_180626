import { useLocation } from "wouter";

const EVENTS = [
  { flag: "🇲🇽", city: "Mexico City", title: "Rooftop Sparks", date: "Jul 12", spots: 18 },
  { flag: "🇬🇧", city: "London", title: "Chelsea Vibes Mixer", date: "Jul 19", spots: 12 },
  { flag: "🇯🇵", city: "Tokyo", title: "Shibuya Night Sparks", date: "Aug 3", spots: 20 },
  { flag: "🇫🇷", city: "Paris", title: "Le Marais Social", date: "Aug 8", spots: 15 },
  { flag: "🇦🇺", city: "Sydney", title: "Harbour Sparks", date: "Aug 15", spots: 22 },
];

export default function CountryClub() {
  const [, nav] = useLocation();
  const isGold = localStorage.getItem("isGoldSpark") === "true";

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center" },
    hero: { padding: "2.5rem 1.5rem", textAlign: "center" as const, borderBottom: "1px solid #1a1a2e" },
    badge: { display: "inline-block", padding: "0.3rem 1rem", borderRadius: "2rem", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 700, fontSize: "0.8rem", marginBottom: "1rem" },
    h1: { fontSize: "1.6rem", fontWeight: 900, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 },
    p: { color: "#9ca3af", fontSize: "0.9rem" },
    list: { padding: "1.5rem", display: "flex", flexDirection: "column" as const, gap: 12 },
    card: (locked: boolean) => ({ background: "#0a0a0a", border: `1px solid ${locked ? "#1a1a2e" : "#2a2a3e"}`, borderRadius: "1rem", padding: "1.25rem", opacity: locked ? 0.5 : 1, cursor: locked ? "default" : "pointer", display: "flex", alignItems: "center", gap: "1rem" }),
    flag: { fontSize: "2rem" },
    info: { flex: 1 },
    city: { color: "#9ca3af", fontSize: "0.75rem" },
    title: { color: "#fff", fontWeight: 700, fontSize: "0.95rem" },
    meta: { color: "#9ca3af", fontSize: "0.8rem", marginTop: 4 },
    spots: { color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Country Club</span>
      </div>
      <div style={s.hero}>
        <div style={s.badge}>★ Gold Spark Exclusive</div>
        <h1 style={s.h1}>Global Sparks,<br />Local Connections</h1>
        <p style={s.p}>Curated meetups across the world. Gold Spark gets you in.</p>
      </div>
      {!isGold && (
        <div style={{ margin: "1.5rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "1rem", padding: "1.25rem", textAlign: "center" }}>
          <p style={{ color: "#a855f7", marginBottom: "0.75rem" }}>Upgrade to Gold Spark to access Country Club events worldwide.</p>
          <button onClick={() => nav("/premium")} style={{ padding: "0.65rem 1.5rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Upgrade →</button>
        </div>
      )}
      <div style={s.list}>
        {EVENTS.map(e => (
          <div key={e.city} style={s.card(!isGold)} onClick={() => isGold && nav("/meetups")}>
            <span style={s.flag}>{e.flag}</span>
            <div style={s.info}>
              <div style={s.city}>{e.city}</div>
              <div style={s.title}>{e.title}</div>
              <div style={s.meta}>{e.date}</div>
            </div>
            <div style={s.spots}>{e.spots} spots</div>
            {!isGold && <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>🔒</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
