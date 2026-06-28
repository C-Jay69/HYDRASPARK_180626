import { useState } from "react";
import { useLocation } from "wouter";

export default function VirtualDate() {
  const [, nav] = useLocation();
  const [started, setStarted] = useState(false);

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center" },
    header: { width: "100%", padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center" },
    content: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" as const },
    videoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "2rem", width: "100%", maxWidth: 480 },
    videoBox: { aspectRatio: "4/3", background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 8 },
    controls: { display: "flex", gap: 12, marginBottom: "2rem" },
    ctrlBtn: (color: string) => ({ width: 48, height: 48, borderRadius: "50%", background: color, border: "none", color: "#fff", fontSize: "1.1rem", cursor: "pointer" }),
    promptBtn: { padding: "0.75rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" },
    goldNote: { color: "#f59e0b", fontSize: "0.85rem", marginTop: "1rem" },
  };

  const isGold = localStorage.getItem("isGoldSpark") === "true";

  if (!isGold) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        </div>
        <div style={s.content}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", marginBottom: 8 }}>Gold Spark Feature</h2>
          <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>Virtual Dates are exclusive to Gold Spark members.</p>
          <button style={{ padding: "0.85rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#f59e0b,#a855f7)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }} onClick={() => nav("/premium")}>Upgrade to Gold Spark →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Virtual Date</span>
      </div>
      {!started ? (
        <div style={s.content}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💻</div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", marginBottom: 8 }}>Start a Virtual Date</h2>
          <p style={{ color: "#9ca3af", marginBottom: "2rem", maxWidth: 340 }}>Video-powered date with AI conversation prompts to keep things interesting.</p>
          <button style={{ padding: "0.85rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }} onClick={() => setStarted(true)}>Start Session</button>
        </div>
      ) : (
        <div style={{ padding: "1.5rem", width: "100%", maxWidth: 500 }}>
          <div style={s.videoGrid}>
            <div style={s.videoBox}><span style={{ fontSize: "2rem" }}>👤</span><span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>You</span></div>
            <div style={s.videoBox}><span style={{ fontSize: "2rem" }}>👤</span><span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Your Match</span></div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={s.controls}>
              <button style={s.ctrlBtn("rgba(239,68,68,0.2)")} title="Mute">🎤</button>
              <button style={s.ctrlBtn("rgba(168,85,247,0.2)")} title="Camera">📷</button>
              <button style={s.ctrlBtn("rgba(239,68,68,0.8)")} onClick={() => setStarted(false)} title="End">✕</button>
            </div>
            <button style={s.promptBtn} onClick={() => nav("/virtual-date/prompts")}>Get Conversation Prompt 🎲</button>
          </div>
        </div>
      )}
    </div>
  );
}
