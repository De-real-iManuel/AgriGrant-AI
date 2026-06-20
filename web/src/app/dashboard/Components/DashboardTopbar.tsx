'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Menu, PanelLeftClose, PanelLeft, Search, Plus, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  sidebarCollapsed: boolean;
}

export default function DashboardTopbar({
  onToggleSidebar,
  onMobileMenuOpen,
  sidebarCollapsed,
}: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/sign-up-login-screen');
  };

  return (
    <>
      <header
        className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            className="p-2 rounded-lg lg:hidden transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hidden lg:flex transition-colors hover:bg-muted"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="relative hidden md:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <input
              type="text"
              placeholder="Search grants, cases..."
              className="pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-all duration-150 w-56 xl:w-72"
              style={{
                borderColor: searchFocused ? 'var(--primary)' : 'var(--border)',
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)',
                boxShadow: searchFocused ? '0 0 0 3px rgba(22, 101, 52, 0.12)' : 'none',
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/chat"
            className="btn-primary hidden sm:flex text-xs px-4 py-2 gap-1.5"
          >
            <Plus size={14} />
            Find Grants
          </Link>

          <ThemeToggle />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-xl transition-colors hover:bg-muted"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}
              >
                {user?.avatarInitial ?? 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                  {user?.name?.split(' ')[0] ?? 'Farmer'}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {user?.farmType ?? 'Farmer'}
                </p>
              </div>
              <ChevronDown
                size={13}
                style={{ color: 'var(--muted-foreground)' }}
                className="hidden xl:block"
              />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-lg z-20 overflow-hidden"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {user?.name ?? 'Farmer'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {user?.email ?? ''}
                    </p>
                  </div>
                  <div className="p-2 flex flex-col gap-0.5">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-muted"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-muted w-full text-left"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
