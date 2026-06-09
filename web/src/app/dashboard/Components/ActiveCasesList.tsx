'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { usePortalResults } from '@/context/PortalResultsContext';

const statusBadge = {
  active: { label: 'Active', bg: '#DCFCE7', color: '#166534' },
  working: { label: 'AI Working', bg: '#FEF9C3', color: '#92400E' },
  review: { label: 'Needs Review', bg: '#DBEAFE', color: '#1D4ED8' },
};

export default function ActiveCasesList() {
  const { activeCases } = usePortalResults();

  return (
    <div className="card-elevated flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Active Cases
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {activeCases.length} grant application{activeCases.length !== 1 ? 's' : ''} in progress
          </p>
        </div>
        <Link
          href="/dashboard/cases"
          className="flex items-center gap-1 text-xs font-semibold transition-colors"
          style={{ color: 'var(--primary)' }}
        >
          View All
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Case cards */}
      <div className="flex flex-col gap-4">
        {activeCases.length === 0 ? (
          <div
            className="p-6 text-center rounded-xl border border-dashed"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No active applications. Find a grant and click "Apply" to start!
            </p>
          </div>
        ) : (
          activeCases.map((c) => {
          const badge = statusBadge[c.status];
          return (
            <div
              key={c.id}
              className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-card cursor-pointer"
              style={{
                borderColor: c.status === 'review' ? '#BFDBFE' : c.daysLeft <= 10 ? '#FDE68A' : 'var(--border)',
                backgroundColor: c.status === 'review' ? '#EFF6FF' : c.daysLeft <= 10 ? '#FFFBEB' : 'var(--muted)',
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--muted-foreground)' }}>
                      #{c.caseNumber}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    {c.daysLeft <= 10 && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                      >
                        <Clock size={10} />
                        {c.daysLeft}d left
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>
                    {c.grantName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {c.body}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-extrabold tabular-nums" style={{ color: 'var(--primary)' }}>
                    {c.funding}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>potential</p>
                </div>
              </div>

              {/* Stage pipeline */}
              <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                {c.stages.map((stage, idx) => {
                  const isDone = c.completedStages.includes(idx);
                  const isActive = c.activeStage === idx;
                  return (
                    <React.Fragment key={`${c.id}-stage-${idx}`}>
                      <div
                        className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: isDone ? '#DCFCE7' : isActive ? '#FEF9C3' : 'var(--background)',
                          color: isDone ? '#166534' : isActive ? '#92400E' : 'var(--muted-foreground)',
                          border: `1px solid ${isDone ? '#BBF7D0' : isActive ? '#FDE68A' : 'var(--border)'}`,
                          fontWeight: isActive ? 700 : 500,
                        }}
                      >
                        {isDone ? '✓' : isActive ? '▶' : ''} {stage}
                      </div>
                      {idx < c.stages.length - 1 && (
                        <ChevronRight size={10} style={{ color: 'var(--border)', flexShrink: 0 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Progress bar + stats */}
              <div className="flex items-center gap-3">
                <div className="flex-1 progress-track">
                  <div
                    className="progress-fill-green"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: 'var(--primary)' }}>
                  {c.progress}%
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  Stage {c.stage}/{c.totalStages}
                </span>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--accent)' }}>
                  {c.matchScore}% match
                </span>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}