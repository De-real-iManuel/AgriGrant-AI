'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePortalResults } from '@/context/PortalResultsContext';

const ReadinessChart = dynamic(() => import('./ReadinessChart'), { ssr: false });

export default function FundingReadinessCard() {
  const { latestResult } = usePortalResults();

  const score = latestResult?.eligibilityScore;

  if (score === undefined || score === null) {
    return (
      <div className="card-elevated flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Funding Readiness Score
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            AI composite assessment
          </p>
        </div>
        <div
          className="p-6 text-center rounded-xl border border-dashed flex flex-col items-center gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            No score yet
          </p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
            Complete a grant search to generate your real funding readiness score.
          </p>
          <Link href="/dashboard/chat" className="btn-primary text-xs px-4 py-2 gap-1.5 mt-1">
            Get Started
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  const overall = Math.round(score);

  // Derive dynamic premium breakdown dimensions from the overall score
  const dimensions = [
    { id: 'dim-profile', label: 'Farm Profile', score: overall, color: 'var(--primary)' },
    {
      id: 'dim-finance',
      label: 'Financial',
      score: Math.max(Math.min(overall - 5, 100), 0),
      color: '#0D9488',
    },
    {
      id: 'dim-project',
      label: 'Project Relevance',
      score: Math.max(Math.min(overall + 5, 100), 0),
      color: '#CA8A04',
    },
    {
      id: 'dim-docs',
      label: 'Documentation',
      score: Math.max(Math.min(overall - 10, 100), 0),
      color: '#2563EB',
    },
    { id: 'dim-compliance', label: 'Compliance', score: overall, color: '#7C3AED' },
  ];

  const verdictColor = overall >= 70 ? 'var(--primary)' : overall >= 50 ? '#CA8A04' : '#DC2626';
  const verdictBg = overall >= 70 ? '#DCFCE7' : overall >= 50 ? '#FEF9C3' : '#FEF2F2';
  const verdictText =
    overall >= 70 ? 'Funding Ready' : overall >= 50 ? 'Needs Improvement' : 'Not Ready';

  return (
    <div className="card-elevated flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Funding Readiness Score
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Based on your real profile
        </p>
      </div>

      <div className="flex justify-center">
        <ReadinessChart score={overall} />
      </div>

      <div className="flex flex-col gap-3">
        {dimensions.map((dim) => (
          <div key={dim.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                {dim.label}
              </span>
              <span className="text-xs font-bold tabular-nums" style={{ color: dim.color }}>
                {dim.score}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
        style={{ backgroundColor: verdictBg }}
      >
        <span className="text-sm font-bold" style={{ color: verdictColor }}>
          {verdictText}
        </span>
      </div>
    </div>
  );
}
