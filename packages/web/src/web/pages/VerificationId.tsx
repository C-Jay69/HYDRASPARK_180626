import { useState } from "react";
import { useLocation } from "wouter";

export default function VerificationId() {
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
    fd.append("id", file);
    await fetch("/api/verification/id", { method: "POST", headers: { "x-user-id": userId }, body: fd });
    nav("/verification/status");
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1.5rem" },
    header: { width: "100%", display: "flex", alignItems: "center", marginBottom: "2rem" },
    card: { width: "100%", maxWidth: 480, background: "#0a0a0a", border: "1px solid #1a1a2e", borderRadius: "1.5rem", padding: "2rem" },
    zone: { border: "2px dashed #2a2a3e", borderRadius: "1rem", padding: "3rem", textAlign: "center" as const, cursor: "pointer", marginBottom: "1.5rem" },
    preview: { width: "100%", borderRadius: "0.75rem", marginBottom: "1.5rem", maxHeight: 240, objectFit: "cover" as const },
    btn: { width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#06b6d4,#a855f7)", border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => nav("/verification/selfie")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ color: "#fff", fontWeight: 700, marginLeft: "1rem" }}>Step 2: Government ID</span>
      </div>
      <div style={s.card}>
        <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", marginBottom: 8 }}>Upload your ID</h2>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>Passport, driver's licence, or national ID. Blurry = rejected. Your ID is encrypted and never shared.</p>
        {preview ? <img src={preview} alt="id" style={s.preview} /> : (
          <div style={s.zone} onClick={() => document.getElementById("id-input")?.click()}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🪪</div>
            <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Click to upload ID photo</div>
          </div>
        )}
        <input id="id-input" type="file" accept="image/*" style={{ display: "none" }} onChange={pick} />
        {!preview && <button style={{ ...s.btn, background: "#1a1a2e" }} onClick={() => document.getElementById("id-input")?.click()}>Choose File</button>}
        {preview && <button style={s.btn} onClick={submit} disabled={uploading}>{uploading ? "Submitting..." : "Submit for Review →"}</button>}
      </div>
    </div>
  );
}
