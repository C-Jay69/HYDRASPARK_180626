import { useState } from "react";
import { useLocation } from "wouter";

export default function CreateEvent() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [form, setForm] = useState({ title: "", description: "", location: "", date: "", maxAttendees: 20, premiumOnly: false, ticketPrice: 0 });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ ...form, ticketPrice: Math.round(form.ticketPrice * 100) }),
    });
    const d = await res.json();
    if (d.event) nav(`/meetups/${d.event.id}`);
    setSubmitting(false);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: "1rem" },
    form: { padding: "1.5rem", display: "flex", flexDirection: "column" as const, gap: 16 },
    label: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: 4, display: "block" },
    input: { width: "100%", background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const },
    toggle: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "0.75rem", padding: "0.75rem 1rem" },
    btn: { padding: "1rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/meetups")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700 }}>Create Meetup</span>
      </div>
      <div style={s.form}>
        <div><label style={s.label}>Event Title</label><input style={s.input} placeholder="Rooftop Vibes..." value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
        <div><label style={s.label}>Description</label><textarea style={{...s.input, minHeight: 80, resize: "vertical"}} placeholder="Tell people what to expect..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
        <div><label style={s.label}>Location</label><input style={s.input} placeholder="Venue, address..." value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} /></div>
        <div><label style={s.label}>Date & Time</label><input style={s.input} type="datetime-local" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
        <div><label style={s.label}>Max Attendees</label><input style={s.input} type="number" min={2} max={500} value={form.maxAttendees} onChange={e => setForm(f => ({...f, maxAttendees: Number(e.target.value)}))} /></div>
        <div><label style={s.label}>Ticket Price (USD, 0 = free)</label><input style={s.input} type="number" min={0} step={0.01} value={form.ticketPrice} onChange={e => setForm(f => ({...f, ticketPrice: Number(e.target.value)}))} /></div>
        <div style={s.toggle}>
          <div>
            <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600 }}>Gold Spark Only</div>
            <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Only premium members can book</div>
          </div>
          <button onClick={() => setForm(f => ({...f, premiumOnly: !f.premiumOnly}))} style={{ width: 44, height: 24, borderRadius: 12, background: form.premiumOnly ? "linear-gradient(135deg,#a855f7,#06b6d4)" : "#2a2a3e", border: "none", cursor: "pointer", position: "relative", transition: "all .2s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.premiumOnly ? 23 : 3, transition: "left .2s" }} />
          </button>
        </div>
        <button style={s.btn} onClick={submit} disabled={submitting}>{submitting ? "Creating..." : "Create Meetup"}</button>
      </div>
    </div>
  );
}
