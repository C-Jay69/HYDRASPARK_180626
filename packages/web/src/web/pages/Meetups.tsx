import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface Event { id: string; title: string; description: string; location: string; date: string; maxAttendees: number; attendeeCount: number; premiumOnly: boolean; ticketPrice: number; hostName: string; }

export default function Meetups() {
  const [, nav] = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const userId = localStorage.getItem("userId") || "";
  const isGold = localStorage.getItem("isGoldSpark") === "true";

  useEffect(() => {
    fetch("/api/events", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => { setEvents(d.events || []); setLoading(false); });
  }, []);

  const filtered = events.filter(e => filter === "all" ? true : filter === "premium" ? e.premiumOnly : !e.premiumOnly);

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between" },
    title: { fontSize: "1.2rem", fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    tabs: { display: "flex", gap: 8, padding: "1rem 1.5rem" },
    tab: (active: boolean) => ({ padding: "0.4rem 1rem", borderRadius: "2rem", border: `1px solid ${active ? "#a855f7" : "#2a2a3e"}`, background: active ? "rgba(168,85,247,0.15)" : "transparent", color: active ? "#a855f7" : "#9ca3af", cursor: "pointer", fontSize: "0.85rem" }),
    grid: { padding: "0 1.5rem", display: "flex", flexDirection: "column" as const, gap: 12 },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem", cursor: "pointer", transition: "border-color .2s" },
    cardTitle: { color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 },
    meta: { display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 8 },
    metaItem: { color: "#9ca3af", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 },
    desc: { color: "#6b7280", fontSize: "0.85rem", marginBottom: 12 },
    footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    price: { color: "#a855f7", fontWeight: 700, fontSize: "0.9rem" },
    spots: { color: "#9ca3af", fontSize: "0.8rem" },
    premBadge: { padding: "2px 8px", borderRadius: "1rem", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: "0.7rem", fontWeight: 700 },
    fab: { position: "fixed" as const, bottom: "2rem", right: "1.5rem", width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(168,85,247,0.4)" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={s.title}>Community Meetups</span>
        <span style={{ width: 24 }} />
      </div>

      <div style={s.tabs}>
        {(["all","free","premium"] as const).map(f => <button key={f} style={s.tab(filter === f)} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
      </div>

      {loading ? <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Finding sparks near you...</div> : (
        <div style={s.grid}>
          {filtered.length === 0 && <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No meetups yet. Create the first one!</div>}
          {filtered.map(e => (
            <div key={e.id} style={s.card} onClick={() => nav(`/meetups/${e.id}`)}
              onMouseEnter={el => (el.currentTarget.style.borderColor = "#a855f7")}
              onMouseLeave={el => (el.currentTarget.style.borderColor = "#1a1a2e")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={s.cardTitle}>{e.title}</div>
                {e.premiumOnly && <span style={s.premBadge}>★ Gold Only</span>}
              </div>
              <div style={s.meta}>
                <span style={s.metaItem}>📅 {new Date(e.date).toLocaleDateString()}</span>
                <span style={s.metaItem}>📍 {e.location}</span>
                <span style={s.metaItem}>👤 {e.hostName}</span>
              </div>
              <p style={s.desc}>{e.description}</p>
              <div style={s.footer}>
                <span style={s.price}>{e.ticketPrice > 0 ? `$${(e.ticketPrice/100).toFixed(2)}` : "Free"}</span>
                <span style={s.spots}>{e.maxAttendees - e.attendeeCount} spots left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isGold && <button style={s.fab} onClick={() => nav("/events/create")}>+</button>}
    </div>
  );
}
