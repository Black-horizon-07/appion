import React from 'react';
import Image from 'next/image';
import { Settings } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  name?: string | null;
  image?: string | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning 🌅";
  if (hour < 17) return "Good Afternoon ☀️";
  if (hour < 21) return "Good Evening 🌇";
  return "Good Night 🌙";
}

export default function Header({ name, image }: HeaderProps) {
  const firstName = name ? name.split(" ")[0] : "User";

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/profile/edit" style={{ flexShrink: 0 }}>
          {image ? (
            <Image 
              src={image} 
              alt="Profile" 
              width={48} 
              height={48} 
              style={{ borderRadius: '50%', border: '2px solid var(--accent-blue)' }} 
            />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.1rem', color: 'white' }}>
              {firstName[0]}
            </div>
          )}
        </Link>
        
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2px' }}>
            {getGreeting()}
          </p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
            {name || "User"}
          </h2>
        </div>
      </div>
      
      <Link href="/profile" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
        <Settings size={20} />
      </Link>
    </header>
  );
}

