'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, FolderOpen, Search, FileText,
  Bot, Settings, LogOut, Bell, HelpCircle, Users,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navGroups = [
  {
    id: 'grp-main',
    label: 'Main',
    items: [
      { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null },
      { id: 'nav-portal', icon: Search, label: 'Find Grants', href: '/farmer-portal', badge: null },
      { id: 'nav-cases', icon: FolderOpen, label: 'My Cases', href: '/dashboard/cases', badge: '3' },
    ],
  },
  {
    id: 'grp-tools',
    label: 'AI Tools',
    items: [
      { id: 'nav-grants', icon: Search, label: 'Grant Marketplace', href: '/dashboard/grants', badge: '15' },
      { id: 'nav-proposals', icon: FileText, label: 'Proposals', href: '/dashboard/proposals', badge: '1' },
      { id: 'nav-agents', icon: Bot, label: 'AI Agents', href: '/dashboard/agents', badge: null },
      { id: 'nav-coop', icon: Users, label: 'Cooperatives', href: '/dashboard/cooperatives', badge: null },
    ],
  },
  {
    id: 'grp-account',
    label: 'Account',
    items: [
      { id: 'nav-notifications', icon: Bell, label: 'Notifications', href: '/dashboard/notifications', badge: '5' },
      { id: 'nav-settings', icon: Settings, label: 'Settings', href: '/dashboard/settings', badge: null },
      { id: 'nav-help', icon: HelpCircle, label: 'Help & Support', href: '/dashboard/help', badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function DashboardSidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, upgradeToPro } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/sign-up-login-screen');
  };

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? '72px' : '240px',
          backgroundColor: 'var(--card)',
          borderRight: '1px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 h-16 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-bold text-base tracking-tight whitespace-nowrap" style={{ color: 'var(--primary)' }}>
              AgriGrant <span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          )}
        </div>

        {/* Plan badge */}
        {!collapsed && user && (
          <div
            className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center justify-between"
            style={{
              backgroundColor: user.plan === 'pro' ? '#DCFCE7' : '#FEF9C3',
              border: `1px solid ${user.plan === 'pro' ? '#BBF7D0' : '#FDE68A'}`,
            }}
          >
            <span
              className="text-xs font-bold"
              style={{ color: user.plan === 'pro' ? 'var(--primary)' : '#92400E' }}
            >
              {user.plan === 'pro' ? '✦ Pro Plan' : 'Free Plan'}
            </span>
            {user.plan === 'free' && (
              <button
                onClick={upgradeToPro}
                className="text-xs font-bold flex items-center gap-1"
                style={{ color: '#92400E' }}
              >
                <Sparkles size={11} />
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              {!collapsed && (
                <p
                  className="text-xs font-semibold uppercase tracking-widest px-3 mb-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onMobileClose}
                    className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: isActive ? 'var(--primary)' : '#DCFCE7',
                              color: isActive ? 'white' : 'var(--primary)',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User profile + logout */}
        <div
          className="p-3 border-t flex items-center gap-3 flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}
          >
            {user?.avatarInitial ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {user?.name ?? 'Farmer'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                {user?.email ?? ''}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="p-1.5 rounded-lg transition-colors hover:bg-muted"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      {/* Spacer to push content */}
      <div
        className="flex-shrink-0 transition-all duration-300 hidden lg:block"
        style={{ width: collapsed ? '72px' : '240px' }}
      />
    </>
  );
}
