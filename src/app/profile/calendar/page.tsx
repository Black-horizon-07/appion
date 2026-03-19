"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Calendar, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CalendarIntegrationPage() {
  const [loading, setLoading] = useState(true);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [unlinking, setUnlinking] = useState(false);

  const checkAccounts = async () => {
    try {
      const res = await fetch("/api/user/accounts");
      if (res.ok) {
        const data = await res.json();
        setGoogleLinked(data.googleLinked);
        if (data.user) {
          setUserEmail(data.user.email || "");
          setUserName(data.user.name || "");
        }
      }
    } catch (err) {
      console.error("Failed to check accounts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/calendar/auth-url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get auth URL', data.error);
      }
    } catch (err) {
      console.error('Connect error', err);
    }
  };

  const exchangeCode = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        setGoogleLinked(true);
        window.history.replaceState({}, document.title, "/profile/calendar"); // Clean URL
      }
    } catch (err) {
      console.error("Link error", err);
    } finally {
      checkAccounts();
    }
  };

  useEffect(() => {
    // Check if we just returned from Google
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      exchangeCode(code);
    } else {
      checkAccounts();
    }
  }, []);

  const handleDisconnect = async () => {
    setUnlinking(true);
    try {
      await fetch("/api/user/accounts", { method: "DELETE" });
      setGoogleLinked(false);
    } catch (err) {
      console.error("Failed to disconnect", err);
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <main className="container" style={{ paddingBottom: "100px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Link href="/profile" style={{ color: "var(--text-secondary)", display: "flex" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>Google Calendar</h1>
      </header>

      {loading ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <RefreshCw size={24} color="var(--text-secondary)" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "12px" }}>Checking connection...</p>
        </div>
      ) : googleLinked ? (
        <>
          {/* Connected State */}
          <div className="glass-card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <CheckCircle2 size={24} color="#34c759" />
              <div>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#34c759" }}>Connected</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Google Calendar is synced</p>
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "12px",
              padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "16px",
            }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "2px" }}>Linked Account</p>
              <p style={{ fontSize: "0.95rem", fontWeight: 500 }}>{userEmail}</p>
              {userName && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{userName}</p>}
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              <p>✓ Calendar events sync to your schedule</p>
              <p>✓ AI productivity scoring uses your planned activities</p>
              <p>✓ Dashboard shows your current scheduled task</p>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={unlinking}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255, 59, 48, 0.1)",
                border: "1px solid rgba(255, 59, 48, 0.2)",
                color: "#ff3b30",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                opacity: unlinking ? 0.6 : 1,
              }}
            >
              {unlinking ? "Disconnecting..." : "Disconnect Google Account"}
            </button>
          </div>

          {/* Re-sync option */}
          <button
            onClick={handleConnect}
            className="glass-button"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.06)" }}
          >
            <RefreshCw size={14} /> Re-authenticate & Refresh Tokens
          </button>
        </>
      ) : (
        <>
          {/* Not Connected State */}
          <div className="glass-card" style={{ textAlign: "center", padding: "32px 24px", marginBottom: "20px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Calendar size={28} color="var(--text-secondary)" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              <XCircle size={16} color="#ff3b30" />
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "#ff3b30" }}>Not Connected</p>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "24px" }}>
              Connect your Google account to sync calendar events and get accurate AI productivity scores based on your schedule.
            </p>

            <button
              onClick={handleConnect}
              className="glass-button"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect Google Calendar
            </button>
          </div>

          {/* Benefits */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "12px" }}>What you get</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <p>📅 See your Google Calendar events in the Schedule tab</p>
              <p>🤖 AI scores your productivity based on planned vs actual tasks</p>
              <p>⏰ Dashboard shows your current scheduled activity</p>
              <p>🔒 We only read your calendar. No modifications are made.</p>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
