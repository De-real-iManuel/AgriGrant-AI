'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Target, Calendar, Zap, ExternalLink, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { usePortalResults } from '@/context/PortalResultsContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MatchedGrant } from '@/app/farmer-portal/components/portalTypes';

const DEFAULT_RECOMMENDED = [
  {
    grantName: 'FarmerMoni Scheme',
    grantingOrganization: 'Federal Government of Nigeria',
    matchScore: 96,
    fundingAmountRange: 'Up to ₦300K',
    applicationDeadline: '12 days left',
    matchReason: 'Perfect for smallholder profile',
    grantCategory: 'Interest-Free Loan',
    applicationUrl: '#',
  },
  {
    grantName: 'AGSMEIS Round 4',
    grantingOrganization: 'CBN / Participating Banks',
    matchScore: 89,
    fundingAmountRange: '₦3M – ₦2B',
    applicationDeadline: '45 days left',
    matchReason: 'Matches your revenue bracket',
    grantCategory: 'SME Financing',
    applicationUrl: '#',
  },
  {
    grantName: 'BOA Renewed Hope Fund',
    grantingOrganization: 'Bank of Agriculture',
    matchScore: 83,
    fundingAmountRange: '₦500K – ₦5M',
    applicationDeadline: '38 days left',
    matchReason: 'Cassava farmers prioritized',
    grantCategory: 'Smallholder Credit',
    applicationUrl: '#',
  },
];

export default function RecommendedGrants() {
  const { latestResult, submitGrantCase } = usePortalResults();
  const { user, upgradeToPro } = useAuth();
  const router = useRouter();
  
  const isPro = user?.plan === 'pro';

  // Use matching grants from intake if available, otherwise fallback to simulation data
  const rawGrants = latestResult?.matchedGrants && latestResult.matchedGrants.length > 0
    ? latestResult.matchedGrants
    : DEFAULT_RECOMMENDED;

  // Render max 5 items in the dashboard overview
  const displayedGrants = rawGrants.slice(0, 5);

  const handleApply = (grant: MatchedGrant) => {
    const res = submitGrantCase(grant, isPro);
    if (res.success) {
      toast.success(`Started application for ${grant.grantName}`, {
        description: 'AI agents are now generating your executive proposal and preparing documents.',
      });
      router.push('/dashboard/cases');
    } else if (res.error === 'freemium_limit_exceeded') {
      toast.error('Limit Exceeded: 1 Grant Submission Only', {
        description: 'Freemium users can only apply for 1 grant. Upgrade to Pro to submit multiple applications.',
        action: {
          label: 'Upgrade to Pro',
          onClick: () => {
            upgradeToPro();
            toast.success('Successfully upgraded to Pro Plan!');
          },
        },
        duration: 8000,
      });
    } else {
      toast.warning(res.error || 'Something went wrong.');
    }
  };

  return (
    <div className="card-elevated flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Recommended Grants
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {latestResult ? 'AI-matched to your real farm profile' : 'Sample matches based on public profile'}
          </p>
        </div>
        <Link
          href="/dashboard/grants"
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: 'var(--primary)' }}
        >
          View All {latestResult?.totalMatchesFound ?? rawGrants.length}
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Grant rows */}
      <div className="flex flex-col gap-3">
        {displayedGrants.map((grant, idx) => {
          const scoreColor = grant.matchScore >= 90 ? 'var(--primary)' : grant.matchScore >= 80 ? '#7C3AED' : '#CA8A04';
          const bg = grant.matchScore >= 90 ? '#F0FDF4' : grant.matchScore >= 80 ? '#F5F3FF' : '#FFFBEB';
          const border = grant.matchScore >= 90 ? '#BBF7D0' : grant.matchScore >= 80 ? '#DDD6FE' : '#FDE68A';

          return (
            <div
              key={`rec-grant-${idx}`}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 hover:shadow-card group"
              style={{ borderColor: border, backgroundColor: bg }}
            >
              {/* Match score */}
              <div
                className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <p className="text-sm font-extrabold tabular-nums leading-none" style={{ color: scoreColor }}>
                  {grant.matchScore}%
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>match</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>
                    {grant.grantName}
                  </p>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {grant.grantingOrganization}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    <Target size={10} style={{ color: scoreColor }} />
                    {grant.fundingAmountRange}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Calendar size={10} />
                    {grant.applicationDeadline}
                  </span>
                  <span
                    className="hidden sm:flex items-center gap-1 text-xs font-medium"
                    style={{ color: scoreColor }}
                  >
                    <Zap size={10} />
                    {grant.matchReason}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 justify-end mt-2 sm:mt-0">
                <a
                  href={grant.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl border transition-all duration-150 active:scale-95"
                  style={{ borderColor: border, color: scoreColor, backgroundColor: 'var(--card)' }}
                >
                  <ExternalLink size={11} />
                  Details
                </a>
                <button
                  onClick={() => handleApply(grant)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all duration-150 active:scale-95"
                  style={{ backgroundColor: scoreColor, color: 'white' }}
                >
                  Apply
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Upgrade Banner for Freemium users if there are hidden grants */}
        {!isPro && latestResult && latestResult.hiddenGrantsCount && latestResult.hiddenGrantsCount > 0 ? (
          <div
            className="mt-3 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: '#FFFBEB', borderColor: 'var(--accent)' }}
          >
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">
                  {latestResult.hiddenGrantsCount} More Grant Matches Locked
                </p>
                <p className="text-xs text-amber-700">
                  Upgrade to Pro to view these matched programs and submit multiple grant proposals.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                upgradeToPro();
                toast.success('Successfully upgraded to Pro Plan!');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-1 whitespace-nowrap self-end sm:self-auto"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Upgrade Now
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}