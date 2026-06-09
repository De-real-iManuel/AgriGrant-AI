import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function PortalHeader() {
  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo size={30} />
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--primary)' }}>
            AgriGrant <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </Link>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
        >
          🌾 Farmer Portal
        </span>
      </div>
    </header>
  );
}
