import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function VerificationStatus() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | null>(null);

  useEffect(() => {
    fetch("/api/verification/status", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setStatus(d.status));
  }, []);

  const configs = {
    pending: { icon: "⏳", title: "Under Review", msg: "Your documents are in the queue. Our team reviews within 24 hours.", color: "#f59e0b" },
    approved: { icon: "✓", title: "Verified!", msg: "You're verified. The badge is live on your profile.", color: "#22c55e" },
    rejected: { icon: "✕", title: "Not Approved", msg: "Something wasn't clear enough. Please resubmit with better photos.", color: "#ef4444" },
  };

  const cfg = status ? configs[status] : null;

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "2rem" },
    card: { textAlign: "center" as const, maxWidth: 400 },
    icon: { fontSize: "4rem", marginBottom: "1rem" },
    title: (color: string) => ({ fontSize: "1.5rem", fontWeight: 800, color, marginBottom: 8 }),
    msg: { color: "#9ca3af", lineHeight: 1.7, marginBottom: "2rem" },
    btn: { padding: "0.85rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" },
  };

  if (!cfg) return <div style={{ ...s.page }}><span style={{ color: "#a855f7" }}>Loading...</span></div>;

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>{cfg.icon}</div>
        <h2 style={s.title(cfg.color)}>{cfg.title}</h2>
        <p style={s.msg}>{cfg.msg}</p>
        {status === "rejected" && <button style={s.btn} onClick={() => nav("/verification/selfie")}>Resubmit</button>}
        {status !== "rejected" && <button style={s.btn} onClick={() => nav("/profile")}>Back to Profile</button>}
      </div>
    </div>
  );
}
