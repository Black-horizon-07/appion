"use client";

import Header from "@/components/Header";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <main className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Notifications</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your recent AI productivity insights.</p>
      </header>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ padding: '16px', background: 'var(--card-active-bg)', borderRadius: '50%', marginBottom: '16px', color: 'var(--accent-blue)' }}>
          <Bell size={32} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '8px' }}>You're all caught up!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Check back later for new insights, scheduling alerts, and productivity milestones.
        </p>
      </div>
      

    </main>
  );
}
