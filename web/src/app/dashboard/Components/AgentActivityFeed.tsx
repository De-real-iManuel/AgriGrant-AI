'use client';
import React, { useState } from 'react';
import { Search, Shield, FileCheck, PenLine, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


const agents = [
  {
    id: 'agent-discovery',
    icon: Search,
    name: 'Discovery Agent',
    status: 'active' as const,
    activity: 'Found 12 new grants matching your profile',
    time: '02:41 AM',
    case: 'All Cases',
  },
  {
    id: 'agent-eligibility',
    icon: Shield,
    name: 'Eligibility Agent',
    status: 'active' as const,
    activity: 'Calculated 91% match score for CBN Anchor',
    time: '02:38 AM',
    case: 'Case #AG-2026-001',
  },
  {
    id: 'agent-document',
    icon: FileCheck,
    name: 'Document Agent',
    status: 'active' as const,
    activity: 'Validated Farm Certificate & CAC documents',
    time: '02:35 AM',
    case: 'Case #AG-2026-001',
  },
  {
    id: 'agent-proposal',
    icon: PenLine,
    name: 'Proposal Agent',
    status: 'working' as const,
    activity: 'Generating executive narrative for NIRSAL...',
    time: '02:30 AM',
    case: 'Case #AG-2026-002',
  },
  {
    id: 'agent-review',
    icon: Eye,
    name: 'Human Review',
    status: 'waiting' as const,
    activity: 'Awaiting your approval on FAO proposal',
    time: '02:25 AM',
    case: 'Case #AG-2026-003',
  },
];

const statusConfig = {
  active: { dot: 'agent-dot-green', label: 'Complete', labelBg: '#DCFCE7', labelColor: '#166534' },
  working: { dot: 'agent-dot-yellow', label: 'In Progress', labelBg: '#FEF9C3', labelColor: '#92400E' },
  waiting: { dot: 'agent-dot-blue', label: 'Needs You', labelBg: '#DBEAFE', labelColor: '#1D4ED8' },
};

export default function AgentActivityFeed() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
    toast.success('Agent activity refreshed');
  };

  return (
    <div className="card-elevated flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            AI Agent Activity
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Live orchestration status
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg transition-colors hover:bg-muted"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label="Refresh agent activity"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const config = statusConfig[agent.status];
          return (
            <div
              key={agent.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-muted cursor-default"
            >
              {/* Icon + dot */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <Icon size={15} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <span
                  className={`${config.dot} absolute -bottom-0.5 -right-0.5`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '2px solid var(--card)',
                    backgroundColor:
                      agent.status === 'active' ? '#22C55E' :
                      agent.status === 'working' ? '#EAB308' : '#3B82F6',
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--foreground)' }}>
                    {agent.name}
                  </p>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: config.labelBg, color: config.labelColor }}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {agent.activity}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                    {agent.time}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                    {agent.case}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="pt-3 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          5 agents · All systems operational
        </p>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--secondary)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full agent-pulse"
            style={{ backgroundColor: 'var(--secondary)' }}
          />
          Live
        </div>
      </div>
    </div>
  );
}