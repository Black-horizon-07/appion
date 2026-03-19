"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60 * 10); // in 100ms units (25 min)
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const presets = [5, 25, 45, 60];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 100);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60 * 10);
  };
  
  const setTimer = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60 * 10);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      setTimer(mins);
      setCustomMinutes("");
    }
  };

  const formatTime = (ticks: number) => {
    const totalSeconds = Math.floor(ticks / 10);
    const ms = ticks % 10;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}.${ms}`;
  };

  return (
    <div className="glass-card" style={{ marginTop: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={18} color="var(--accent-purple)" />
          Study Timer
        </h3>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '4px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={toggleTimer} style={{ width: 56, height: 56, borderRadius: '50%', background: isActive ? 'var(--glass-bg)' : 'var(--accent-blue)', color: isActive ? 'var(--text-primary)' : 'white', border: isActive ? '1px solid var(--accent-blue)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          {isActive ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
        </button>
        <button onClick={resetTimer} style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {presets.map(mins => (
          <button 
            key={mins} 
            onClick={() => setTimer(mins)}
            style={{ padding: '6px 16px', borderRadius: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {mins}m
          </button>
        ))}
        <form onSubmit={handleCustomSubmit} style={{ display: 'inline-flex' }}>
          <input 
            type="number" 
            placeholder="Custom" 
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            style={{ width: '80px', padding: '6px 12px', borderRadius: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
          />
        </form>
      </div>
    </div>
  );
}
