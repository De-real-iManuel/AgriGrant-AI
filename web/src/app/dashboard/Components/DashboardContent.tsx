import React from 'react';
import DashboardGreeting from './DashboardGreeting';
import KPIBentoGrid from './KPIBentoGrid';
import AgentActivityFeed from './AgentActivityFeed';
import ActiveCasesList from './ActiveCasesList';
import RecommendedGrants from './RecommendedGrants';
import FundingReadinessCard from './FundingReadinessCard';

export default function DashboardContent() {
  return (
    <div className="max-w-screen-2xl mx-auto flex flex-col gap-7">
      <DashboardGreeting />

      <KPIBentoGrid />

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — cases + grants */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <ActiveCasesList />
          <RecommendedGrants />
        </div>

        {/* Right — agents + readiness */}
        <div className="flex flex-col gap-6">
          <AgentActivityFeed />
          <FundingReadinessCard />
        </div>
      </div>
    </div>
  );
}