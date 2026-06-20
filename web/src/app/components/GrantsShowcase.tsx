import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Target, TrendingUp } from 'lucide-react';

const grants = [
  {
    id: 'grant-cbn-acgsf',
    name: 'CBN ACGSF',
    fullName: 'Agricultural Credit Guarantee Scheme Fund',
    body: 'Central Bank of Nigeria',
    funding: '₦100K – ₦50M',
    matchScore: 94,
    daysLeft: 18,
    category: 'Credit Guarantee',
    color: 'var(--primary)',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    tag: 'Most Popular',
    tagColor: '#166534',
    tagBg: '#DCFCE7',
  },
  {
    id: 'grant-nirsal',
    name: 'NIRSAL',
    fullName: 'Incentive-Based Risk Sharing for Agri Lending',
    body: 'CBN / NIRSAL Plc',
    funding: '₦500K – ₦100M',
    matchScore: 88,
    daysLeft: 32,
    category: 'Risk Sharing',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    tag: 'High Value',
    tagColor: '#065F46',
    tagBg: '#D1FAE5',
  },
  {
    id: 'grant-anchor',
    name: 'Anchor Borrowers',
    fullName: "CBN Anchor Borrowers\' Programme",
    body: 'Central Bank of Nigeria',
    funding: '₦200K – ₦5M',
    matchScore: 91,
    daysLeft: 7,
    category: 'Smallholder Grants',
    color: '#CA8A04',
    bg: '#FFFBEB',
    border: '#FDE68A',
    tag: 'Closing Soon',
    tagColor: '#92400E',
    tagBg: '#FEF3C7',
  },
  {
    id: 'grant-agsmeis',
    name: 'AGSMEIS',
    fullName: 'Agri-Business SME Investment Scheme',
    body: 'CBN / Participating Banks',
    funding: '₦3M – ₦2B',
    matchScore: 79,
    daysLeft: 45,
    category: 'SME Financing',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    tag: 'New Round',
    tagColor: '#5B21B6',
    tagBg: '#EDE9FE',
  },
  {
    id: 'grant-fao',
    name: 'FAO Nigeria',
    fullName: 'FAO Emergency & Resilience Plan 2026–2028',
    body: 'Food & Agriculture Organization',
    funding: '₦5M – ₦15M',
    matchScore: 85,
    daysLeft: 22,
    category: 'Food Security',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    tag: 'International',
    tagColor: '#1D4ED8',
    tagBg: '#DBEAFE',
  },
  {
    id: 'grant-farmermoni',
    name: 'FarmerMoni',
    fullName: 'Government Enterprise & Empowerment Programme',
    body: 'Federal Government of Nigeria',
    funding: 'Up to ₦300K',
    matchScore: 96,
    daysLeft: 12,
    category: 'Interest-Free Funding',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    tag: 'Best Match',
    tagColor: '#134E4A',
    tagBg: '#CCFBF1',
  },
];

export default function GrantsShowcase() {
  return (
    <section id="grants" className="py-20 lg:py-28" style={{ backgroundColor: 'var(--muted)' }}>
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span
              className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-4"
              style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}
            >
              Grant Marketplace
            </span>
            <h2
              className="text-3xl xl:text-4xl font-extrabold tracking-tight mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Active Funding Opportunities
            </h2>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Real Nigerian agricultural grant programmes, matched to your farm profile
            </p>
          </div>
          <Link
            href="/sign-up-login-screen"
            className="btn-primary self-start md:self-auto whitespace-nowrap gap-2"
          >
            View All Grants
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grant cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {grants?.map((grant) => (
            <div
              key={grant?.id}
              className="card-elevated flex flex-col gap-4 hover:shadow-card-hover transition-all duration-200 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ backgroundColor: grant?.color }}
                >
                  {grant?.name?.charAt(0)}
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: grant?.tagBg, color: grant?.tagColor }}
                >
                  {grant?.tag}
                </span>
              </div>

              {/* Name & body */}
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {grant?.name}
                </p>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {grant?.fullName}
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: grant?.color }}>
                  {grant?.body}
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {/* Match score */}
                <div
                  className="flex flex-col items-center p-2 rounded-xl"
                  style={{ backgroundColor: grant?.bg }}
                >
                  <Target size={13} style={{ color: grant?.color }} />
                  <p
                    className="text-base font-bold tabular-nums mt-1"
                    style={{ color: grant?.color }}
                  >
                    {grant?.matchScore}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Match
                  </p>
                </div>
                {/* Funding */}
                <div
                  className="flex flex-col items-center p-2 rounded-xl col-span-1"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <TrendingUp size={13} style={{ color: 'var(--muted-foreground)' }} />
                  <p
                    className="text-xs font-bold mt-1 text-center leading-tight tabular-nums"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {grant?.funding}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Funding
                  </p>
                </div>
                {/* Deadline */}
                <div
                  className="flex flex-col items-center p-2 rounded-xl"
                  style={{ backgroundColor: grant?.daysLeft <= 14 ? '#FEF3C7' : 'var(--muted)' }}
                >
                  <Calendar
                    size={13}
                    style={{ color: grant?.daysLeft <= 14 ? '#D97706' : 'var(--muted-foreground)' }}
                  />
                  <p
                    className="text-base font-bold tabular-nums mt-1"
                    style={{ color: grant?.daysLeft <= 14 ? '#D97706' : 'var(--foreground)' }}
                  >
                    {grant?.daysLeft}d
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Left
                  </p>
                </div>
              </div>

              {/* Category badge */}
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                >
                  {grant?.category}
                </span>
                <Link
                  href="/sign-up-login-screen"
                  className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: grant?.color }}
                >
                  Apply Now
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
