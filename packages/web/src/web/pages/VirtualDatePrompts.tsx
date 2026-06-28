import { useState } from "react";
import { useLocation } from "wouter";

export default function VirtualDatePrompts() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/virtual-date/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ previousPrompts: history }),
    });
    const d = await res.json();
    if (d.prompt) { setHistory(h => [...h, d.prompt]); setPrompt(d.prompt); }
    setLoading(false);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "2rem 1.5rem" },
    header: { width: "100%", display: "flex", alignItems: "center", marginBottom: "2rem" },
    card: { width: "100%", maxWidth: 480, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2.5rem", textAlign: "center" as const },
    prompt: { fontSize: "1.2rem", color: "#fff", fontWeight: 600, lineHeight: 1.6, marginBottom: "2rem", minHeight: 80 },
    btn: { padding: "0.85rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
    history: { width: "100%", maxWidth: 480, marginTop: "2rem" },
    histTitle: { color: "#4b5563", fontSize: "0.8rem", marginBottom: 8 },
    histItem: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#9ca3af", fontSize: "0.85rem", marginBottom: 8 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/virtual-date")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Conversation Prompts</span>
      </div>
      <div style={s.card}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎲</div>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "1.5rem" }}>AI-generated conversation starters to keep your virtual date fun and real.</p>
        <div style={s.prompt}>{prompt || "Hit the button for your first prompt..."}</div>
        <button style={s.btn} onClick={generate} disabled={loading}>{loading ? "Thinking..." : prompt ? "Next Prompt" : "Generate Prompt"}</button>
      </div>
      {history.length > 1 && (
        <div style={s.history}>
          <div style={s.histTitle}>PREVIOUS PROMPTS</div>
          {[...history].reverse().slice(1).map((p, i) => <div key={i} style={s.histItem}>{p}</div>)}
        </div>
      )}
    </div>
  );
}
