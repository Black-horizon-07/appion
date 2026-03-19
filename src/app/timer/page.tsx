"use client";

import React from "react";
import PomodoroTimer from "@/components/PomodoroTimer";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default function TimerPage() {
  return (
    <main className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Focus Timer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Use the Pomodoro technique to stay productive.</p>
      </header>

      <PomodoroTimer />
      

    </main>
  );
}
