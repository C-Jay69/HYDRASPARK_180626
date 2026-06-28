import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminRevenue() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") { nav("/admin/login"); return; }
    fetch("/api/admin/revenue", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setData(d));
  }, []);

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    content: { padding: "1.5rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: "2rem" },
    stat: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem" },
    val: { fontSize: "1.8rem", fontWeight: 900, background: "linear-gradient(135deg,#22c55e,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    label: { color: "#9ca3af", fontSize: "0.75rem", marginTop: 4 },
    navBtn: { padding: "0.4rem 0.8rem", borderRadius: "0.5rem", background: "transparent", border: "1px solid #2a2a3e", color: "#9ca3af", cursor: "pointer", fontSize: "0.8rem" },
    table: { width: "100%", borderCollapse: "collapse" as const },
    th: { color: "#9ca3af", fontSize: "0.75rem", padding: "0.5rem 0.75rem", textAlign: "left" as const, borderBottom: "1px solid #1a1a2e" },
    td: { color: "#fff", fontSize: "0.85rem", padding: "0.75rem", borderBottom: "1px solid #0d0d0d" },
  };

  const stats = data ? [
    { val: `$${((data.mrr||0)/100).toFixed(2)}`, label: "MRR" },
    { val: `$${((data.arr||0)/100).toFixed(2)}`, label: "ARR (Projected)" },
    { val: (data.goldSparks||0).toString(), label: "Active Gold Sparks" },
    { val: `$${((data.eventRevenue||0)/100).toFixed(2)}`, label: "Event Revenue" },
    { val: (data.churnRate||0) + "%", label: "Churn Rate" },
    { val: `$${((data.ltv||0)/100).toFixed(2)}`, label: "LTV (Avg)" },
  ] : [];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ color: "#fff", fontWeight: 700 }}>🛡 HydraSpark Admin</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.navBtn} onClick={() => nav("/admin")}>Dashboard</button>
          <button style={s.navBtn} onClick={() => nav("/admin/users")}>Users</button>
          <button style={{ ...s.navBtn, color: "#22c55e", borderColor: "rgba(34,197,94,0.4)" }}>Revenue</button>
          <button style={s.navBtn} onClick={() => nav("/admin/verification")}>Verification</button>
        </div>
      </div>
      <div style={s.content}>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: "1.5rem" }}>Revenue</h2>
        <div style={s.grid}>
          {stats.map(({ val, label }) => (
            <div key={label} style={s.stat}><div style={s.val}>{val}</div><div style={s.label}>{label}</div></div>
          ))}
        </div>
        {data?.subscriptions && (
          <>
            <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: "1rem" }}>Recent Subscriptions</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead><tr>{["User","Plan","Status","Amount","Date"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.subscriptions.map((sub: any) => (
                    <tr key={sub.id}>
                      <td style={s.td}>{sub.userEmail}</td>
                      <td style={s.td}>{sub.plan}</td>
                      <td style={s.td}><span style={{ color: sub.status === "active" ? "#22c55e" : "#ef4444" }}>{sub.status}</span></td>
                      <td style={s.td}>$19.99</td>
                      <td style={s.td}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {!data && <div style={{ color: "#9ca3af" }}>Loading revenue data...</div>}
      </div>
    </div>
  );
}
