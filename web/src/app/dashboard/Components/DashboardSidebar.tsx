'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  FileSignature,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navGroups = [
  {
    id: 'grp-main',
    label: 'Main',
    items: [
      {
        id: 'nav-dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/dashboard',
        badge: null,
      },
      {
        id: 'nav-applications',
        icon: FolderOpen,
        label: 'My Applications',
        href: '/dashboard/applications',
        badge: null,
      },
      {
        id: 'nav-vault',
        icon: ShieldCheck,
        label: 'Trust Vault',
        href: '/dashboard/vault',
        badge: 'NEW',
      },
    ],
  },
  {
    id: 'grp-tools',
    label: 'AI Tools',
    items: [
      {
        id: 'nav-grants',
        icon: Search,
        label: 'Grant Marketplace',
        href: '/dashboard/grants',
        badge: null,
      },
      {
        id: 'nav-proposals',
        icon: FileSignature,
        label: 'Proposal Drafts',
        href: '/dashboard/proposals',
        badge: null,
      },
      {
        id: 'nav-chat',
        icon: MessageSquare,
        label: 'AI Chat Advisor',
        href: '/dashboard/chat',
        badge: null,
      },
      {
        id: 'nav-hitl',
        icon: Sparkles,
        label: 'HITL Sandbox',
        href: '/dashboard/hitl',
        badge: 'BPMN',
      },
    ],
  },
  {
    id: 'grp-account',
    label: 'Account',
    items: [
      {
        id: 'nav-settings',
        icon: Settings,
        label: 'Settings',
        href: '/dashboard/settings',
        badge: null,
      },
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
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/sign-up-login-screen');
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: collapsed ? '72px' : '240px',
          backgroundColor: 'var(--card)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 h-16 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <AppLogo size={32} />
          {!collapsed && (
            <span
              className="font-bold text-base tracking-tight whitespace-nowrap"
              style={{ color: 'var(--primary)' }}
            >
              AgriGrant <span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          )}
        </div>

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

      {/* Spacer */}
      <div
        className="flex-shrink-0 transition-all duration-300 hidden lg:block"
        style={{ width: collapsed ? '72px' : '240px' }}
      />
    </>
  );
}
