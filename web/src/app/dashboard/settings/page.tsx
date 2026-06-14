'use client';
import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/sign-up-login-screen');
  };

  return (
    <AuthGuard>
      <DashboardShell title="Settings" subtitle="Manage your account and subscription">
        <div className="flex flex-col gap-4 max-w-lg">
          {/* Profile card */}
          <div
            className="rounded-2xl border p-5 flex flex-col gap-3"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Profile</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}
              >
                {user?.avatarInitial}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Plan card */}
          <div
            className="rounded-2xl border p-5 flex flex-col gap-3"
            style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#166534' }}>
                  <ShieldCheck size={16} /> 100% Free
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#15803D' }}>
                  AgriGrant AI is completely free for farmers. We monetize via success fees directly from grantors.
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-95"
            style={{
              borderColor: 'var(--destructive)',
              color: 'var(--destructive)',
              backgroundColor: 'transparent',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
