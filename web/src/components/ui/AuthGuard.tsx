'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLogo from './AppLogo';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Wraps a page/component and redirects unauthenticated users to /sign-up-login-screen.
 * Shows a minimal loading state while auth is being rehydrated from localStorage.
 */
export default function AuthGuard({ children, redirectTo = '/sign-up-login-screen' }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <AppLogo size={48} />
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full agent-pulse"
            style={{ backgroundColor: 'var(--primary)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Loading…
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
