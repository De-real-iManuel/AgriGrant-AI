'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

// ─── Public user shape exposed to the app ──────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  farmType?: string;
  avatarInitial: string;
  joinedAt: string;
  plan: 'free' | 'pro';
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Call after OTP verification to manually set user from supabase session */
  refreshUser: () => Promise<void>;
  /** Sign in with email + password via Supabase */
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign out */
  logout: () => Promise<void>;
  /** Patch local display profile */
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildAuthUser(sbUser: User): AuthUser {
  const meta = sbUser.user_metadata ?? {};
  const displayName: string =
    meta.full_name || meta.name || sbUser.email?.split('@')[0] || 'Farmer';
  return {
    id: sbUser.id,
    name: displayName,
    email: sbUser.email ?? '',
    phone: meta.phone ?? sbUser.phone ?? undefined,
    state: meta.state ?? undefined,
    farmType: meta.farm_type ?? undefined,
    avatarInitial: displayName.charAt(0).toUpperCase(),
    joinedAt: sbUser.created_at,
    plan: (meta.plan as 'free' | 'pro') ?? 'free',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setSession(data.session);
      setSupabaseUser(data.session.user);
      setUser(buildAuthUser(data.session.user));
    } else {
      setSession(null);
      setSupabaseUser(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Hydrate on mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession(data.session);
        setSupabaseUser(data.session.user);
        setUser(buildAuthUser(data.session.user));
      }
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setSupabaseUser(newSession.user);
        setUser(buildAuthUser(newSession.user));
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<AuthUser>) => {
      if (!user) return;
      setUser({ ...user, ...patch });
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!supabaseUser,
        isLoading,
        refreshUser,
        login,
        logout,
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

export function useUser(): AuthUser | null {
  return useAuth().user;
}
