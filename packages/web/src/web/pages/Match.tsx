import { useLocation, useParams } from "wouter";

export default function Match() {
  const [, nav] = useLocation();
  const params = useParams<{ id: string }>();

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" as const },
    spark: { fontSize: "4rem", marginBottom: "1rem", animation: "pulse 1s infinite" },
    h1: { fontSize: "2rem", fontWeight: 900, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 },
    p: { color: "#9ca3af", fontSize: "0.95rem", maxWidth: 300, margin: "0 auto 2rem" },
    row: { display: "flex", gap: 12 },
    btn: (grad: string) => ({ padding: "0.85rem 1.5rem", borderRadius: "0.75rem", background: grad, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }),
    iceCard: { width: "100%", maxWidth: 400, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "1.5rem", marginTop: "2rem" },
    iceTitle: { color: "#9ca3af", fontSize: "0.8rem", marginBottom: 12, letterSpacing: 1 },
  };

  const ICEBREAKERS = [
    "Two truths and a lie — go.",
    "What's the most spontaneous thing you've done?",
    "Desert island: one book, one song, one snack?",
    "What's your hot take that most people disagree with?",
  ];
  const pick = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

  return (
    <div style={s.page}>
      <div style={s.spark}>⚡</div>
      <h1 style={s.h1}>It's a Spark!</h1>
      <p style={s.p}>You both swiped right. Don't blow it. Say something real.</p>
      <div style={s.row}>
        <button style={s.btn("linear-gradient(135deg,#a855f7,#06b6d4)")} onClick={() => nav(`/chat/${params.id}`)}>Start Chatting</button>
        <button style={s.btn("rgba(168,85,247,0.15)")} onClick={() => nav("/discover")}>Keep Swiping</button>
      </div>
      <div style={s.iceCard}>
        <div style={s.iceTitle}>ICEBREAKER SUGGESTION</div>
        <div style={{ color: "#fff", fontSize: "1rem", fontStyle: "italic" }}>"{pick}"</div>
        <button style={{ ...s.btn("linear-gradient(135deg,#a855f7,#06b6d4)"), width: "100%", marginTop: "1rem" }} onClick={() => nav(`/chat/${params.id}`)}>Send This →</button>
      </div>
    </div>
  );
}
