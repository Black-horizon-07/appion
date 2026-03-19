"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Calendar, Palette, Moon, Sun, Sparkles, ChevronRight, UserPen, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    fetch("/api/ai/history")
      .then((r) => r.json())
      .then((d) => setChatCount(d.conversations?.length || 0))
      .catch(() => {});
  }, []);

  const hasGoogleProvider = session?.user?.image?.includes("googleusercontent") || false;

  return (
    <main className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your preferences and integrations.</p>
      </header>

      {/* Edit Profile Link */}
      <Link href="/profile/edit" style={{ textDecoration: 'none' }}>
        <section className="glass-card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserPen size={18} color="var(--accent-blue)" />
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Edit Profile</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Name, photo & more</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-secondary)" />
        </section>
      </Link>

      {/* AI Chat History Link */}
      <Link href="/ai/history" style={{ textDecoration: 'none' }}>
        <section className="glass-card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={18} color="var(--accent-purple)" />
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>AI Chat History</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{chatCount} conversation{chatCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-secondary)" />
        </section>
      </Link>

      {/* Google Calendar Integration Link */}
      <Link href="/profile/calendar" style={{ textDecoration: 'none' }}>
        <section className="glass-card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={18} color="var(--accent-blue)" />
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Google Calendar</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage integration</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-secondary)" />
        </section>
      </Link>

      {/* Theme */}
      <section className="glass-card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {theme === 'dark' ? <Moon size={18} color="var(--accent-purple)" /> : <Sun size={18} color="var(--accent-purple)" />}
          Theme
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: theme === 'dark' ? 'var(--card-active-bg)' : 'var(--glass-bg)', border: theme === 'dark' ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer' }}>Dark</button>
          <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: theme === 'light' ? 'var(--card-active-bg)' : 'var(--glass-bg)', border: theme === 'light' ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer' }}>Light</button>
        </div>
      </section>

      {/* Accent Color */}
      <section className="glass-card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} color="var(--accent-blue)" />
          Accent Color
        </h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['#BFA2FF', '#4a90e2', '#e24a87', '#4ae293'].map(color => (
            <button key={color} onClick={() => setAccent(color)} style={{ width: 40, height: 40, borderRadius: '50%', background: color, border: accent === color ? '3px solid var(--text-primary)' : 'none', cursor: 'pointer' }} />
          ))}
        </div>
      </section>

      {/* Sign Out */}
      <button
        className="glass-button"
        style={{ width: '100%', background: 'rgba(255, 60, 60, 0.15)', color: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        <LogOut size={16} /> Sign Out
      </button>
    </main>
  );
}
