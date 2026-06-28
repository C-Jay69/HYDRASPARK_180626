import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, nav] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (d.user?.role === "admin") {
      localStorage.setItem("userId", d.user.id);
      localStorage.setItem("userRole", "admin");
      nav("/admin");
    } else {
      setError("Not an admin account.");
    }
    setLoading(false);
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2.5rem", width: "100%", maxWidth: 400 },
    logo: { textAlign: "center" as const, marginBottom: "2rem" },
    badge: { display: "inline-block", padding: "0.3rem 1rem", borderRadius: "2rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.8rem", fontWeight: 700 },
    h2: { color: "#fff", fontWeight: 800, fontSize: "1.3rem", marginBottom: "1.5rem", textAlign: "center" as const, marginTop: 8 },
    label: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: 4, display: "block" },
    input: { width: "100%", background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box" as const },
    err: { color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem", textAlign: "center" as const },
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.badge}>🔐 Admin Access</span>
          <h2 style={s.h2}>HydraSpark Command</h2>
        </div>
        <label style={s.label}>Admin Email</label>
        <input style={s.input} type="email" placeholder="admin@hydraspark.app" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} onKeyDown={e => e.key === "Enter" && login()} />
        {error && <div style={s.err}>{error}</div>}
        <button style={s.btn} onClick={login} disabled={loading}>{loading ? "Authenticating..." : "Enter Command Center"}</button>
      </div>
    </div>
  );
}
