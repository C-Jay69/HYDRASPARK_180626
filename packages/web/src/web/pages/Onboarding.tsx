import { useState } from "react";
import { useLocation } from "wouter";

const VIBES = ["Adventurous", "Chill", "Creative", "Intellectual", "Romantic", "Playful", "Spiritual", "Ambitious"];
const INTERESTS = ["Hiking", "Coffee", "Books", "Music", "Travel", "Cooking", "Art", "Gaming", "Yoga", "Films", "Photography", "Dancing"];
const LANGUAGES = [{ code: "en", label: "English" }, { code: "es", label: "Español" }, { code: "zh", label: "中文" }, { code: "fr", label: "Français" }, { code: "hi", label: "हिन्दी" }];

export default function Onboarding() {
  const [, nav] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    vibes: [] as string[],
    interests: [] as string[],
    language: "en",
    photo: null as File | null,
  });

  const toggle = (key: "vibes" | "interests", val: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));
  };

  const next = () => step < 5 ? setStep(s => s + 1) : submit();

  const submit = async () => {
    const userId = localStorage.getItem("userId");
    await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": userId! },
      body: JSON.stringify({ username: form.username, bio: form.bio, vibeAnswers: form.vibes, interests: form.interests, language: form.language }),
    });
    nav("/discover");
  };

  const styles: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    card: { background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2.5rem", width: "100%", maxWidth: 480 },
    progress: { display: "flex", gap: 8, marginBottom: "2rem" },
    dot: (active: boolean, done: boolean) => ({ height: 6, flex: 1, borderRadius: 3, background: done ? "#a855f7" : active ? "linear-gradient(90deg,#a855f7,#06b6d4)" : "#1a1a2e", transition: "all .3s" }),
    h2: { fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" },
    p: { color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1.5rem" },
    input: { width: "100%", background: "#111", border: "1px solid #2a2a3e", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#fff", fontSize: "0.95rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box" },
    chips: { display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: "1.5rem" },
    chip: (active: boolean) => ({ padding: "0.4rem 0.9rem", borderRadius: "2rem", border: `1px solid ${active ? "#a855f7" : "#2a2a3e"}`, background: active ? "rgba(168,85,247,0.15)" : "transparent", color: active ? "#a855f7" : "#9ca3af", cursor: "pointer", fontSize: "0.85rem", transition: "all .2s" }),
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#a855f7,#06b6d4)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
    label: { display: "block", color: "#9ca3af", fontSize: "0.85rem", marginBottom: "0.5rem" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.progress}>
          {[1,2,3,4,5].map(i => <div key={i} style={styles.dot(i===step, i<step)} />)}
        </div>

        {step === 1 && (
          <>
            <h2 style={styles.h2}>Pick your username</h2>
            <p style={styles.p}>This is how the world will know you.</p>
            <input style={styles.input} placeholder="@yourusername" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} />
            <label style={styles.label}>Your bio</label>
            <textarea style={{...styles.input, minHeight: 80, resize: "vertical"}} placeholder="Tell us something real..." value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.h2}>What's your vibe?</h2>
            <p style={styles.p}>Pick up to 3 that define you.</p>
            <div style={styles.chips}>
              {VIBES.map(v => <span key={v} style={styles.chip(form.vibes.includes(v))} onClick={() => toggle("vibes", v)}>{v}</span>)}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.h2}>Your interests</h2>
            <p style={styles.p}>What gets you out of bed?</p>
            <div style={styles.chips}>
              {INTERESTS.map(i => <span key={i} style={styles.chip(form.interests.includes(i))} onClick={() => toggle("interests", i)}>{i}</span>)}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={styles.h2}>Profile photo</h2>
            <p style={styles.p}>Let people see the real you.</p>
            <div style={{ border: "2px dashed #2a2a3e", borderRadius: "1rem", padding: "2rem", textAlign: "center", cursor: "pointer", color: "#9ca3af", marginBottom: "1.5rem" }}
              onClick={() => document.getElementById("photo-input")?.click()}>
              {form.photo ? <span style={{ color: "#a855f7" }}>{form.photo.name}</span> : "Click to upload photo"}
            </div>
            <input id="photo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={e => setForm(f => ({...f, photo: e.target.files?.[0] || null}))} />
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={styles.h2}>Language preference</h2>
            <p style={styles.p}>HydraSpark speaks your language.</p>
            <div style={styles.chips}>
              {LANGUAGES.map(l => <span key={l.code} style={styles.chip(form.language === l.code)} onClick={() => setForm(f => ({...f, language: l.code}))}>{l.label}</span>)}
            </div>
            <p style={{ ...styles.p, marginTop: "1rem" }}>Almost there. Ready to spark something real?</p>
          </>
        )}

        <button style={styles.btn} onClick={next}>
          {step === 5 ? "Enter HydraSpark →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
