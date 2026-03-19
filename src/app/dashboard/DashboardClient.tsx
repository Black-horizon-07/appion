"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import CircularProgress from "@/components/CircularProgress";
import ActivityInput from "@/components/ActivityInput";
import PomodoroTimer from "@/components/PomodoroTimer";


interface DashboardClientProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [score, setScore] = useState<number>(0); 
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [scheduledActivity, setScheduledActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load streak from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem("appion_last_active");
    let currentStreak = parseInt(localStorage.getItem("appion_streak") || "0", 10);
    
    if (lastActive && lastActive !== today) {
      const lastDate = new Date(lastActive);
      const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 1) {
        // Reset streak if more than 1 day passes without an entry
        currentStreak = 0;
        localStorage.setItem("appion_streak", "0");
      }
    }
    setStreak(currentStreak);
  }, []);

  useEffect(() => {
    // Fetch current calendar event on mount
    async function fetchCalendar() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`/api/calendar?timezone=${timezone}`);
        const data = await res.json();
        
        if (data.currentEvent) {
          setScheduledActivity(data.currentEvent.summary);
        } else {
          setScheduledActivity("Free Time");
        }
      } catch (err) {
        console.error("Failed to fetch calendar", err);
      }
    }
    
    fetchCalendar();
    
    // Check every 5 minutes if schedule changed
    const interval = setInterval(fetchCalendar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleActivitySubmit = async (activity: string) => {
    const planned = scheduledActivity && scheduledActivity !== "Loading..." ? scheduledActivity : "Free Time";
    setLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plannedActivity: planned,
          actualActivity: activity
        })
      });
      const data = await res.json();
      if (data.score !== undefined) {
        setScore(data.score);
      }
      if (data.suggestion) {
        setSuggestion(data.suggestion);
      }

      // Update streak
      setStreak(prev => {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem("appion_last_active");
        if (lastActive !== today) {
          const newStreak = prev + 1;
          localStorage.setItem("appion_streak", newStreak.toString());
          localStorage.setItem("appion_last_active", today);
          return newStreak;
        }
        return prev;
      });
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ paddingBottom: '100px' }}>
      <Header name={user.name} image={user.image} />
      
      {/* Daily Streak Section */}
      {streak > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div className="glass-card" style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>🔥 {streak} Day Streak</span>
          </div>
        </div>
      )}

      {/* Score Section */}
      <div style={{ marginTop: '20px', marginBottom: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
          Right now you planned to: <strong style={{ color: 'var(--text-primary)' }}>{scheduledActivity || "Loading..."}</strong>
        </p>
        <CircularProgress score={score} />
        {loading && <p style={{ color: 'var(--accent-blue)', marginTop: '12px', fontSize: '0.9rem' }}>Evaluating with AI...</p>}
      </div>

      {/* AI Suggestion Section */}
      {suggestion && (
        <div className="glass-card" style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--accent-gradient)' }}></div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
             ✨ AI Suggestion
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {suggestion}
          </p>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div id="input">
          <ActivityInput onSubmit={handleActivitySubmit} />
        </div>
        <div id="timer" style={{ marginTop: '24px' }}>
          <PomodoroTimer />
        </div>
      </div>


    </main>
  );
}
