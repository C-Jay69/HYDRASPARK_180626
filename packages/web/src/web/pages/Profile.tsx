import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, nav] = useLocation();
  const userId = localStorage.getItem("userId") || "";
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users/me", { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => { setProfile(d); setForm(d); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ username: form.username, bio: form.bio, language: form.language }),
    });
    setProfile(form);
    setSaving(false);
    setEditing(false);
  };

  const logout = () => { localStorage.clear(); nav("/auth/login"); };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between" },
    title: { color: "#fff", fontWeight: 700, fontSize: "1.1rem" },
    hero: { padding: "2rem 1.5rem", display: "flex", flexDirection: "column" as const, alignItems: "center", borderBottom: "1px solid #1a1a2e" },
    avatar: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#fff", fontWeight: 700, marginBottom: "1rem" },
    name: { color: "#fff", fontWeight: 800, fontSize: "1.3rem" },
    badges: { display: "flex", gap: 8, marginTop: 8 },
    badge: (color: string) => ({ padding: "3px 10px", borderRadius: "1rem", fontSize: "0.7rem", fontWeight: 700, background: color, color: "#fff" }),
    section: { padding: "1.5rem" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #0d0d0d" },
    rowLabel: { color: "#9ca3af", fontSize: "0.85rem" },
    rowVal: { color: "#fff", fontSize: "0.9rem", fontWeight: 500 },
    input: { background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#fff", fontSize: "0.9rem", outline: "none" },
    btn: (color: string) => ({ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: color, border: "none", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }),
    linkRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", borderBottom: "1px solid #0d0d0d", cursor: "pointer" },
    linkLabel: { color: "#fff", fontSize: "0.9rem" },
    arrow: { color: "#9ca3af" },
  };

  if (!profile) return <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#a855f7" }}>Loading...</span></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={s.title}>My Profile</span>
        <button onClick={() => setEditing(!editing)} style={s.btn(editing ? "rgba(239,68,68,0.2)" : "rgba(168,85,247,0.2)")}>{editing ? "Cancel" : "Edit"}</button>
      </div>

      <div style={s.hero}>
        <div style={s.avatar}>{profile.name?.[0] || "?"}</div>
        {editing ? (
          <input style={{ ...s.input, marginBottom: 8 }} value={form.username || form.name || ""} onChange={e => setForm((f: any) => ({ ...f, username: e.target.value }))} placeholder="Username" />
        ) : (
          <div style={s.name}>{profile.username || profile.name}</div>
        )}
        <div style={s.badges}>
          {profile.isVerified && <span style={s.badge("linear-gradient(135deg,#06b6d4,#0891b2)")}>✓ Verified</span>}
          {profile.isGoldSpark && <span style={s.badge("linear-gradient(135deg,#f59e0b,#d97706)")}>★ Gold Spark</span>}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.row}>
          <span style={s.rowLabel}>Bio</span>
          {editing ? <textarea style={{ ...s.input, minWidth: 220 }} value={form.bio || ""} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} /> : <span style={s.rowVal}>{profile.bio || "—"}</span>}
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Email</span>
          <span style={s.rowVal}>{profile.email}</span>
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Response Score</span>
          <span style={{ ...s.rowVal, color: "#a855f7" }}>{profile.responseScore || 100}%</span>
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>Language</span>
          {editing ? (
            <select style={s.input} value={form.language || "en"} onChange={e => setForm((f: any) => ({ ...f, language: e.target.value }))}>
              {[["en","English"],["es","Español"],["zh","中文"],["fr","Français"],["hi","हिन्दी"]].map(([c,l]) => <option key={c} value={c}>{l}</option>)}
            </select>
          ) : <span style={s.rowVal}>{profile.language || "en"}</span>}
        </div>

        {editing && (
          <button onClick={save} disabled={saving} style={{ ...s.btn("linear-gradient(135deg,#a855f7,#06b6d4)"), width: "100%", padding: "0.85rem", marginTop: "1rem" }}>{saving ? "Saving..." : "Save Changes"}</button>
        )}
      </div>

      <div style={{ padding: "0 1.5rem" }}>
        <div style={s.linkRow} onClick={() => nav("/verification")}>
          <span style={s.linkLabel}>Verification</span><span style={s.arrow}>→</span>
        </div>
        <div style={s.linkRow} onClick={() => nav("/premium")}>
          <span style={s.linkLabel}>Gold Spark Premium</span><span style={s.arrow}>→</span>
        </div>
        <div style={s.linkRow} onClick={() => nav("/zen")}>
          <span style={s.linkLabel}>Zen Mode</span><span style={s.arrow}>→</span>
        </div>
        <div style={s.linkRow} onClick={logout}>
          <span style={{ ...s.linkLabel, color: "#ef4444" }}>Log Out</span>
        </div>
      </div>
    </div>
  );
}
