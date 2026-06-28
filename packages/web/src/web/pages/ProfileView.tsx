import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";

export default function ProfileView() {
  const [, nav] = useLocation();
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    fetch(`/api/users/${params.id}`, { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => setProfile(d.user));
  }, [params.id]);

  const report = async () => {
    await fetch("/api/users/report", { method: "POST", headers: { "Content-Type": "application/json", "x-user-id": userId }, body: JSON.stringify({ targetId: params.id }) });
    alert("Reported. Our safety team will review.");
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center" },
    hero: { padding: "2rem", display: "flex", flexDirection: "column" as const, alignItems: "center", borderBottom: "1px solid #1a1a2e" },
    avatar: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#fff", fontWeight: 700, marginBottom: "1rem" },
    name: { color: "#fff", fontWeight: 800, fontSize: "1.3rem" },
    badges: { display: "flex", gap: 8, marginTop: 8, marginBottom: 8 },
    badge: (color: string) => ({ padding: "3px 10px", borderRadius: "1rem", fontSize: "0.7rem", fontWeight: 700, background: color, color: "#fff" }),
    bio: { color: "#9ca3af", fontSize: "0.9rem", textAlign: "center" as const, maxWidth: 300 },
    section: { padding: "1.5rem" },
    chips: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
    chip: { padding: "3px 10px", borderRadius: "2rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", fontSize: "0.75rem" },
    actions: { display: "flex", gap: 12, padding: "0 1.5rem 2rem" },
    btn: (c: string) => ({ flex: 1, padding: "0.85rem", borderRadius: "0.75rem", background: c, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }),
  };

  if (!profile) return <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#a855f7" }}>Loading...</span></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav(-1 as any)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
      </div>
      <div style={s.hero}>
        <div style={s.avatar}>{profile.name?.[0] || "?"}</div>
        <div style={s.name}>{profile.username || profile.name}</div>
        <div style={s.badges}>
          {profile.isVerified && <span style={s.badge("linear-gradient(135deg,#06b6d4,#0891b2)")}>✓ Verified</span>}
          {profile.isGoldSpark && <span style={s.badge("linear-gradient(135deg,#f59e0b,#d97706)")}>★ Gold</span>}
        </div>
        <p style={s.bio}>{profile.bio || "Still figuring it out..."}</p>
      </div>
      {profile.interests?.length > 0 && (
        <div style={s.section}>
          <div style={{ color: "#9ca3af", fontSize: "0.8rem", marginBottom: 8 }}>INTERESTS</div>
          <div style={s.chips}>{profile.interests.map((i: string) => <span key={i} style={s.chip}>{i}</span>)}</div>
        </div>
      )}
      <div style={s.actions}>
        <button style={s.btn("linear-gradient(135deg,#a855f7,#06b6d4)")} onClick={() => nav(`/chat`)}>Message</button>
        <button style={s.btn("rgba(239,68,68,0.2)")} onClick={report}>Report</button>
      </div>
    </div>
  );
}
