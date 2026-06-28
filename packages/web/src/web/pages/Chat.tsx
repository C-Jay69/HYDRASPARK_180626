import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface Conversation { id: string; matchName: string; lastMessage: string; lastAt: string; unread: number; isGoldSpark: boolean; }

export default function Chat() {
  const [, nav] = useLocation();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    fetch("/api/messages/conversations", { headers: { "x-user-id": userId! } })
      .then(r => r.json()).then(d => { setConvos(d.conversations || []); setLoading(false); });
  }, []);

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between" },
    title: { fontSize: "1.3rem", fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    item: { display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #0d0d0d", cursor: "pointer", transition: "background .2s" },
    avatar: { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 },
    info: { flex: 1, minWidth: 0 },
    nameRow: { display: "flex", alignItems: "center", gap: 6 },
    name: { color: "#fff", fontWeight: 600, fontSize: "0.95rem" },
    gold: { fontSize: "0.65rem", padding: "1px 6px", borderRadius: "1rem", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 700 },
    msg: { color: "#9ca3af", fontSize: "0.82rem", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
    time: { color: "#4b5563", fontSize: "0.75rem" },
    unread: { background: "linear-gradient(135deg,#a855f7,#06b6d4)", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 },
    empty: { padding: "3rem", textAlign: "center" as const, color: "#9ca3af" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/discover")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={s.title}>Messages</span>
        <span style={{ width: 24 }} />
      </div>

      {loading && <div style={s.empty}>Loading your sparks...</div>}
      {!loading && convos.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
          <p>No matches yet.</p>
          <p style={{ fontSize: "0.85rem", marginTop: 8 }}>Go swipe and start a conversation.</p>
          <button onClick={() => nav("/discover")} style={{ marginTop: "1.5rem", padding: "0.75rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", cursor: "pointer" }}>Discover</button>
        </div>
      )}

      {convos.map(c => (
        <div key={c.id} style={s.item} onClick={() => nav(`/chat/${c.id}`)} onMouseEnter={e => (e.currentTarget.style.background = "#0a0a0a")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <div style={s.avatar}>{c.matchName?.[0]?.toUpperCase() || "?"}</div>
          <div style={s.info}>
            <div style={s.nameRow}>
              <span style={s.name}>{c.matchName}</span>
              {c.isGoldSpark && <span style={s.gold}>★ Gold</span>}
            </div>
            <div style={s.msg}>{c.lastMessage || "Start the conversation..."}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={s.time}>{c.lastAt}</span>
            {c.unread > 0 && <span style={s.unread}>{c.unread}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
