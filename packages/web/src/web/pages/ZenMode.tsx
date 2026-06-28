import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function ZenMode() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [zen, setZen] = useState({ enabled: false, dailyLimit: 10, breakDays: 0, hideScore: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zenSettings");
    if (saved) setZen(JSON.parse(saved));
  }, []);

  const save = async () => {
    setSaving(true);
    localStorage.setItem("zenSettings", JSON.stringify(zen));
    await fetch("/api/users/zen", { method: "PATCH", headers: { "Content-Type": "application/json", "x-user-id": userId }, body: JSON.stringify(zen) });
    setSaving(false);
  };

  const toggle = (key: keyof typeof zen) => setZen(z => ({ ...z, [key]: !z[key] }));

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center" },
    content: { padding: "1.5rem", display: "flex", flexDirection: "column" as const, gap: 12 },
    title: { color: "#fff", fontWeight: 700, marginLeft: "1rem" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.25rem" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    label: { color: "#fff", fontSize: "0.9rem", fontWeight: 600 },
    sub: { color: "#9ca3af", fontSize: "0.75rem", marginTop: 2 },
    toggle: (on: boolean) => ({ width: 44, height: 24, borderRadius: 12, background: on ? "linear-gradient(135deg,#a855f7,#06b6d4)" : "#2a2a3e", border: "none", cursor: "pointer", position: "relative" as const, transition: "all .2s" }),
    dot: (on: boolean) => ({ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute" as const, top: 3, left: on ? 23 : 3, transition: "left .2s" }),
    input: { background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", color: "#fff", width: 60, textAlign: "center" as const, fontSize: "0.9rem", outline: "none" },
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", marginTop: 8 },
  };

  const Row = ({ label, sub, on, onClick }: { label: string; sub: string; on: boolean; onClick: () => void }) => (
    <div style={s.card}>
      <div style={s.row}>
        <div><div style={s.label}>{label}</div><div style={s.sub}>{sub}</div></div>
        <button style={s.toggle(on)} onClick={onClick}><div style={s.dot(on)} /></button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/profile")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={s.title}>Zen Mode</span>
      </div>
      <div style={{ padding: "1.5rem 1.5rem 0.5rem" }}>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Anti-burnout tools. Real connections take time — don't rush it.</p>
      </div>
      <div style={s.content}>
        <Row label="Enable Zen Mode" sub="Activates all your limits below" on={zen.enabled} onClick={() => toggle("enabled")} />
        <div style={s.card}>
          <div style={s.row}>
            <div><div style={s.label}>Daily Swipe Limit</div><div style={s.sub}>Max profiles per day</div></div>
            <input style={s.input} type="number" min={1} max={100} value={zen.dailyLimit} onChange={e => setZen(z => ({ ...z, dailyLimit: Number(e.target.value) }))} />
          </div>
        </div>
        <div style={s.card}>
          <div style={s.row}>
            <div><div style={s.label}>App Break (Days)</div><div style={s.sub}>Temporarily pause your account</div></div>
            <input style={s.input} type="number" min={0} max={30} value={zen.breakDays} onChange={e => setZen(z => ({ ...z, breakDays: Number(e.target.value) }))} />
          </div>
        </div>
        <Row label="Hide VibeScore" sub="Focus on the person, not the number" on={zen.hideScore} onClick={() => toggle("hideScore")} />
        <button style={s.btn} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Zen Settings"}</button>
      </div>
    </div>
  );
}
