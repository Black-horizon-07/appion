import React from 'react';
import Link from 'next/link';
import { Home, Timer as TimerIcon, PlusCircle, Bell, User, Calendar } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: '80px',
      background: 'rgba(13, 27, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 100
    }}>
      <Link href="/dashboard" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
        <Home size={24} />
      </Link>
      <Link href="/calendar" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
        <Calendar size={24} />
      </Link>
      
      {/* Center Input button inside normal flow for equal spacing */}
      <Link href="/dashboard#input" style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent-gradient)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', margin: '0 10px' }}>
        <PlusCircle size={24} />
      </Link>
      
      <Link href="/timer" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
        <TimerIcon size={24} />
      </Link>
      <Link href="/profile" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
        <User size={24} />
      </Link>
    </nav>
  );
}
