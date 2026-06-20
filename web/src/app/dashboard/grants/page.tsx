import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import GrantMarketplaceContent from './GrantMarketplaceContent';

export default function GrantsPage() {
  return (
    <AuthGuard>
      <DashboardShell
        title="Grant Marketplace"
        subtitle="Free, verified grants from International, NGO, and Nigerian Government programmes — curated for Nigerian farmers."
      >
        <GrantMarketplaceContent />
      </DashboardShell>
    </AuthGuard>
  );
}
