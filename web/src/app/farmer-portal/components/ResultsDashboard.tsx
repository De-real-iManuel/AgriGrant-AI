'use client';
import React from 'react';
import {
  Download, Share2, RefreshCw, AlertTriangle,
  Trophy, TrendingUp, Lock, Sparkles, ArrowRight,
  LayoutDashboard, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { PipelineOutput } from './portalTypes';
import GrantCard from './GrantCard';
import { useAuth } from '@/context/AuthContext';

interface Props {
  output: PipelineOutput;
  onStartNew: () => void;
  onGoToDashboard: () => void;
}



export default function ResultsDashboard({ output, onStartNew, onGoToDashboard }: Props) {
  const { user } = useAuth();
  const {
    matchedGrants = [],
    profileGaps = [],
    topRecommendation,
    summary,
    disclaimer,
    totalMatchesFound,
    farmerName,
    stateOfResidence,
    error,
    hiddenGrantsCount = 0,
    trustScore,
    trustScoreBreakdown,
  } = output;

  const sortedGrants = [...matchedGrants].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── Top Recommendation Banner ── */}
      <section
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #15803D 60%, #14532D 100%)',
          border: '2px solid var(--accent)',
          boxShadow: '0 4px 24px rgba(22,101,52,0.25)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#BBF7D0' }}>
              Results for{' '}
              <span style={{ color: '#fff' }}>{farmerName || 'Your Farm'}</span>
              {stateOfResidence ? ` — ${stateOfResidence}` : ''}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'var(--accent)', color: '#0F172A' }}
              >
                <Trophy size={12} />
                {totalMatchesFound} Grant{totalMatchesFound !== 1 ? 's' : ''} Found
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FEF9C3' }}
              >
                100% Free for Farmers
              </span>
            </div>
          </div>
          <TrendingUp size={28} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        </div>

        {error ? (
          <div className="mt-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-white">⚠️ {error}</p>
          </div>
        ) : totalMatchesFound === 0 ? (
          <p className="mt-2 text-sm" style={{ color: '#BBF7D0' }}>
            No grants matched your current profile — see improvement tips below.
          </p>
        ) : (
          topRecommendation && (
            <div className="mt-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--accent)' }}>
                🥇 Top Recommendation
              </p>
              <p className="text-sm font-medium text-white">{topRecommendation}</p>
            </div>
          )
        )}

        {summary && (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#D1FAE5' }}>
            {summary}
          </p>
        )}
      </section>



      {/* ── Trust Score Section ── */}
      {trustScore !== undefined && (
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                B2B Trust Score: {trustScore}/100
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Pre-verification score used by grantors to assess your credibility.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {trustScoreBreakdown?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.item}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: item.points > 0 ? '#DCFCE7' : '#FEE2E2', color: item.points > 0 ? '#166534' : '#991B1B' }}>
                    {item.status}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: item.points > 0 ? '#166534' : 'var(--muted-foreground)' }}>
                  +{item.points} pts
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Matched Grants Cards ── */}
      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Your Matched Grants
        </h2>
        {sortedGrants.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No matching grants found for your current profile. Review the improvement tips below to unlock more opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGrants.map((grant, i) => (
              <GrantCard key={`grant-${i}`} grant={grant} />
            ))}
          </div>
        )}
      </section>

      {/* ── Profile Gaps ── */}
      <section
        className="rounded-2xl p-5 sm:p-6"
        style={{ backgroundColor: '#FFF8E1', border: '1px solid #FDE68A' }}
      >
        <h2 className="text-base font-bold mb-3" style={{ color: '#92400E' }}>
          ⚠️ Profile Gaps &amp; Improvement Tips
        </h2>
        {profileGaps.length === 0 ? (
          <p className="text-sm font-medium" style={{ color: '#15803D' }}>
            ✅ Your profile is strong — no major gaps identified.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {profileGaps.map((gap, i) => (
              <li key={`gap-${i}`} className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                <span className="text-sm" style={{ color: '#92400E' }}>{gap}</span>
              </li>
            ))}
          </ul>
        )}

        {disclaimer && (
          <p
            className="mt-4 pt-3 text-xs leading-relaxed"
            style={{ color: '#78716C', borderTop: '1px solid #FDE68A' }}
          >
            {disclaimer}
          </p>
        )}
      </section>



      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Go to Dashboard */}
        <button
          onClick={onGoToDashboard}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#14532D'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary)'; }}
        >
          <LayoutDashboard size={16} />
          View in Dashboard
        </button>

        {/* Download — coming soon */}
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95 relative group"
          style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)', color: 'var(--primary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F0FDF4'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
        >
          <Download size={16} />
          📥 Download Report
          <span
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10"
            style={{ backgroundColor: '#0F172A' }}
          >
            Coming soon
          </span>
        </button>

        {/* Share — coming soon */}
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95 relative group"
          style={{ backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <Share2 size={16} />
          🔗 Share Results
          <span
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10"
            style={{ backgroundColor: '#0F172A' }}
          >
            Coming soon
          </span>
        </button>

        {/* Start New */}
        <button
          onClick={onStartNew}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ color: 'var(--muted-foreground)', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <RefreshCw size={16} />
          🔄 New Search
        </button>
      </div>
    </div>
  );
}
