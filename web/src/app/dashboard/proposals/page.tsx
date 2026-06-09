import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import PlanGate from '@/components/ui/PlanGate';

export default function ProposalsPage() {
  return (
    <AuthGuard>
      <DashboardShell title="Proposals" subtitle="AI-generated grant proposals awaiting your review">
        <PlanGate feature="AI-generated proposals and rich proposal editing">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              📝 1 proposal ready for review
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              FAO Emergency &amp; Resilience Fund — AI narrative generated and waiting for your approval.
            </p>
          </div>
        </PlanGate>
      </DashboardShell>
    </AuthGuard>
  );
}
