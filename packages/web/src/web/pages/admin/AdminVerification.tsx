import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface VerRequest { id: string; userId: string; userName: string; userEmail: string; selfieUrl?: string; idUrl?: string; submittedAt: string; }

export default function AdminVerification() {
  const [, nav] = useLocation();
  const adminId = localStorage.getItem("userId") || "";
  const [queue, setQueue] = useState<VerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") { nav("/admin/login"); return; }
    fetch("/api/admin/verification/queue", { headers: { "x-user-id": adminId } })
      .then(r => r.json()).then(d => { setQueue(d.queue || []); setLoading(false); });
  }, []);

  const review = async (userId: string, status: "approved" | "rejected") => {
    await fetch("/api/admin/verification/review", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": adminId },
      body: JSON.stringify({ userId, status }),
    });
    setQueue(q => q.filter(r => r.userId !== userId));
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" },
    content: { padding: "1.5rem" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.5rem", marginBottom: 12 },
    row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    name: { color: "#fff", fontWeight: 700 },
    email: { color: "#9ca3af", fontSize: "0.8rem" },
    imgs: { display: "flex", gap: 8, margin: "1rem 0" },
    imgBox: { flex: 1, background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" as const, color: "#9ca3af", fontSize: "0.75rem" },
    btns: { display: "flex", gap: 8 },
    approveBtn: { flex: 1, padding: "0.65rem", borderRadius: "0.75rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", cursor: "pointer", fontWeight: 600 },
    rejectBtn: { flex: 1, padding: "0.65rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontWeight: 600 },
    navBtn: { padding: "0.4rem 0.8rem", borderRadius: "0.5rem", background: "transparent", border: "1px solid #2a2a3e", color: "#9ca3af", cursor: "pointer", fontSize: "0.8rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ color: "#fff", fontWeight: 700 }}>🛡 HydraSpark Admin</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.navBtn} onClick={() => nav("/admin")}>Dashboard</button>
          <button style={s.navBtn} onClick={() => nav("/admin/users")}>Users</button>
          <button style={s.navBtn} onClick={() => nav("/admin/revenue")}>Revenue</button>
          <button style={{ ...s.navBtn, color: "#06b6d4", borderColor: "rgba(6,182,212,0.4)" }}>Verification</button>
        </div>
      </div>
      <div style={s.content}>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: "1.5rem" }}>ID Verification Queue {queue.length > 0 && <span style={{ color: "#ef4444", fontSize: "1rem" }}>({queue.length})</span>}</h2>
        {loading && <div style={{ color: "#9ca3af" }}>Loading queue...</div>}
        {!loading && queue.length === 0 && <div style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No pending verifications. All clear.</div>}
        {queue.map(req => (
          <div key={req.id} style={s.card}>
            <div style={s.row}>
              <div>
                <div style={s.name}>{req.userName}</div>
                <div style={s.email}>{req.userEmail}</div>
                <div style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: 4 }}>Submitted: {new Date(req.submittedAt).toLocaleString()}</div>
              </div>
            </div>
            <div style={s.imgs}>
              <div style={s.imgBox}>
                {req.selfieUrl ? <img src={req.selfieUrl} style={{ width: "100%", borderRadius: "0.5rem", marginBottom: 4 }} alt="selfie" /> : <div style={{ padding: "2rem" }}>No selfie</div>}
                <div>Selfie</div>
              </div>
              <div style={s.imgBox}>
                {req.idUrl ? <img src={req.idUrl} style={{ width: "100%", borderRadius: "0.5rem", marginBottom: 4 }} alt="id" /> : <div style={{ padding: "2rem" }}>No ID</div>}
                <div>Government ID</div>
              </div>
            </div>
            <div style={s.btns}>
              <button style={s.approveBtn} onClick={() => review(req.userId, "approved")}>✓ Approve</button>
              <button style={s.rejectBtn} onClick={() => review(req.userId, "rejected")}>✕ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
