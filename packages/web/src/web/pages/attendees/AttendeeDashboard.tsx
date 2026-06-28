import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AttendeeDashboard() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/events/bookings/mine", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setBookings(d.bookings || []));
  }, []);

  const cancel = async (bookingId: string) => {
    await fetch(`/api/events/bookings/${bookingId}/cancel`, { method: "POST", headers: { "x-user-id": userId } });
    setBookings(b => b.filter(x => x.id !== bookingId));
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    content: { padding: "1.5rem" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem", marginBottom: 12 },
    cardTitle: { color: "#fff", fontWeight: 700, marginBottom: 4 },
    meta: { color: "#9ca3af", fontSize: "0.8rem", display: "flex", gap: 12, marginBottom: "0.75rem" },
    btns: { display: "flex", gap: 8 },
    btn: (c: string) => ({ padding: "0.4rem 0.9rem", borderRadius: "0.5rem", background: c, border: "none", color: "#fff", cursor: "pointer", fontSize: "0.8rem" }),
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ color: "#fff", fontWeight: 800 }}>My Bookings</span>
        <button onClick={() => nav("/meetups")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>← Meetups</button>
      </div>
      <div style={s.content}>
        {bookings.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎟</div>
            <p>No upcoming events booked.</p>
            <button onClick={() => nav("/meetups")} style={{ marginTop: "1rem", padding: "0.75rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", cursor: "pointer" }}>Browse Meetups</button>
          </div>
        )}
        {bookings.map(b => (
          <div key={b.id} style={s.card}>
            <div style={s.cardTitle}>{b.eventTitle}</div>
            <div style={s.meta}><span>📅 {new Date(b.eventDate).toLocaleDateString()}</span><span>📍 {b.location}</span><span>Status: {b.status}</span></div>
            <div style={s.btns}>
              <button style={s.btn("rgba(168,85,247,0.2)")} onClick={() => nav(`/meetups/${b.eventId}`)}>View Event</button>
              {b.status !== "cancelled" && <button style={s.btn("rgba(239,68,68,0.2)")} onClick={() => cancel(b.id)}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
