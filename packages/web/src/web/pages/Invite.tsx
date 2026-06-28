import { useState } from "react";
import { useLocation } from "wouter";

export default function Invite() {
  const [, nav] = useLocation();
  const [copied, setCopied] = useState(false);
  const userId = localStorage.getItem("userId") || "";
  const link = `${window.location.origin}/auth/register?ref=${userId}`;

  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "2rem 1.5rem" },
    header: { width: "100%", display: "flex", alignItems: "center", marginBottom: "2rem" },
    card: { width: "100%", maxWidth: 480, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2rem", textAlign: "center" as const },
    h2: { fontSize: "1.4rem", fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 },
    p: { color: "#9ca3af", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.6 },
    linkBox: { background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#a855f7", fontSize: "0.85rem", marginBottom: "1rem", wordBreak: "break-all" as const },
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: copied ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg,#a855f7,#06b6d4)", border: copied ? "1px solid rgba(34,197,94,0.5)" : "none", color: copied ? "#22c55e" : "#fff", fontWeight: 700, cursor: "pointer" },
    shareRow: { display: "flex", gap: 8, marginTop: "1rem" },
    shareBtn: { flex: 1, padding: "0.65rem", borderRadius: "0.75rem", background: "#111", border: "1px solid #2a2a3e", color: "#9ca3af", cursor: "pointer", fontSize: "0.85rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Invite Friends</span>
      </div>
      <div style={s.card}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
        <h2 style={s.h2}>Invite & Earn</h2>
        <p style={s.p}>Invite 3 friends and get 1 month of Gold Spark free. They get priority access. Everyone wins.</p>
        <div style={s.linkBox}>{link}</div>
        <button style={s.btn} onClick={copy}>{copied ? "✓ Copied!" : "Copy Invite Link"}</button>
        <div style={s.shareRow}>
          <button style={s.shareBtn} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(link)}`)}>WhatsApp</button>
          <button style={s.shareBtn} onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}`)}>Telegram</button>
          <button style={s.shareBtn} onClick={() => window.open(`mailto:?subject=Join HydraSpark&body=${encodeURIComponent(link)}`)}>Email</button>
        </div>
      </div>
    </div>
  );
}
