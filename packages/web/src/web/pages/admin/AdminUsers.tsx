import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminUsers() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") { nav("/admin/login"); return; }
    fetch("/api/admin/users", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false); });
  }, []);

  const ban = async (id: string) => {
    await fetch(`/api/admin/users/${id}/ban`, { method: "POST", headers: { "x-user-id": userId } });
    setUsers(u => u.map(user => user.id === id ? { ...user, banned: true } : user));
  };

  const filtered = users.filter(u => u.email?.includes(search) || u.name?.toLowerCase().includes(search.toLowerCase()));

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    content: { padding: "1.5rem" },
    searchRow: { display: "flex", gap: 8, marginBottom: "1.5rem" },
    input: { flex: 1, background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.65rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none" },
    table: { width: "100%", borderCollapse: "collapse" as const },
    th: { color: "#9ca3af", fontSize: "0.75rem", padding: "0.5rem 0.75rem", textAlign: "left" as const, borderBottom: "1px solid #1a1a2e" },
    td: { color: "#fff", fontSize: "0.85rem", padding: "0.75rem", borderBottom: "1px solid #0d0d0d" },
    badge: (color: string) => ({ padding: "2px 6px", borderRadius: "0.5rem", fontSize: "0.7rem", fontWeight: 700, background: color, color: "#fff" }),
    banBtn: { padding: "0.3rem 0.75rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" },
    navBtn: { padding: "0.4rem 0.8rem", borderRadius: "0.5rem", background: "transparent", border: "1px solid #2a2a3e", color: "#9ca3af", cursor: "pointer", fontSize: "0.8rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ color: "#fff", fontWeight: 700 }}>🛡 HydraSpark Admin</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.navBtn} onClick={() => nav("/admin")}>Dashboard</button>
          <button style={{ ...s.navBtn, color: "#a855f7", borderColor: "rgba(168,85,247,0.4)" }}>Users</button>
          <button style={s.navBtn} onClick={() => nav("/admin/revenue")}>Revenue</button>
          <button style={s.navBtn} onClick={() => nav("/admin/verification")}>Verification</button>
        </div>
      </div>
      <div style={s.content}>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: "1.5rem" }}>User Management ({users.length})</h2>
        <div style={s.searchRow}>
          <input style={s.input} placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div style={{ color: "#9ca3af" }}>Loading users...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Name","Email","Role","Status","Verified","Gold","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={s.td}>{u.name || u.username || "—"}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}><span style={s.badge(u.role === "admin" ? "rgba(239,68,68,0.3)" : "rgba(168,85,247,0.2)")}>{u.role || "user"}</span></td>
                    <td style={s.td}><span style={s.badge(u.banned ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.2)")}>{u.banned ? "Banned" : "Active"}</span></td>
                    <td style={s.td}>{u.isVerified ? "✓" : "—"}</td>
                    <td style={s.td}>{u.isGoldSpark ? "★" : "—"}</td>
                    <td style={s.td}>{!u.banned && <button style={s.banBtn} onClick={() => ban(u.id)}>Ban</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
