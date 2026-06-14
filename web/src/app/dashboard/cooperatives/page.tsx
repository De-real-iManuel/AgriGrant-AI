import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';


export default function CooperativesPage() {
  return (
    <AuthGuard>
      <DashboardShell title="Cooperatives" subtitle="Connect with registered cooperative societies">
        <div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Cooperative management tools coming soon.
          </p>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
