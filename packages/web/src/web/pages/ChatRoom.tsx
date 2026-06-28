import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { io, Socket } from "socket.io-client";

interface Message { id: string; senderId: string; text: string; createdAt: string; isFlagged?: boolean; }

export default function ChatRoom() {
  const [, nav] = useLocation();
  const params = useParams<{ id: string }>();
  const connectionId = params.id;
  const userId = localStorage.getItem("userId") || "";
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchName, setMatchName] = useState("...");
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history
    fetch(`/api/messages/${connectionId}`, { headers: { "x-user-id": userId } })
      .then(r => r.json()).then(d => { setMsgs(d.messages || []); setMatchName(d.matchName || "Match"); });

    // Socket.io
    const s = io({ path: "/socket.io", auth: { userId } });
    s.emit("join-room", connectionId);
    s.on("message", (msg: Message) => setMsgs(prev => [...prev, msg]));
    setSocket(s);
    return () => { s.disconnect(); };
  }, [connectionId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!text.trim() || !socket) return;
    socket.emit("send-message", { connectionId, text, senderId: userId });
    setText("");
  };

  const sendIcebreaker = async () => {
    const res = await fetch("/api/messages/icebreaker", { method: "POST", headers: { "Content-Type": "application/json", "x-user-id": userId }, body: JSON.stringify({ connectionId }) });
    const d = await res.json();
    setIcebreaker(d.prompt);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { padding: "1rem 1.5rem", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: "1rem", background: "#0a0a0a" },
    name: { color: "#fff", fontWeight: 700, fontSize: "1rem" },
    msgs: { flex: 1, overflowY: "auto" as const, padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: 12 },
    bubble: (mine: boolean) => ({ maxWidth: "70%", padding: "0.65rem 1rem", borderRadius: mine ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0", background: mine ? "linear-gradient(135deg,#a855f7,#06b6d4)" : "#1a1a2e", color: "#fff", fontSize: "0.9rem", alignSelf: mine ? "flex-end" : "flex-start" }),
    flagged: { opacity: 0.5, fontStyle: "italic" as const },
    input: { display: "flex", gap: 8, padding: "1rem 1.5rem", borderTop: "1px solid #1a1a2e", background: "#0a0a0a" },
    textbox: { flex: 1, background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.65rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none" },
    sendBtn: { padding: "0.65rem 1.25rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 },
    icebox: { margin: "0.5rem 1.5rem", padding: "0.75rem 1rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "0.75rem", color: "#a855f7", fontSize: "0.85rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/chat")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{matchName[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={s.name}>{matchName}</div>
          <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Active now</div>
        </div>
        <button onClick={() => nav("/guardian")} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.4rem 0.8rem", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" }}>🛡</button>
      </div>

      {icebreaker && <div style={s.icebox}>🎲 <strong>Icebreaker:</strong> {icebreaker} <button onClick={() => setIcebreaker(null)} style={{ marginLeft: 8, background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>✕</button></div>}

      <div style={s.msgs}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.senderId === userId ? "flex-end" : "flex-start" }}>
            <div style={{ ...s.bubble(m.senderId === userId), ...(m.isFlagged ? s.flagged : {}) }}>
              {m.isFlagged ? "[Message flagged for review]" : m.text}
            </div>
            <span style={{ color: "#4b5563", fontSize: "0.65rem", marginTop: 2 }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={s.input}>
        <button onClick={sendIcebreaker} style={{ padding: "0.65rem", borderRadius: "0.75rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", cursor: "pointer" }} title="Icebreaker">🎲</button>
        <input style={s.textbox} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Say something real..." />
        <button style={s.sendBtn} onClick={send}>→</button>
      </div>
    </div>
  );
}
