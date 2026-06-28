import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface Profile { id: string; name: string; age?: number; bio: string; vibeScore: number; isVerified: boolean; isGoldSpark: boolean; interests: string[]; }

export default function Discover() {
  const [, nav] = useLocation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDir, setSwipeDir] = useState<null | "left" | "right">(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    fetch("/api/users/discover", { headers: { "x-user-id": userId! } })
      .then(r => r.json()).then(d => { setProfiles(d.profiles || []); setLoading(false); });
  }, []);

  const current = profiles[idx];

  const swipe = async (dir: "left" | "right") => {
    if (!current) return;
    setSwipeDir(dir);
    const userId = localStorage.getItem("userId");
    await fetch("/api/users/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId! },
      body: JSON.stringify({ targetId: current.id, direction: dir }),
    });
    setTimeout(() => { setSwipeDir(null); setIdx(i => i + 1); }, 300);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
    logo: { fontSize: "1.3rem", fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    card: { width: "100%", maxWidth: 420, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", overflow: "hidden", transition: "transform .3s", transform: swipeDir === "right" ? "translateX(120%) rotate(15deg)" : swipeDir === "left" ? "translateX(-120%) rotate(-15deg)" : "none" },
    avatar: { width: "100%", height: 280, background: "linear-gradient(135deg,#1a1a2e,#0d0d1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" },
    info: { padding: "1.5rem" },
    nameRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
    name: { color: "#fff", fontSize: "1.4rem", fontWeight: 700 },
    badge: (color: string) => ({ padding: "2px 8px", borderRadius: "1rem", fontSize: "0.7rem", fontWeight: 700, background: color, color: "#fff" }),
    score: { display: "flex", alignItems: "center", gap: 6, marginBottom: 12 },
    scoreLabel: { color: "#9ca3af", fontSize: "0.85rem" },
    scoreBar: { flex: 1, height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" },
    scoreFill: (val: number) => ({ height: "100%", width: `${val}%`, background: "linear-gradient(90deg,#a855f7,#06b6d4)", borderRadius: 3 }),
    bio: { color: "#9ca3af", fontSize: "0.9rem", marginBottom: 12 },
    chips: { display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: "1rem" },
    chip: { padding: "3px 10px", borderRadius: "2rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", fontSize: "0.75rem" },
    actions: { display: "flex", justifyContent: "center", gap: 16, padding: "1.5rem 0 0.5rem" },
    passBtn: { width: 60, height: 60, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    likeBtn: { width: 60, height: 60, borderRadius: "50%", background: "rgba(168,85,247,0.1)", border: "2px solid rgba(168,85,247,0.3)", color: "#a855f7", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    navBar: { width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-around", marginTop: "1.5rem", background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1rem", padding: "0.75rem" },
    navItem: { color: "#9ca3af", fontSize: "0.75rem", textAlign: "center" as const, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  };

  if (loading) return <div style={{...s.page, justifyContent: "center"}}><div style={{color: "#a855f7"}}>Finding your sparks...</div></div>;

  if (!current) return (
    <div style={{...s.page, justifyContent: "center"}}>
      <div style={{ textAlign: "center", color: "#9ca3af" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
        <p>You've seen everyone nearby.</p>
        <p>Check back tomorrow for fresh sparks.</p>
        <button onClick={() => nav("/meetups")} style={{ marginTop: "1.5rem", padding: "0.75rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", cursor: "pointer" }}>Explore Meetups</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.logo}>HydraSpark</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("/guardian")} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.4rem 0.8rem", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem" }}>🛡 Guardian</button>
          <button onClick={() => nav("/profile")} style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "0.5rem", padding: "0.4rem 0.8rem", color: "#a855f7", cursor: "pointer", fontSize: "0.8rem" }}>Profile</button>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.avatar}>👤</div>
        <div style={s.info}>
          <div style={s.nameRow}>
            <span style={s.name}>{current.name}</span>
            {current.isVerified && <span style={s.badge("linear-gradient(135deg,#06b6d4,#0891b2)")}>✓ Verified</span>}
            {current.isGoldSpark && <span style={s.badge("linear-gradient(135deg,#f59e0b,#d97706)")}>★ Gold</span>}
          </div>
          <div style={s.score}>
            <span style={s.scoreLabel}>VibeScore</span>
            <div style={s.scoreBar}><div style={s.scoreFill(current.vibeScore)} /></div>
            <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" }}>{current.vibeScore}%</span>
          </div>
          <p style={s.bio}>{current.bio || "Still figuring it out..."}</p>
          <div style={s.chips}>{(current.interests || []).slice(0,4).map(i => <span key={i} style={s.chip}>{i}</span>)}</div>
          <div style={s.actions}>
            <button style={s.passBtn} onClick={() => swipe("left")}>✕</button>
            <button style={s.likeBtn} onClick={() => swipe("right")}>♥</button>
          </div>
        </div>
      </div>

      <div style={s.navBar}>
        {[{ icon: "🔥", label: "Discover", path: "/discover" }, { icon: "💬", label: "Chat", path: "/chat" }, { icon: "📅", label: "Meetups", path: "/meetups" }, { icon: "🎯", label: "Premium", path: "/premium" }].map(n => (
          <div key={n.path} style={s.navItem} onClick={() => nav(n.path)}><span>{n.icon}</span><span>{n.label}</span></div>
        ))}
      </div>
    </div>
  );
}
