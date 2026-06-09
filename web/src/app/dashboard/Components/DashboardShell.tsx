'use client';
import React, { useState, ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <DashboardTopbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-6 xl:p-8 2xl:p-10">
          <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
