import React from 'react';
import DashboardGreeting from './DashboardGreeting';
import KPIBentoGrid from './KPIBentoGrid';
import AgentActivityFeed from './AgentActivityFeed';
import ActiveCasesList from './ActiveCasesList';
import RecommendedGrants from './RecommendedGrants';
import FundingReadinessCard from './FundingReadinessCard';
import { usePortalResults } from '@/context/PortalResultsContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardContent() {
  const { latestResult } = usePortalResults();

  return (
    <div className="max-w-screen-2xl mx-auto flex flex-col gap-7">
      <DashboardGreeting />
      
      {!latestResult && (
        <div
          className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
            borderColor: 'var(--accent)',
            boxShadow: '0 4px 20px rgba(21,128,61,0.15)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Sparkles size={20} className="text-emerald-950" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Unlock Real Funding Opportunities</h4>
              <p className="text-sm mt-0.5" style={{ color: '#DCFCE7' }}>
                You are currently viewing simulation data. Complete the Farmer Portal intake form to get real, AI-scored grant matches and generate proposals.
              </p>
            </div>
          </div>
          <Link
            href="/farmer-portal"
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap self-stretch md:self-auto text-center justify-center"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--primary-foreground)' }}
          >
            Get Matched
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

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