"use client";

import React, { useState } from 'react';
import { Activity, ArrowRight } from 'lucide-react';

export default function ActivityInput({ onSubmit }: { onSubmit: (activity: string) => void }) {
  const [activity, setActivity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity.trim()) {
      onSubmit(activity);
      setActivity(""); // Reset input field after submission
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '32px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Wave at top */}
      <div style={{ position: 'absolute', top: -10, left: 0, right: 0, height: 20, background: 'var(--accent-gradient)', opacity: 0.2, filter: 'blur(10px)' }} />
      
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={18} color="var(--accent-blue)" />
        Current Activity
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input 
          type="text"
          placeholder="e.g. Studying Physics..."
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
        <button 
          type="submit"
          disabled={!activity.trim()}
          style={{
            background: activity.trim() ? 'var(--accent-gradient)' : 'var(--glass-border)',
            border: 'none',
            borderRadius: '12px',
            width: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: activity.trim() ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.2s'
          }}
        >
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
