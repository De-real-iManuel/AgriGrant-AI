'use client';
import React from 'react';
import { Search, Shield, FileCheck, PenLine, Send } from 'lucide-react';
import { usePortalResults } from '@/context/PortalResultsContext';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const AGENT_DEFS = [
  { id: 'agent-discovery', icon: Search, name: 'Grant Discovery' },
  { id: 'agent-eligibility', icon: Shield, name: 'Eligibility & Risk' },
  { id: 'agent-document', icon: FileCheck, name: 'Document Review' },
  { id: 'agent-proposal', icon: PenLine, name: 'Proposal Generation' },
  { id: 'agent-submission', icon: Send, name: 'Submission & Follow-up' },
];

export default function AgentActivityFeed() {
  const { latestResult, activeCases } = usePortalResults();

  const hasActivity = !!latestResult || activeCases.length > 0;

  return (
    <div className="card-elevated flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          AI Agent Activity
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {hasActivity ? 'Pipeline status for your cases' : 'Agents idle — no pipeline running'}
        </p>
      </div>

      {!hasActivity ? (
        <div
          className="p-6 text-center rounded-xl border border-dashed flex flex-col items-center gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            All 5 agents are standing by. Start a grant search to activate the pipeline.
          </p>
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            Start now <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {AGENT_DEFS.map((agent) => {
            const Icon = agent.icon;
            const isComplete = latestResult !== null;
            const statusLabel = isComplete ? 'Complete' : 'Idle';
            const dotColor = isComplete ? '#22C55E' : '#94A3B8';
            const labelBg = isComplete ? '#DCFCE7' : 'var(--muted)';
            const labelColor = isComplete ? '#166534' : 'var(--muted-foreground)';

            return (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <Icon size={15} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{ backgroundColor: dotColor, borderColor: 'var(--card)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--foreground)' }}>
                    {agent.name}
                  </p>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: labelBg, color: labelColor }}
                >
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div
        className="pt-3 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          5 agents · {hasActivity ? 'Pipeline active' : 'All systems idle'}
        </p>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: hasActivity ? 'var(--secondary)' : 'var(--muted-foreground)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: hasActivity ? 'var(--secondary)' : '#94A3B8' }}
          />
          {hasActivity ? 'Live' : 'Idle'}
        </div>
      </div>
    </div>
  );
}
