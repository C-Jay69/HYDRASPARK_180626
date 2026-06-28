import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function MarshalDashboard() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [alerts, setAlerts] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/guardian/marshal/feed", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => { setAlerts(d.alerts || []); setCheckins(d.checkins || []); });
  }, []);

  const resolve = async (id: string) => {
    await fetch(`/api/guardian/marshal/resolve/${id}`, { method: "POST", headers: { "x-user-id": userId } });
    setAlerts(a => a.filter(x => x.id !== id));
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    title: { color: "#fff", fontWeight: 800, fontSize: "1.1rem" },
    content: { padding: "1.5rem" },
    alertCard: { background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "1rem", padding: "1.25rem", marginBottom: 12 },
    alertHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    alertUser: { color: "#fff", fontWeight: 700 },
    alertSev: { padding: "2px 8px", borderRadius: "1rem", background: "rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 },
    alertLoc: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: 12 },
    resolveBtn: { padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e", cursor: "pointer", fontSize: "0.85rem" },
    checkinCard: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" },
    checkinUser: { color: "#fff", fontSize: "0.9rem" },
    checkinStatus: (s: string) => ({ color: s === "active" ? "#22c55e" : s === "overdue" ? "#ef4444" : "#9ca3af", fontSize: "0.8rem", fontWeight: 600 }),
    sectionTitle: { color: "#9ca3af", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 12 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.title}>🛡 Safety Marshal Command</span>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>Exit</button>
      </div>
      <div style={s.content}>
        {alerts.length > 0 && (
          <>
            <div style={{ ...s.sectionTitle, color: "#ef4444" }}>🚨 ACTIVE ALERTS ({alerts.length})</div>
            {alerts.map(a => (
              <div key={a.id} style={s.alertCard}>
                <div style={s.alertHead}>
                  <div style={s.alertUser}>{a.userName}</div>
                  <span style={s.alertSev}>PANIC</span>
                </div>
                <div style={s.alertLoc}>📍 {a.location} · {new Date(a.triggeredAt).toLocaleTimeString()}</div>
                <button style={s.resolveBtn} onClick={() => resolve(a.id)}>Mark Resolved</button>
              </div>
            ))}
          </>
        )}
        {alerts.length === 0 && <div style={{ color: "#22c55e", padding: "1rem", marginBottom: "1.5rem", textAlign: "center" }}>✓ No active alerts</div>}

        <div style={s.sectionTitle}>ACTIVE GUARDIAN CHECK-INS</div>
        {checkins.length === 0 && <div style={{ color: "#9ca3af", textAlign: "center", padding: "1rem" }}>No active check-ins.</div>}
        {checkins.map(c => (
          <div key={c.id} style={s.checkinCard}>
            <div>
              <div style={s.checkinUser}>{c.userName}</div>
              <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>📍 {c.location}</div>
            </div>
            <span style={s.checkinStatus(c.status)}>{c.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
