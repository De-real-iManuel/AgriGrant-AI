import React from 'react';
import { Search, Shield, FileCheck, PenLine, Eye, Zap, Users, BarChart3 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

const agents = [
  {
    id: 'feat-discovery',
    icon: Search,
    name: 'Discovery Agent',
    tagline: 'Find the right grants automatically',
    description:
      'Continuously scans CBN, NIRSAL, FAO, AGSMEIS, and 200+ grant databases. Matches your farm profile against active opportunities in real time.',
    highlights: [
      '200+ grant programs monitored',
      'Profile-based matching',
      'Deadline tracking & alerts',
    ],
    color: 'var(--primary)',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    id: 'feat-eligibility',
    icon: Shield,
    name: 'Eligibility Agent',
    tagline: 'Know your chances before you apply',
    description:
      "Analyzes your farm data, revenue, location, and crop types against each grant's criteria. Returns a precise eligibility score with gap analysis.",
    highlights: ['Precise match scoring', 'Gap identification', 'Eligibility improvement tips'],
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    id: 'feat-document',
    icon: FileCheck,
    name: 'Document Agent',
    tagline: 'Validate and organize your paperwork',
    description:
      'Verifies your uploaded documents against grant requirements. Flags missing items, checks expiry dates, and ensures all submissions are complete.',
    highlights: ['CAC & farm cert validation', 'Expiry date monitoring', 'Completeness checklist'],
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
  },
  {
    id: 'feat-proposal',
    icon: PenLine,
    name: 'Proposal Agent',
    tagline: 'AI-written proposals tailored to each grant',
    description:
      "Generates compelling executive summaries, budget breakdowns, and impact narratives. Each proposal is customized to the specific grant's evaluation criteria.",
    highlights: [
      'Grant-specific narratives',
      'Budget breakdown generation',
      'Impact statement drafting',
    ],
    color: '#CA8A04',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    id: 'feat-review',
    icon: Eye,
    name: 'Human Review Stage',
    tagline: 'You stay in control before submission',
    description:
      'Every proposal goes through your review before submission. Edit, approve, or request changes — all in a clean split-screen interface.',
    highlights: ['Full proposal preview', 'Inline edit capability', 'Risk flag display'],
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    id: 'feat-submit',
    icon: Zap,
    name: 'Submit Agent',
    tagline: 'Automated submission to grant portals',
    description:
      'Handles direct submission to CBN, NIRSAL, and other agency portals. Tracks acknowledgment numbers and monitors submission status post-filing.',
    highlights: ['Direct portal filing', 'Acknowledgment tracking', 'Status monitoring'],
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
];

const additionalFeatures = [
  {
    id: 'af-coop',
    icon: Users,
    label: 'Cooperative Support',
    desc: 'Manage group applications for farmer cooperatives',
  },
  {
    id: 'af-analytics',
    icon: BarChart3,
    label: 'Funding Analytics',
    desc: 'Track success rates and optimize your strategy',
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
          >
            AI Agent Orchestration
          </span>
          <h2
            className="text-3xl xl:text-4xl font-extrabold tracking-tight mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            5 Intelligent Agents Working Together
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Each agent specializes in one part of the grant application process. Together they form
            a complete AI-powered pipeline — from discovery to submission.
          </p>
        </div>

        {/* Agent cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents?.map((agent) => {
            const Icon = agent?.icon;
            return (
              <div
                key={agent?.id}
                className="card-elevated flex flex-col gap-4 hover:shadow-card-hover transition-shadow duration-200"
              >
                {/* Icon + name */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: agent?.bg, border: `1px solid ${agent?.border}` }}
                  >
                    <Icon size={20} style={{ color: agent?.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                      {agent?.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: agent?.color, fontWeight: 600 }}>
                      {agent?.tagline}
                    </p>
                  </div>
                </div>
                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {agent?.description}
                </p>
                {/* Highlights */}
                <ul className="flex flex-col gap-1.5">
                  {agent?.highlights?.map((h) => (
                    <li key={`${agent?.id}-${h}`} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: agent?.color }}
                      />
                      <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Additional features row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {additionalFeatures?.map((feat) => {
            const Icon = feat?.icon;
            return (
              <div
                key={feat?.id}
                className="flex items-center gap-4 p-5 rounded-2xl border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#DCFCE7' }}
                >
                  <Icon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {feat?.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {feat?.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
