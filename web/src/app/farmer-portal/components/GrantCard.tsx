import React from 'react';
import { ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { MatchedGrant } from './portalTypes';

interface Props {
  grant: MatchedGrant;
}

function ScoreBadge({ score }: { score: number }) {
  let bg = '#E2E8F0';
  let color = '#64748B';
  if (score >= 75) {
    bg = '#DCFCE7';
    color = '#166534';
  } else if (score >= 50) {
    bg = '#FFFBEB';
    color = '#92400E';
  }

  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0"
      style={{
        backgroundColor: bg,
        color,
        width: 52,
        height: 52,
        border: `2px solid ${color}`,
        flexShrink: 0,
      }}
    >
      {score}%
    </div>
  );
}

function CategoryLabel({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: '#EDE9FE', color: '#5B21B6' }}
    >
      {label}
    </span>
  );
}

export default function GrantCard({ grant }: Props) {
  const hasUrl = !!grant.applicationUrl && grant.applicationUrl !== '#';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-150"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 4px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 1px 3px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: score + name */}
      <div className="flex items-start gap-3">
        <ScoreBadge score={grant.matchScore} />
        <div className="flex flex-col gap-1 min-w-0">
          <h3
            className="font-bold text-sm leading-snug"
            style={{ color: 'var(--foreground)' }}
          >
            {grant.grantName}
          </h3>
          <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {grant.grantingOrganization}
          </span>
          {grant.grantCategory && <CategoryLabel label={grant.grantCategory} />}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3">
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <DollarSign size={13} />
          {grant.fundingAmountRange}
        </span>
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <Calendar size={13} />
          {grant.applicationDeadline}
        </span>
      </div>

      {/* Match reason */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
          Why matched:{' '}
        </span>
        {grant.matchReason}
      </p>

      {/* Apply button */}
      {hasUrl ? (
        <a
          href={grant.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#14532D';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--primary)';
          }}
        >
          Apply Now
          <ExternalLink size={14} />
        </a>
      ) : (
        <button
          disabled
          className="mt-1 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
          style={{
            backgroundColor: 'var(--muted)',
            color: 'var(--muted-foreground)',
          }}
        >
          Check Official Source
        </button>
      )}
    </div>
  );
}
