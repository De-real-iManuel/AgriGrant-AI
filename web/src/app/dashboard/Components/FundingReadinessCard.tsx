'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const ReadinessChart = dynamic(() => import('./ReadinessChart'), { ssr: false });

const dimensions = [
  { id: 'dim-elig', label: 'Eligibility', score: 95, color: 'var(--primary)', bg: '#DCFCE7' },
  { id: 'dim-docs', label: 'Documentation', score: 88, color: '#0D9488', bg: '#F0FDFA' },
  { id: 'dim-prop', label: 'Proposal Quality', score: 90, color: '#CA8A04', bg: '#FFFBEB' },
  { id: 'dim-comp', label: 'Compliance', score: 92, color: '#2563EB', bg: '#EFF6FF' },
];

export default function FundingReadinessCard() {
  return (
    <div className="card-elevated flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Funding Readiness Score
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          AI composite assessment
        </p>
      </div>
      {/* Radial chart */}
      <div className="flex justify-center">
        <ReadinessChart score={91} />
      </div>
      {/* Dimension bars */}
      <div className="flex flex-col gap-3">
        {dimensions?.map((dim) => (
          <div key={dim?.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                {dim?.label}
              </span>
              <span className="text-xs font-bold tabular-nums" style={{ color: dim?.color }}>
                {dim?.score}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${dim?.score}%`, backgroundColor: dim?.color }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Status badge */}
      <div
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
        style={{ backgroundColor: '#DCFCE7' }}
      >
        <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
          🌾 Funding Ready
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
        >
          Top 10%
        </span>
      </div>
    </div>
  );
}