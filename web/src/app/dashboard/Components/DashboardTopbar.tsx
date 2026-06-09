'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Menu, PanelLeftClose, PanelLeft, Bell, Search, Plus, ChevronDown } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  sidebarCollapsed: boolean;
}

export default function DashboardTopbar({ onToggleSidebar, onMobileMenuOpen, sidebarCollapsed }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="p-2 rounded-lg lg:hidden transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hidden lg:flex transition-colors hover:bg-muted"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Search */}
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
        {/* New Application CTA */}
        <Link
          href="/dashboard"
          className="btn-primary hidden sm:flex text-xs px-4 py-2 gap-1.5"
        >
          <Plus size={14} />
          New Application
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl transition-colors hover:bg-muted"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--card)' }}
          />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 p-1.5 rounded-xl transition-colors hover:bg-muted">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}
          >
            E
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Emmanuel</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Smallholder</p>
          </div>
          <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} className="hidden xl:block" />
        </button>
      </div>
    </header>
  );
}