import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface Stats { totalUsers: number; activeToday: number; goldSparks: number; verifiedUsers: number; pendingVerifications: number; mrr: number; totalRevenue: number; newUsersToday: number; flaggedMessages: number; }

export default function AdminDashboard() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") { nav("/admin/login"); return; }
    fetch("/api/admin/stats", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setStats(d.stats));
  }, []);

  const logout = () => { localStorage.clear(); nav("/admin/login"); };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    logo: { fontSize: "1rem", fontWeight: 800, color: "#fff" },
    nav: { display: "flex", gap: 8 },
    navBtn: (active?: boolean) => ({ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", background: active ? "rgba(239,68,68,0.2)" : "transparent", border: `1px solid ${active ? "rgba(239,68,68,0.4)" : "#2a2a3e"}`, color: active ? "#ef4444" : "#9ca3af", cursor: "pointer", fontSize: "0.8rem" }),
    content: { padding: "1.5rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: "2rem" },
    stat: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem" },
    statVal: { fontSize: "1.8rem", fontWeight: 900, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    statLabel: { color: "#9ca3af", fontSize: "0.75rem", marginTop: 4 },
    alertCard: { background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "1rem", padding: "1.25rem", marginBottom: 12 },
  };

  const statItems = stats ? [
    { val: stats.totalUsers.toLocaleString(), label: "Total Users" },
    { val: stats.activeToday.toLocaleString(), label: "Active Today" },
    { val: stats.goldSparks.toLocaleString(), label: "Gold Sparks" },
    { val: stats.verifiedUsers.toLocaleString(), label: "Verified Users" },
    { val: `$${(stats.mrr/100).toFixed(0)}`, label: "MRR (USD)" },
    { val: `$${(stats.totalRevenue/100).toFixed(0)}`, label: "Total Revenue" },
    { val: stats.newUsersToday.toLocaleString(), label: "New Today" },
    { val: stats.flaggedMessages.toLocaleString(), label: "Flagged Msgs" },
  ] : [];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.logo}>🛡 HydraSpark Admin</span>
        <div style={s.nav}>
          <button style={s.navBtn(true)} onClick={() => nav("/admin")}>Dashboard</button>
          <button style={s.navBtn()} onClick={() => nav("/admin/users")}>Users</button>
          <button style={s.navBtn()} onClick={() => nav("/admin/revenue")}>Revenue</button>
          <button style={s.navBtn()} onClick={() => nav("/admin/verification")}>Verification</button>
          <button style={{ ...s.navBtn(), color: "#ef4444" }} onClick={logout}>Logout</button>
        </div>
      </div>
      <div style={s.content}>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: "1.5rem" }}>Overview</h2>
        <div style={s.grid}>
          {statItems.map(({ val, label }) => (
            <div key={label} style={s.stat}>
              <div style={s.statVal}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>
        {stats?.pendingVerifications ? (
          <div style={s.alertCard}>
            <div style={{ color: "#ef4444", fontWeight: 700, marginBottom: 4 }}>⚠ {stats.pendingVerifications} Pending Verifications</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: 8 }}>Users waiting for ID approval.</div>
            <button style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem" }} onClick={() => nav("/admin/verification")}>Review Queue →</button>
          </div>
        ) : null}
        {!stats && <div style={{ color: "#9ca3af" }}>Loading stats...</div>}
      </div>
    </div>
  );
}
