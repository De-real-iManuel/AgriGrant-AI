import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import PlanGate from '@/components/ui/PlanGate';

export default function CooperativesPage() {
  return (
    <AuthGuard>
      <DashboardShell title="Cooperatives" subtitle="Connect with registered cooperative societies">
        <PlanGate feature="cooperative discovery and group grant applications">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Cooperative management tools coming soon.
          </p>
        </PlanGate>
      </DashboardShell>
    </AuthGuard>
  );
}
