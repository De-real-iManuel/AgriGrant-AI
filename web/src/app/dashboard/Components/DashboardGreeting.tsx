'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTime(): string {
  return new Date().toLocaleString('en-NG', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function DashboardGreeting() {
  const { user } = useAuth();
  const greeting = useMemo(() => getGreeting(), []);
  const time = useMemo(() => formatTime(), []);
  const firstName = user?.name?.split(' ')[0] ?? 'Farmer';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            {greeting}, {firstName} 👋
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {time}

        </p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
        >
          <Sparkles size={13} />
          AI Active
        </div>
        <Link href="/dashboard/chat" className="btn-primary gap-2 text-sm px-5 py-2.5">
          <Plus size={15} />
          Find Grants
        </Link>
      </div>
    </div>
  );
}
