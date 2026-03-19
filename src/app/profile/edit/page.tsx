"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Camera, Save, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfileEditPage() {
  const { data: session, update } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const nameParts = (session.user.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(session.user.email || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, image }),
      });

      if (res.ok) {
        // Update the session
        await update({ name: fullName, image });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="container" style={{ paddingBottom: "100px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Link href="/profile" style={{ color: "var(--text-secondary)", display: "flex" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>Edit Profile</h1>
      </header>

      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          {image ? (
            <Image
              src={image}
              alt="Profile"
              width={96}
              height={96}
              style={{ borderRadius: "50%", border: "3px solid var(--accent-blue)", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              {firstName ? firstName[0].toUpperCase() : "U"}
            </div>
          )}
          <label
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "2px solid var(--bg-color)",
            }}
          >
            <Camera size={14} color="white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="glass-card" style={{ padding: "16px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "12px",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div className="glass-card" style={{ padding: "16px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "12px",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div className="glass-card" style={{ padding: "16px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "12px",
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              outline: "none",
              fontFamily: "inherit",
              cursor: "not-allowed",
            }}
          />
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "4px", opacity: 0.6 }}>
            Email cannot be changed
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glass-button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "8px",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saved ? (
            "✓ Saved!"
          ) : saving ? (
            "Saving..."
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>
    </main>
  );
}
