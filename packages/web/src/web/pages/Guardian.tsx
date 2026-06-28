import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

export default function Guardian() {
  const [, nav] = useLocation();
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(60); // minutes
  const [remaining, setRemaining] = useState(0);
  const [location, setLocation] = useState("");
  const [panicSent, setPanicSent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userId = localStorage.getItem("userId") || "";

  const startTimer = async () => {
    if (!location.trim()) return;
    await fetch("/api/guardian/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ dateLocation: location, durationMinutes: duration }),
    });
    setRemaining(duration * 60);
    setActive(true);
  };

  useEffect(() => {
    if (active && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining(r => r - 1), 1000);
    } else if (remaining === 0 && active) {
      clearInterval(intervalRef.current!);
      setActive(false);
    }
    return () => clearInterval(intervalRef.current!);
  }, [active, remaining]);

  const panic = async () => {
    await fetch("/api/guardian/panic", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ location }),
    });
    setPanicSent(true);
  };

  const checkin = async () => {
    await fetch("/api/guardian/safe", { method: "POST", headers: { "x-user-id": userId } });
    setActive(false);
    clearInterval(intervalRef.current!);
  };

  const fmt = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { width: "100%", maxWidth: 480, display: "flex", alignItems: "center", marginBottom: "2rem" },
    card: { width: "100%", maxWidth: 480, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2rem" },
    title: { fontSize: "1.4rem", fontWeight: 800, background: "linear-gradient(135deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 },
    sub: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: "1.5rem" },
    label: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: "0.5rem", display: "block" },
    input: { width: "100%", background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box" as const },
    timer: { textAlign: "center" as const, margin: "1.5rem 0" },
    timerDisplay: { fontSize: "3.5rem", fontWeight: 900, color: remaining < 300 ? "#ef4444" : "#a855f7", fontVariantNumeric: "tabular-nums" as const },
    timerLabel: { color: "#9ca3af", fontSize: "0.85rem", marginTop: 4 },
    row: { display: "flex", gap: 8, marginTop: "1rem" },
    btn: (color: string) => ({ flex: 1, padding: "0.85rem", borderRadius: "0.75rem", background: color, border: "none", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }),
    panicBtn: { width: "100%", padding: "1rem", borderRadius: "0.75rem", background: "#ef4444", border: "none", color: "#fff", fontWeight: 900, fontSize: "1.1rem", cursor: "pointer", marginTop: "1.5rem", letterSpacing: 1 },
    select: { width: "100%", background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", marginBottom: "1rem", outline: "none" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem", marginRight: "1rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Guardian Spark</span>
      </div>

      <div style={s.card}>
        <h2 style={s.title}>🛡 Guardian Spark</h2>
        <p style={s.sub}>Real-time safety system for your date. We'll check in — and escalate if you don't respond.</p>

        {panicSent ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚨</div>
            <h3 style={{ color: "#ef4444", fontWeight: 700 }}>Panic Alert Sent</h3>
            <p style={{ color: "#9ca3af", marginTop: 8 }}>Your emergency contacts and HydraSpark Safety Team have been notified with your location.</p>
            <button onClick={() => { setPanicSent(false); setActive(false); }} style={s.btn("rgba(239,68,68,0.2)")}>Reset</button>
          </div>
        ) : !active ? (
          <>
            <label style={s.label}>Where are you going?</label>
            <input style={s.input} placeholder="Restaurant name, address..." value={location} onChange={e => setLocation(e.target.value)} />
            <label style={s.label}>Check-in timer</label>
            <select style={s.select} value={duration} onChange={e => setDuration(Number(e.target.value))}>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
            <button style={s.btn("linear-gradient(135deg,#a855f7,#06b6d4)")} onClick={startTimer}>Activate Guardian</button>
          </>
        ) : (
          <>
            <div style={s.timer}>
              <div style={s.timerDisplay}>{fmt(remaining)}</div>
              <div style={s.timerLabel}>Check-in required at 0:00 or alert triggers</div>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", marginBottom: "1rem" }}>📍 {location}</p>
            <div style={s.row}>
              <button style={s.btn("rgba(34,197,94,0.2)")} onClick={checkin}>✓ I'm Safe</button>
              <button style={s.btn("rgba(239,68,68,0.2)")} onClick={() => setActive(false)}>Cancel</button>
            </div>
          </>
        )}

        <button style={s.panicBtn} onClick={panic}>
          🚨 PANIC — Send Alert NOW
        </button>

        <p style={{ color: "#4b5563", fontSize: "0.75rem", textAlign: "center", marginTop: "1rem" }}>
          Emergency contacts can be set in your Profile. HydraSpark Safety Team is always notified.
        </p>
      </div>
    </div>
  );
}
