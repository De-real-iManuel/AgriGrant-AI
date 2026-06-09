import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';

const notifications = [
  { id: 'n1', title: 'CBN Anchor Borrowers — deadline in 7 days', time: 'Today, 2:41 AM', type: 'warning' },
  { id: 'n2', title: 'NIRSAL proposal generation complete', time: 'Today, 2:30 AM', type: 'success' },
  { id: 'n3', title: 'New grant match: GEEP TraderMoni Agri (78%)', time: 'Yesterday', type: 'info' },
  { id: 'n4', title: 'Document validated: Farm Registration Certificate', time: 'Yesterday', type: 'success' },
  { id: 'n5', title: 'FAO proposal awaiting your review', time: '2 days ago', type: 'review' },
];

const typeStyle: Record<string, { bg: string; color: string; dot: string }> = {
  warning: { bg: '#FEF3C7', color: '#92400E', dot: '#D97706' },
  success: { bg: '#DCFCE7', color: '#166534', dot: '#16A34A' },
  info: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  review: { bg: '#EDE9FE', color: '#5B21B6', dot: '#7C3AED' },
};

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <DashboardShell title="Notifications" subtitle="5 unread alerts">
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const s = typeStyle[n.type];
            return (
              <div
                key={n.id}
                className="rounded-2xl border p-4 flex items-start gap-3"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: s.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: s.bg, color: s.color }}
                >
                  {n.type}
                </span>
              </div>
            );
          })}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
