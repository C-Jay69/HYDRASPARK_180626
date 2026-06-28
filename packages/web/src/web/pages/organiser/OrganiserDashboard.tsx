import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function OrganiserDashboard() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [myEvents, setMyEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/events/mine", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setMyEvents(d.events || []));
  }, []);

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    content: { padding: "1.5rem" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem", marginBottom: 12, cursor: "pointer" },
    cardTitle: { color: "#fff", fontWeight: 700, marginBottom: 4 },
    meta: { color: "#9ca3af", fontSize: "0.8rem", display: "flex", gap: 12 },
    stats: { display: "flex", gap: 8, marginTop: 8 },
    stat: (color: string) => ({ padding: "3px 10px", borderRadius: "0.5rem", background: `rgba(${color},0.1)`, color: `rgb(${color})`, fontSize: "0.75rem" }),
    fab: { position: "fixed" as const, bottom: "2rem", right: "1.5rem", width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ color: "#fff", fontWeight: 800 }}>Community Organiser</span>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>Exit</button>
      </div>
      <div style={s.content}>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: "1.5rem" }}>My Events ({myEvents.length})</h2>
        {myEvents.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
            <p>No events yet. Create your first meetup.</p>
          </div>
        )}
        {myEvents.map(e => (
          <div key={e.id} style={s.card} onClick={() => nav(`/meetups/${e.id}`)}>
            <div style={s.cardTitle}>{e.title}</div>
            <div style={s.meta}><span>📅 {new Date(e.date).toLocaleDateString()}</span><span>📍 {e.location}</span></div>
            <div style={s.stats}>
              <span style={s.stat("168,85,247")}>{e.attendeeCount}/{e.maxAttendees} booked</span>
              <span style={s.stat(e.premiumOnly ? "245,158,11" : "34,197,94")}>{e.premiumOnly ? "Gold Only" : "Open"}</span>
              <span style={s.stat("6,182,212")}>{e.ticketPrice > 0 ? `$${(e.ticketPrice/100).toFixed(2)}` : "Free"}</span>
            </div>
          </div>
        ))}
      </div>
      <button style={s.fab} onClick={() => nav("/events/create")}>+</button>
    </div>
  );
}
