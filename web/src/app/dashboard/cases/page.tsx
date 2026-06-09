import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import ActiveCasesList from '../Components/ActiveCasesList';

export default function CasesPage() {
  return (
    <AuthGuard>
      <DashboardShell title="My Cases" subtitle="Track all your active grant applications">
        <ActiveCasesList />
      </DashboardShell>
    </AuthGuard>
  );
}
