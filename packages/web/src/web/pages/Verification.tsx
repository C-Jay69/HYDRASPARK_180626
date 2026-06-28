import { useLocation } from "wouter";

export default function Verification() {
  const [, nav] = useLocation();
  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "2rem 1.5rem" },
    header: { width: "100%", display: "flex", alignItems: "center", marginBottom: "2rem" },
    card: { width: "100%", maxWidth: 480, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2rem" },
    h2: { fontSize: "1.4rem", fontWeight: 800, background: "linear-gradient(135deg,#06b6d4,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 },
    p: { color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" },
    steps: { display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: "2rem" },
    step: { display: "flex", alignItems: "center", gap: 12, background: "#111", border: "1px solid #1a1a2e", borderRadius: "0.75rem", padding: "1rem" },
    num: { width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 },
    stepText: { color: "#fff", fontSize: "0.9rem" },
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#06b6d4,#a855f7)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
  };
  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/profile")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Get Verified</span>
      </div>
      <div style={s.card}>
        <h2 style={s.h2}>✓ Verification</h2>
        <p style={s.p}>Verified profiles get more matches. It takes 2 minutes and proves you're a real human (probably).</p>
        <div style={s.steps}>
          {["Take a selfie facing the camera","Upload a valid government ID","Wait for admin review (usually under 24h)"].map((t, i) => (
            <div key={i} style={s.step}><div style={s.num}>{i+1}</div><div style={s.stepText}>{t}</div></div>
          ))}
        </div>
        <button style={s.btn} onClick={() => nav("/verification/selfie")}>Start Verification →</button>
      </div>
    </div>
  );
}
