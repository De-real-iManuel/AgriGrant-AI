import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';
import AgentActivityFeed from '../Components/AgentActivityFeed';

export default function AgentsPage() {
  return (
    <AuthGuard>
      <DashboardShell title="AI Agents" subtitle="Live status of all orchestration agents">
        <AgentActivityFeed />
      </DashboardShell>
    </AuthGuard>
  );
}
