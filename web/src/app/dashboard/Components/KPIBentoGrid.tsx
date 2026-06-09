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
    const casesSub = attentionCount > 0 
      ? `${attentionCount} need${attentionCount !== 1 ? 's' : ''} your attention` 
      : 'All applications running smoothly';

    // 2. Funding Opportunities
    const oppCount = latestResult ? latestResult.totalMatchesFound : 15;
    const highMatchCount = latestResult 
      ? latestResult.matchedGrants.filter(g => g.matchScore >= 90).length 
      : 4;

    // 3. Avg Match Score
    let avgMatch = 91;
    if (latestResult && latestResult.matchedGrants.length > 0) {
      const sum = latestResult.matchedGrants.reduce((acc, g) => acc + g.matchScore, 0);
      avgMatch = Math.round(sum / latestResult.matchedGrants.length);
    }

    // 4. Potential Funding
    let totalPotential = 47000000; // ₦47M fallback
    if (latestResult && latestResult.matchedGrants.length > 0) {
      // Sum the max amount ranges
      totalPotential = latestResult.matchedGrants.reduce((acc, g) => acc + parseFundingMax(g.fundingAmountRange), 0);
      if (totalPotential === 0) totalPotential = 47000000;
    } else if (activeCases.length > 0) {
      totalPotential = activeCases.reduce((acc, c) => acc + parseFundingMax(c.funding), 0);
      if (totalPotential === 0) totalPotential = 47000000;
    }

    return [
      {
        id: 'kpi-cases',
        label: 'Active Cases',
        value: String(activeCount),
        sub: casesSub,
        icon: FolderOpen,
        iconBg: '#DCFCE7',
        iconColor: 'var(--primary)',
        trend: activeCount > 2 ? `+${activeCount - 2} this week` : 'Stable',
        trendPositive: true,
        alert: false,
        cardBg: 'var(--card)',
      },
      {
        id: 'kpi-grants',
        label: 'Funding Opportunities',
        value: String(oppCount),
        sub: `${highMatchCount} match${highMatchCount !== 1 ? 'es' : ''} above 90%`,
        icon: TrendingUp,
        iconBg: '#DBEAFE',
        iconColor: '#2563EB',
        trend: latestResult ? 'Updated live' : '+3 new today',
        trendPositive: true,
        alert: false,
        cardBg: 'var(--card)',
      },
      {
        id: 'kpi-match',
        label: 'Avg Match Score',
        value: `${avgMatch}%`,
        sub: 'Across matches',
        icon: Target,
        iconBg: '#FEF9C3',
        iconColor: '#CA8A04',
        trend: '+4% profile sync',
        trendPositive: true,
        alert: false,
        cardBg: 'var(--card)',
      },
      {
        id: 'kpi-funding',
        label: 'Potential Funding',
        value: formatNaira(totalPotential),
        sub: latestResult ? 'Based on matched programs' : 'CBN Anchor + NIRSAL + FAO',
        icon: AlertTriangle,
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
        trend: 'Deadline warning active',
        trendPositive: false,
        alert: activeCases.some(c => c.daysLeft <= 10),
        cardBg: activeCases.some(c => c.daysLeft <= 10) ? '#FFFBEB' : 'var(--card)',
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
              backgroundColor: card.cardBg,
              border: card.alert ? '1px solid #FDE68A' : '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.iconBg }}
              >
                <IconComponent size={18} style={{ color: card.iconColor }} />
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: card.trendPositive ? '#DCFCE7' : '#FEF3C7',
                  color: card.trendPositive ? '#166534' : '#92400E',
                }}
              >
                {card.trend}
              </span>
            </div>
            <div>
              <p
                className="text-3xl font-extrabold tabular-nums"
                style={{ color: 'var(--foreground)' }}
              >
                {card.value}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {card.label}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}