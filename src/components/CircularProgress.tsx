"use client";

import React, { useEffect, useState } from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgress({ score, size = 180, strokeWidth = 16 }: CircularProgressProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // Animate the score filling up
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Handle stroke offset
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-blue)" />
            <stop offset="100%" stopColor="var(--card-active-border)" />
          </linearGradient>
        </defs>
        
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress Indictator */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      
      {/* Percentage Text Centered */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {animatedScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>%</span>
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Productivity
        </span>
      </div>
    </div>
  );
}
