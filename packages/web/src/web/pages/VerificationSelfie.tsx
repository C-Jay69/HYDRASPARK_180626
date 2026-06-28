import { useState, useRef } from "react";
import { useLocation } from "wouter";

export default function VerificationSelfie() {
  const [, nav] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const userId = localStorage.getItem("userId") || "";

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("selfie", file);
    await fetch("/api/verification/selfie", { method: "POST", headers: { "x-user-id": userId }, body: fd });
    nav("/verification/id");
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "2rem 1.5rem" },
    header: { width: "100%", display: "flex", alignItems: "center", marginBottom: "2rem" },
    card: { width: "100%", maxWidth: 480, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2rem" },
    h2: { fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: 8 },
    p: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.6 },
    zone: { border: "2px dashed #2a2a3e", borderRadius: "1rem", padding: "3rem", textAlign: "center" as const, cursor: "pointer", marginBottom: "1.5rem" },
    preview: { width: "100%", borderRadius: "0.75rem", marginBottom: "1.5rem", maxHeight: 240, objectFit: "cover" as const },
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#06b6d4,#a855f7)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/verification")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Step 1: Selfie</span>
      </div>
      <div style={s.card}>
        <h2 style={s.h2}>Take your selfie</h2>
        <p style={s.p}>Face the camera clearly, good lighting, no filters. This is compared to your ID.</p>
        {preview ? <img src={preview} alt="selfie" style={s.preview} /> : (
          <div style={s.zone} onClick={() => document.getElementById("selfie-input")?.click()}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📸</div>
            <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Click to upload selfie</div>
          </div>
        )}
        <input id="selfie-input" type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={pick} />
        {!preview && <button style={{ ...s.btn, background: "#1a1a2e" }} onClick={() => document.getElementById("selfie-input")?.click()}>Choose Photo</button>}
        {preview && <button style={s.btn} onClick={submit} disabled={uploading}>{uploading ? "Uploading..." : "Next: Upload ID →"}</button>}
      </div>
    </div>
  );
}
