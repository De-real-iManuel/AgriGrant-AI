'use client';
import React, { useMemo } from 'react';
import { FolderOpen, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { usePortalResults } from '@/context/PortalResultsContext';

function parseFundingMax(amountRange: string): number {
  if (!amountRange) return 0;
  // Handle things like "Up to ₦300K" or "₦3M – ₦2B"
  // Normalize K, M, B
  const normalized = amountRange.toUpperCase();
  const matches = normalized.replace(/,/g, '').match(/[\d\.]+/g);
  if (!matches) return 0;

  const numbers = matches.map((m) => {
    let val = parseFloat(m);
    if (normalized.includes(m + 'K')) val *= 1000;
    else if (normalized.includes(m + 'M')) val *= 1000000;
    else if (normalized.includes(m + 'B')) val *= 1000000000;
    return val;
  });

  return Math.max(...numbers, 0);
}

function formatNaira(num: number): string {
  if (num >= 1000000000) {
    return `₦${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (num >= 1000000) {
    return `₦${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1000) {
    return `₦${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₦${num}`;
}

export default function KPIBentoGrid() {
  const { latestResult, activeCases } = usePortalResults();

  const kpis = useMemo(() => {
    // 1. Active Cases
    const activeCount = activeCases.length;
    const attentionCount = activeCases.filter(c => c.status === 'review').length;
    const casesSub = activeCases.length === 0
      ? 'No applications yet'
      : attentionCount > 0
      ? `${attentionCount} need${attentionCount !== 1 ? 's' : ''} your attention`
      : 'All applications running smoothly';

    // 2. Funding Opportunities
    const oppCount = latestResult ? latestResult.totalMatchesFound : 0;
    const highMatchCount = latestResult
      ? latestResult.matchedGrants.filter(g => g.matchScore >= 90).length
      : 0;

    // 3. Avg Match Score
    let avgMatch = 0;
    if (latestResult && latestResult.matchedGrants.length > 0) {
      const sum = latestResult.matchedGrants.reduce((acc, g) => acc + g.matchScore, 0);
      avgMatch = Math.round(sum / latestResult.matchedGrants.length);
    }

    // 4. Potential Funding
    let totalPotential = 0;
    if (latestResult && latestResult.matchedGrants.length > 0) {
      totalPotential = latestResult.matchedGrants.reduce((acc, g) => acc + parseFundingMax(g.fundingAmountRange), 0);
    } else if (activeCases.length > 0) {
      totalPotential = activeCases.reduce((acc, c) => acc + parseFundingMax(c.funding), 0);
    }

    return [
      {
        id: 'kpi-cases',
        label: 'Active Cases',
        value: String(activeCount),
        sub: casesSub,
        icon: FolderOpen,
        iconTint: 'var(--tint-green)',
        iconColor: 'var(--primary)',
        trend: activeCount > 0 ? `${activeCount} in progress` : 'No active cases',
        trendPositive: true,
        alert: false,
      },
      {
        id: 'kpi-grants',
        label: 'Funding Opportunities',
        value: String(oppCount),
        sub: `${highMatchCount} match${highMatchCount !== 1 ? 'es' : ''} above 90%`,
        icon: TrendingUp,
        iconTint: 'var(--tint-blue)',
        iconColor: '#60A5FA',
        trend: latestResult ? 'Updated from profile' : 'No data yet',
        trendPositive: true,
        alert: false,
      },
      {
        id: 'kpi-match',
        label: 'Avg Match Score',
        value: `${avgMatch}%`,
        sub: 'Across matches',
        icon: Target,
        iconTint: 'var(--tint-amber)',
        iconColor: 'var(--accent)',
        trend: avgMatch > 0 ? 'From your matches' : 'Run a search first',
        trendPositive: true,
        alert: false,
      },
      {
        id: 'kpi-funding',
        label: 'Potential Funding',
        value: formatNaira(totalPotential),
        sub: latestResult ? 'Based on matched programs' : 'No matches yet',
        icon: AlertTriangle,
        iconTint: 'var(--tint-amber)',
        iconColor: 'var(--accent)',
        trend: activeCases.some(c => c.daysLeft <= 10) ? 'Deadline soon' : 'No deadlines near',
        trendPositive: !activeCases.some(c => c.daysLeft <= 10),
        alert: activeCases.some(c => c.daysLeft <= 10),
      },
    ];
  }, [latestResult, activeCases]);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="card-elevated flex flex-col gap-4"
            style={{
              border: card.alert ? '1px solid rgba(217,119,6,0.35)' : '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.iconTint }}
              >
                <IconComponent size={17} style={{ color: card.iconColor }} />
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: card.trendPositive ? 'var(--tint-green)' : 'var(--tint-amber)',
                  color: card.trendPositive ? 'var(--primary)' : 'var(--accent)',
                }}
              >
                {card.trend}
              </span>
            </div>
            <div>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--foreground)' }}
              >
                {card.value}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {card.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}