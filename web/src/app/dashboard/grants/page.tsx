import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import RecommendedGrants from '../Components/RecommendedGrants';

export default function GrantsPage() {
  return (
    <AuthGuard>
      <DashboardShell title="Grant Marketplace" subtitle="All grants matched to your profile">
        <RecommendedGrants />
      </DashboardShell>
    </AuthGuard>
  );
}
