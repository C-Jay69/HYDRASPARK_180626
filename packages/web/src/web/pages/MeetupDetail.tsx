import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";

export default function MeetupDetail() {
  const [, nav] = useLocation();
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    fetch(`/api/events/${params.id}`, { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setEvent(d.event));
  }, []);

  const book = async () => {
    setBooking(true);
    const res = await fetch(`/api/events/${params.id}/book`, {
      method: "POST", headers: { "x-user-id": userId }
    });
    const d = await res.json();
    if (d.checkoutUrl) { window.location.href = d.checkoutUrl; return; }
    if (d.success) setBooked(true);
    setBooking(false);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: "1rem" },
    hero: { height: 200, background: "linear-gradient(135deg,#1a1a2e,#0d0d1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" },
    content: { padding: "1.5rem" },
    title: { color: "#fff", fontWeight: 800, fontSize: "1.4rem", marginBottom: "0.75rem" },
    meta: { display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: "1.5rem" },
    metaRow: { display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: "0.9rem" },
    desc: { color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem" },
    bookBtn: { width: "100%", padding: "1rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
    bookedBtn: { width: "100%", padding: "1rem", borderRadius: "0.75rem", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontWeight: 700, fontSize: "1rem" },
  };

  if (!event) return <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#a855f7" }}>Loading...</span></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/meetups")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700 }}>Event Details</span>
      </div>
      <div style={s.hero}>📅</div>
      <div style={s.content}>
        <h1 style={s.title}>{event.title}</h1>
        <div style={s.meta}>
          <div style={s.metaRow}>📅 {new Date(event.date).toLocaleString()}</div>
          <div style={s.metaRow}>📍 {event.location}</div>
          <div style={s.metaRow}>👤 Hosted by {event.hostName}</div>
          <div style={s.metaRow}>🎟 {event.maxAttendees - event.attendeeCount} of {event.maxAttendees} spots left</div>
        </div>
        <p style={s.desc}>{event.description}</p>

        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>Ticket</span>
            <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "1.2rem" }}>{event.ticketPrice > 0 ? `$${(event.ticketPrice/100).toFixed(2)}` : "Free"}</span>
          </div>
          {event.premiumOnly && <div style={{ color: "#f59e0b", fontSize: "0.85rem", marginBottom: "1rem" }}>★ Gold Spark members get 2-hour priority access</div>}
          {booked ? (
            <div style={s.bookedBtn}>✓ You're In!</div>
          ) : (
            <button style={s.bookBtn} onClick={book} disabled={booking}>{booking ? "Booking..." : "Book Your Spot"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
