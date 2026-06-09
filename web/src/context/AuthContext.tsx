'use client';
/**
 * AuthContext
 * -----------
 * Client-side auth simulation using localStorage.
 * No backend — persists across page refreshes for the demo.
 *
 * Plan tiers:
 *  - 'free'  → max 1 grant result, basic dashboard
 *  - 'pro'   → unlimited grants, full rich proposal data
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export type PlanTier = 'free' | 'pro';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  farmType?: string;
  plan: PlanTier;
  avatarInitial: string;
  joinedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string, plan?: PlanTier) => void;
  logout: () => void;
  upgradeToPro: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'agrigrant_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AuthUser = JSON.parse(raw);
        setUser(parsed);
      }
    } catch {
      // corrupted storage — ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(u);
  }, []);

  const login = useCallback(
    (email: string, name = '', plan: PlanTier = 'free') => {
      const displayName = name || email.split('@')[0] || 'Farmer';
      const newUser: AuthUser = {
        id: `usr_${Date.now()}`,
        name: displayName,
        email,
        plan,
        avatarInitial: displayName.charAt(0).toUpperCase(),
        joinedAt: new Date().toISOString(),
      };
      persist(newUser);
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const upgradeToPro = useCallback(() => {
    if (!user) return;
    const upgraded: AuthUser = { ...user, plan: 'pro' };
    persist(upgraded);
  }, [user, persist]);

  const updateProfile = useCallback(
    (patch: Partial<AuthUser>) => {
      if (!user) return;
      const updated: AuthUser = { ...user, ...patch };
      persist(updated);
    },
    [user, persist],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        upgradeToPro,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Convenience hooks
export function useUser(): AuthUser | null {
  return useAuth().user;
}

export function usePlan(): PlanTier {
  return useAuth().user?.plan ?? 'free';
}
