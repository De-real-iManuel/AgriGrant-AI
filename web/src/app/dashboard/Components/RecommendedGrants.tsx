'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Target, Calendar, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { usePortalResults } from '@/context/PortalResultsContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MatchedGrant } from '@/app/farmer-portal/components/portalTypes';

export default function RecommendedGrants() {
  const { latestResult, submitGrantCase } = usePortalResults();
  const { user } = useAuth();
  const router = useRouter();
  const displayedGrants = latestResult?.matchedGrants?.slice(0, 5) ?? [];

  const handleApply = (grant: MatchedGrant) => {
    const res = submitGrantCase(grant);
    if (res.success) {
      toast.success(`Started application for ${grant.grantName}`, {
        description: 'AI agents are now preparing your proposal and documents.',
      });
      router.push('/dashboard/cases');
    } else {
      toast.warning(res.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <div className="card-elevated flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
              Recommended Grants
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {latestResult ? 'AI-matched to your farm profile' : 'No profile data yet'}
            </p>
          </div>
          {displayedGrants.length > 0 && (
            <Link
              href="/dashboard/grants"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: 'var(--primary)' }}
            >
              View All {latestResult?.totalMatchesFound ?? displayedGrants.length}
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {displayedGrants.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border border-dashed flex flex-col items-center gap-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                No grant matches yet
              </p>
              <p className="text-xs max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
                Chat with the AI Advisor — describe your farm and get matched to real Nigerian grant
                programs.
              </p>
              <Link href="/dashboard/chat" className="btn-primary text-xs px-4 py-2 gap-1.5 mt-1">
                Chat with AI Advisor
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <>
              {displayedGrants.map((grant, idx) => {
                const scoreColor =
                  grant.matchScore >= 90
                    ? 'var(--primary)'
                    : grant.matchScore >= 80
                      ? '#7C3AED'
                      : '#CA8A04';
                const bg =
                  grant.matchScore >= 90
                    ? '#F0FDF4'
                    : grant.matchScore >= 80
                      ? '#F5F3FF'
                      : '#FFFBEB';
                const border =
                  grant.matchScore >= 90
                    ? '#BBF7D0'
                    : grant.matchScore >= 80
                      ? '#DDD6FE'
                      : '#FDE68A';

                return (
                  <div
                    key={`rec-grant-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 hover:shadow-card"
                    style={{ borderColor: border, backgroundColor: bg }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--card)' }}
                    >
                      <p
                        className="text-sm font-extrabold tabular-nums leading-none"
                        style={{ color: scoreColor }}
                      >
                        {grant.matchScore}%
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        match
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {grant.grantName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {grant.grantingOrganization}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: 'var(--foreground)' }}
                        >
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

                    <div className="flex items-center gap-2 flex-shrink-0 justify-end mt-2 sm:mt-0">
                      {grant.applicationUrl && (
                        <a
                          href={grant.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl border transition-all active:scale-95"
                          style={{
                            borderColor: border,
                            color: scoreColor,
                            backgroundColor: 'var(--card)',
                          }}
                        >
                          <ExternalLink size={11} />
                          Details
                        </a>
                      )}
                      <button
                        onClick={() => handleApply(grant)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
                        style={{ backgroundColor: scoreColor, color: 'white' }}
                      >
                        Apply
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
