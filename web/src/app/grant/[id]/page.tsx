'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  FileText,
  Users,
  Banknote,
  Building2,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  BookOpen,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Grant data store ────────────────────────────────────────────────────────
const grantsData: Record<string, GrantDetail> = {
  'rec-farmermoni': {
    id: 'rec-farmermoni',
    name: 'FarmerMoni Scheme',
    body: 'Federal Government of Nigeria',
    category: 'Interest-Free Funding',
    matchScore: 96,
    funding: 'Up to ₦300,000',
    minFunding: '₦10,000',
    maxFunding: '₦300,000',
    daysLeft: 12,
    deadline: '11 Jun 2026',
    openDate: '01 Apr 2026',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    status: 'Open',
    overview:
      'FarmerMoni is a Federal Government of Nigeria initiative under the Government Enterprise and Empowerment Programme (GEEP). It provides interest-free funding to smallholder farmers, enabling them to purchase inputs, expand operations, and improve productivity without the burden of interest payments.',
    eligibilityCriteria: [
      {
        met: true,
        label: 'Nigerian citizen with valid NIN',
        description: 'Must provide National Identification Number',
      },
      {
        met: true,
        label: 'Active smallholder farmer',
        description: 'Farming on 0.5 – 5 hectares of land',
      },
      {
        met: true,
        label: 'BVN-linked bank account',
        description: 'Bank Verification Number required for disbursement',
      },
      {
        met: true,
        label: 'Farm registration certificate',
        description: 'State Ministry of Agriculture registration',
      },
      {
        met: false,
        label: 'Cooperative membership',
        description: 'Must belong to a registered farmers cooperative',
      },
      {
        met: true,
        label: 'Clean federal credit history',
        description: 'No outstanding default on government schemes',
      },
    ],
    fundingTiers: [
      {
        tier: 'Tier 1 – Starter',
        amount: '₦10,000 – ₦50,000',
        description: 'First-time applicants, basic input purchase',
        color: '#0D9488',
      },
      {
        tier: 'Tier 2 – Growth',
        amount: '₦50,000 – ₦150,000',
        description: 'Returning beneficiaries with strong performance history',
        color: '#059669',
      },
      {
        tier: 'Tier 3 – Scale',
        amount: '₦150,000 – ₦300,000',
        description: 'Established farmers with cooperative backing',
        color: '#166534',
      },
    ],
    timeline: [
      {
        phase: 'Application Window',
        date: '01 Apr – 11 Jun 2026',
        status: 'active',
        description: 'Submit application via GEEP portal or agent',
      },
      {
        phase: 'Verification & Screening',
        date: '12 Jun – 30 Jun 2026',
        status: 'upcoming',
        description: 'BVN verification and farm visit by field agents',
      },
      {
        phase: 'Approval & Notification',
        date: '01 Jul – 15 Jul 2026',
        status: 'upcoming',
        description: 'Successful applicants notified via SMS',
      },
      {
        phase: 'Disbursement',
        date: '20 Jul 2026',
        status: 'upcoming',
        description: 'Funds credited directly to linked bank account',
      },
      {
        phase: 'Repayment Begins',
        date: '20 Jan 2027',
        status: 'upcoming',
        description: '6-month grace period, then 12-month structured payback',
      },
    ],
    requirements: [
      { icon: 'id', label: 'National ID / NIN Slip', required: true },
      { icon: 'farm', label: 'Farm Registration Certificate', required: true },
      { icon: 'bank', label: 'Bank Statement (3 months)', required: true },
      { icon: 'photo', label: 'Passport Photograph', required: true },
      { icon: 'coop', label: 'Cooperative Membership Letter', required: true },
      { icon: 'bvn', label: 'BVN Verification', required: true },
      { icon: 'land', label: 'Land Use Agreement / Title', required: false },
    ],
    stats: {
      totalApplicants: '2.4M+',
      successRate: '78%',
      avgDisbursement: '₦85,000',
      repaymentRate: '91%',
    },
    contactBody: 'GEEP Secretariat, Abuja',
    website: 'geep.gov.ng',
  },
  'rec-agsmeis': {
    id: 'rec-agsmeis',
    name: 'AGSMEIS Round 4',
    body: 'CBN / Participating Banks',
    category: 'SME Financing',
    matchScore: 89,
    funding: '₦3M – ₦2B',
    minFunding: '₦3,000,000',
    maxFunding: '₦2,000,000,000',
    daysLeft: 45,
    deadline: '14 Jul 2026',
    openDate: '01 May 2026',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    status: 'Open',
    overview:
      'The Agri-Business/Small and Medium Enterprise Investment Scheme (AGSMEIS) is a CBN initiative to support agricultural businesses and SMEs. It provides single-digit interest-rate funding through participating banks to stimulate agricultural value chain development and job creation.',
    eligibilityCriteria: [
      {
        met: true,
        label: 'Registered Nigerian business (CAC)',
        description: 'Certificate of Incorporation required',
      },
      {
        met: true,
        label: 'Annual revenue ₦500K – ₦5B',
        description: 'Audited financial statements for 2 years',
      },
      {
        met: true,
        label: 'Agriculture or agro-processing sector',
        description: 'Primary or value-chain agricultural activity',
      },
      {
        met: false,
        label: 'Minimum 3 years in operation',
        description: 'Business must have been active since 2023',
      },
      {
        met: true,
        label: 'Clean CBN credit history',
        description: 'No outstanding default across CBN schemes',
      },
      {
        met: false,
        label: 'NIRSAL credit guarantee',
        description: 'Pre-qualification through NIRSAL required for large amounts',
      },
    ],
    fundingTiers: [
      {
        tier: 'Micro',
        amount: '₦3M – ₦10M',
        description: 'Smallholder farmers and micro agri-businesses',
        color: '#7C3AED',
      },
      {
        tier: 'Small',
        amount: '₦10M – ₦100M',
        description: 'Small agro-processing and input supply businesses',
        color: '#6D28D9',
      },
      {
        tier: 'Medium',
        amount: '₦100M – ₦500M',
        description: 'Medium-scale agri-enterprises with collateral',
        color: '#5B21B6',
      },
      {
        tier: 'Large',
        amount: '₦500M – ₦2B',
        description: 'Large agri-businesses with NIRSAL guarantee',
        color: '#4C1D95',
      },
    ],
    timeline: [
      {
        phase: 'Application Window',
        date: '01 May – 14 Jul 2026',
        status: 'active',
        description: 'Apply through any CBN-participating bank',
      },
      {
        phase: 'Bank Assessment',
        date: '15 Jul – 31 Jul 2026',
        status: 'upcoming',
        description: 'Bank conducts due diligence and credit assessment',
      },
      {
        phase: 'CBN Approval',
        date: '01 Aug – 20 Aug 2026',
        status: 'upcoming',
        description: 'CBN reviews and approves qualifying applications',
      },
      {
        phase: 'Funding Agreement',
        date: '25 Aug 2026',
        status: 'upcoming',
        description: 'Sign funding agreement with participating bank',
      },
      {
        phase: 'Disbursement',
        date: '01 Sep 2026',
        status: 'upcoming',
        description: 'Funds disbursed at 5% interest rate per annum',
      },
    ],
    requirements: [
      { icon: 'cac', label: 'CAC Certificate of Incorporation', required: true },
      { icon: 'bank', label: 'Audited Financial Statements (2 yrs)', required: true },
      { icon: 'id', label: "Directors' ID & BVN", required: true },
      { icon: 'plan', label: 'Business Plan / Feasibility Study', required: true },
      { icon: 'tax', label: 'Tax Clearance Certificate', required: true },
      { icon: 'land', label: 'Collateral Documentation', required: false },
    ],
    stats: {
      totalApplicants: '180K+',
      successRate: '62%',
      avgDisbursement: '₦45M',
      repaymentRate: '84%',
    },
    contactBody: 'CBN Development Finance Department',
    website: 'cbn.gov.ng/agsmeis',
  },
  'rec-boa': {
    id: 'rec-boa',
    name: 'BOA Renewed Hope Fund',
    body: 'Bank of Agriculture',
    category: 'Smallholder Credit',
    matchScore: 83,
    funding: '₦500K – ₦5M',
    minFunding: '₦500,000',
    maxFunding: '₦5,000,000',
    daysLeft: 38,
    deadline: '07 Jul 2026',
    openDate: '15 Apr 2026',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    status: 'Open',
    overview:
      "The BOA Renewed Hope Fund is a targeted credit facility under President Tinubu's Renewed Hope Agenda, administered by the Bank of Agriculture. It prioritizes cassava, rice, and maize farmers with subsidized interest rates and flexible payback terms aligned with harvest cycles.",
    eligibilityCriteria: [
      {
        met: true,
        label: 'Smallholder farmer (0.5 – 10 ha)',
        description: 'Farm size verified by BOA field officer',
      },
      {
        met: true,
        label: 'Cassava, rice, or maize cultivation',
        description: 'Priority crops under the Renewed Hope Agenda',
      },
      {
        met: true,
        label: 'Valid NIN and BVN',
        description: 'Both required for identity verification',
      },
      {
        met: true,
        label: 'State-level farm registration',
        description: 'Registered with State ADP or Ministry of Agriculture',
      },
      {
        met: true,
        label: 'Clean BOA credit history',
        description: 'No outstanding default with Bank of Agriculture',
      },
      {
        met: false,
        label: 'Irrigation or water access documentation',
        description: 'Preferred for dry-season farming applications',
      },
    ],
    fundingTiers: [
      {
        tier: 'Input Support',
        amount: '₦500K – ₦1.5M',
        description: 'Seeds, fertilizers, and basic farm inputs',
        color: '#059669',
      },
      {
        tier: 'Equipment',
        amount: '₦1.5M – ₦3M',
        description: 'Small machinery and irrigation equipment',
        color: '#047857',
      },
      {
        tier: 'Expansion',
        amount: '₦3M – ₦5M',
        description: 'Land expansion and post-harvest infrastructure',
        color: '#065F46',
      },
    ],
    timeline: [
      {
        phase: 'Application Window',
        date: '15 Apr – 07 Jul 2026',
        status: 'active',
        description: 'Apply at any BOA branch or online portal',
      },
      {
        phase: 'Field Verification',
        date: '08 Jul – 25 Jul 2026',
        status: 'upcoming',
        description: 'BOA field officer visits farm for verification',
      },
      {
        phase: 'Credit Committee Review',
        date: '26 Jul – 10 Aug 2026',
        status: 'upcoming',
        description: 'BOA credit committee approves applications',
      },
      {
        phase: 'Disbursement',
        date: '15 Aug 2026',
        status: 'upcoming',
        description: 'Funds disbursed at 9% interest per annum',
      },
    ],
    requirements: [
      { icon: 'id', label: 'National ID / NIN Slip', required: true },
      { icon: 'farm', label: 'Farm Registration Certificate', required: true },
      { icon: 'bank', label: 'Bank Statement (6 months)', required: true },
      { icon: 'photo', label: 'Passport Photograph (2 copies)', required: true },
      { icon: 'land', label: 'Land Title / Tenancy Agreement', required: true },
      { icon: 'crop', label: 'Crop Production Plan', required: false },
    ],
    stats: {
      totalApplicants: '520K+',
      successRate: '71%',
      avgDisbursement: '₦1.8M',
      repaymentRate: '88%',
    },
    contactBody: 'Bank of Agriculture, Head Office Abuja',
    website: 'boanig.com',
  },
  'rec-geep': {
    id: 'rec-geep',
    name: 'GEEP TraderMoni Agri',
    body: 'Federal Government / BOI',
    category: 'Micro-Financing',
    matchScore: 78,
    funding: 'Up to ₦150,000',
    minFunding: '₦10,000',
    maxFunding: '₦150,000',
    daysLeft: 19,
    deadline: '18 Jun 2026',
    openDate: '01 May 2026',
    color: '#CA8A04',
    bg: '#FFFBEB',
    border: '#FDE68A',
    status: 'Open',
    overview:
      'GEEP TraderMoni Agri is a micro-financing arm of the Government Enterprise and Empowerment Programme specifically targeting rural agricultural traders and small-scale farmers. It offers quick-disbursement, interest-free funding with a streamlined digital application process.',
    eligibilityCriteria: [
      {
        met: true,
        label: 'Nigerian citizen with BVN',
        description: 'Bank Verification Number mandatory',
      },
      {
        met: true,
        label: 'Rural or peri-urban farmer/trader',
        description: 'Must operate in rural or semi-urban area',
      },
      {
        met: true,
        label: 'Annual income below ₦500,000',
        description: 'Targeted at low-income agricultural households',
      },
      {
        met: false,
        label: 'Market association membership',
        description: 'Membership in recognized traders/farmers association',
      },
      {
        met: true,
        label: 'No previous GEEP default',
        description: 'Clean record across all GEEP schemes',
      },
    ],
    fundingTiers: [
      {
        tier: 'Starter',
        amount: '₦10,000 – ₦30,000',
        description: 'First-time beneficiaries',
        color: '#CA8A04',
      },
      {
        tier: 'Growth',
        amount: '₦30,000 – ₦80,000',
        description: 'Returning beneficiaries with strong performance',
        color: '#B45309',
      },
      {
        tier: 'Advanced',
        amount: '₦80,000 – ₦150,000',
        description: 'Established micro-farmers with 2+ cycles',
        color: '#92400E',
      },
    ],
    timeline: [
      {
        phase: 'Application Window',
        date: '01 May – 18 Jun 2026',
        status: 'active',
        description: 'Apply via USSD *737*50# or GEEP app',
      },
      {
        phase: 'BVN Verification',
        date: '19 Jun – 25 Jun 2026',
        status: 'upcoming',
        description: 'Automated BVN and eligibility check',
      },
      {
        phase: 'Approval',
        date: '26 Jun – 30 Jun 2026',
        status: 'upcoming',
        description: 'Instant approval for qualifying applicants',
      },
      {
        phase: 'Disbursement',
        date: '05 Jul 2026',
        status: 'upcoming',
        description: 'Funds sent to linked bank account within 48 hours',
      },
    ],
    requirements: [
      { icon: 'id', label: "National ID / Voter's Card", required: true },
      { icon: 'bvn', label: 'BVN Verification', required: true },
      { icon: 'photo', label: 'Passport Photograph', required: true },
      { icon: 'coop', label: 'Association Membership Letter', required: true },
      { icon: 'bank', label: 'Bank Account Details', required: true },
    ],
    stats: {
      totalApplicants: '5.2M+',
      successRate: '85%',
      avgDisbursement: '₦42,000',
      repaymentRate: '79%',
    },
    contactBody: 'GEEP Secretariat / BOI',
    website: 'geep.gov.ng',
  },
  'rec-acgsf': {
    id: 'rec-acgsf',
    name: 'CBN ACGSF Collateral-Free',
    body: 'Central Bank of Nigeria',
    category: 'Credit Guarantee',
    matchScore: 94,
    funding: 'Up to ₦100,000',
    minFunding: '₦10,000',
    maxFunding: '₦100,000',
    daysLeft: 55,
    deadline: '24 Jul 2026',
    openDate: '01 Apr 2026',
    color: '#166534',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    status: 'Open',
    overview:
      'The Agricultural Credit Guarantee Scheme Fund (ACGSF) is a CBN initiative that provides guarantees to banks lending to agricultural sector operators. The Collateral-Free variant removes the traditional collateral requirement, making it accessible to smallholder farmers who lack formal land titles.',
    eligibilityCriteria: [
      {
        met: true,
        label: 'Nigerian citizen engaged in agriculture',
        description: 'Primary agricultural production or processing',
      },
      {
        met: true,
        label: 'Valid NIN and BVN',
        description: 'Both required for identity and credit verification',
      },
      {
        met: true,
        label: 'Farm registration certificate',
        description: 'State or LGA-level farm registration',
      },
      {
        met: true,
        label: 'Clean credit bureau record',
        description: 'No outstanding default on CRMS',
      },
      {
        met: true,
        label: 'Viable agricultural project plan',
        description: 'Simple project description with expected output',
      },
      {
        met: true,
        label: 'Bank account with participating bank',
        description: 'Account with any CBN-approved participating bank',
      },
    ],
    fundingTiers: [
      {
        tier: 'Micro Guarantee',
        amount: '₦10,000 – ₦30,000',
        description: 'Basic input and seed purchase',
        color: '#166534',
      },
      {
        tier: 'Small Guarantee',
        amount: '₦30,000 – ₦70,000',
        description: 'Equipment and expanded planting',
        color: '#15803D',
      },
      {
        tier: 'Standard Guarantee',
        amount: '₦70,000 – ₦100,000',
        description: 'Full-season production financing',
        color: '#16A34A',
      },
    ],
    timeline: [
      {
        phase: 'Application Window',
        date: '01 Apr – 24 Jul 2026',
        status: 'active',
        description: 'Apply at any participating bank branch',
      },
      {
        phase: 'Bank Processing',
        date: 'Within 5 business days',
        status: 'upcoming',
        description: 'Bank reviews application and forwards to CBN',
      },
      {
        phase: 'CBN Guarantee Issuance',
        date: 'Within 10 business days',
        status: 'upcoming',
        description: 'CBN issues guarantee certificate to bank',
      },
      {
        phase: 'Funding Disbursement',
        date: 'Within 3 days of guarantee',
        status: 'upcoming',
        description: "Bank disburses funds to farmer's account",
      },
      {
        phase: 'Repayment',
        date: 'Harvest-cycle aligned',
        status: 'upcoming',
        description: 'Repayment schedule aligned with crop harvest',
      },
    ],
    requirements: [
      { icon: 'id', label: 'National ID / NIN Slip', required: true },
      { icon: 'bvn', label: 'BVN Verification', required: true },
      { icon: 'farm', label: 'Farm Registration Certificate', required: true },
      { icon: 'plan', label: 'Agricultural Project Description', required: true },
      { icon: 'photo', label: 'Passport Photograph', required: true },
      { icon: 'bank', label: 'Bank Statement (3 months)', required: false },
    ],
    stats: {
      totalApplicants: '3.1M+',
      successRate: '82%',
      avgDisbursement: '₦58,000',
      repaymentRate: '93%',
    },
    contactBody: 'CBN Agricultural Credit Department',
    website: 'cbn.gov.ng/acgsf',
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface EligibilityItem {
  met: boolean;
  label: string;
  description: string;
}

interface FundingTier {
  tier: string;
  amount: string;
  description: string;
  color: string;
}

interface TimelinePhase {
  phase: string;
  date: string;
  status: 'active' | 'upcoming' | 'completed';
  description: string;
}

interface Requirement {
  icon: string;
  label: string;
  required: boolean;
}

interface GrantDetail {
  id: string;
  name: string;
  body: string;
  category: string;
  matchScore: number;
  funding: string;
  minFunding: string;
  maxFunding: string;
  daysLeft: number;
  deadline: string;
  openDate: string;
  color: string;
  bg: string;
  border: string;
  status: string;
  overview: string;
  eligibilityCriteria: EligibilityItem[];
  fundingTiers: FundingTier[];
  timeline: TimelinePhase[];
  requirements: Requirement[];
  stats: {
    totalApplicants: string;
    successRate: string;
    avgDisbursement: string;
    repaymentRate: string;
  };
  contactBody: string;
  website: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {icon}
      </div>
      <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
        {title}
      </h2>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-4 rounded-2xl border"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </span>
      </div>
      <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GrantDetailPage({ params }: { params: { id: string } }) {
  const grant = grantsData[params.id];
  const [activeTab, setActiveTab] = useState<
    'overview' | 'eligibility' | 'funding' | 'timeline' | 'requirements'
  >('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'funding', label: 'Funding Tiers' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'requirements', label: 'Requirements' },
  ] as const;

  if (!grant) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <AlertCircle size={48} style={{ color: 'var(--muted-foreground)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          Grant not found
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const metCount = grant.eligibilityCriteria.filter((e) => e.met).length;
  const totalCount = grant.eligibilityCriteria.length;
  const eligibilityPct = Math.round((metCount / totalCount) * 100);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b px-4 sm:px-6 h-14 flex items-center gap-3"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <ChevronRight size={14} style={{ color: 'var(--border)' }} />
        <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
          {grant.name}
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Hero card */}
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{ backgroundColor: grant.bg, borderColor: grant.border }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Match badge */}
            <div
              className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: 'var(--card)' }}
            >
              <p
                className="text-2xl font-extrabold tabular-nums leading-none"
                style={{ color: grant.color }}
              >
                {grant.matchScore}%
              </p>
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                match
              </p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: grant.color, color: 'white' }}
                >
                  {grant.category}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                >
                  {grant.status}
                </span>
                {grant.daysLeft <= 14 && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                  >
                    <Clock size={10} />
                    {grant.daysLeft} days left
                  </span>
                )}
              </div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                {grant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Building2 size={14} />
                  {grant.body}
                </span>
                <span
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: grant.color }}
                >
                  <Banknote size={14} />
                  {grant.funding}
                </span>
                <span
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Calendar size={14} />
                  Deadline: {grant.deadline}
                </span>
                <span
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Globe size={14} />
                  {grant.website}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() =>
                  toast.success(`Starting application for ${grant.name}`, {
                    description: 'AI agents will begin discovery and eligibility analysis',
                  })
                }
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
                style={{ backgroundColor: grant.color, color: 'white' }}
              >
                <Zap size={15} />
                Apply Now
              </button>
              <button
                onClick={() => toast.info('Downloading grant brief…')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95"
                style={{
                  borderColor: grant.border,
                  color: grant.color,
                  backgroundColor: 'var(--card)',
                }}
              >
                <Download size={14} />
                Download Brief
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Applicants"
            value={grant.stats.totalApplicants}
            icon={<Users size={14} style={{ color: grant.color }} />}
          />
          <StatCard
            label="Success Rate"
            value={grant.stats.successRate}
            icon={<TrendingUp size={14} style={{ color: '#059669' }} />}
          />
          <StatCard
            label="Avg. Disbursement"
            value={grant.stats.avgDisbursement}
            icon={<Banknote size={14} style={{ color: '#CA8A04' }} />}
          />
          <StatCard
            label="Performance Rate"
            value={grant.stats.repaymentRate}
            icon={<Shield size={14} style={{ color: '#7C3AED' }} />}
          />
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl border overflow-x-auto"
          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5">
              <SectionHeader
                icon={<BookOpen size={16} style={{ color: 'var(--primary)' }} />}
                title="Grant Overview"
              />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {grant.overview}
              </p>
              {/* Quick eligibility snapshot */}
              <div
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
              >
                <div className="flex flex-col items-center gap-1">
                  <p
                    className="text-2xl font-extrabold tabular-nums"
                    style={{ color: eligibilityPct >= 80 ? '#166534' : '#D97706' }}
                  >
                    {eligibilityPct}%
                  </p>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Eligible
                  </p>
                </div>
                <div className="flex-1">
                  <div className="progress-track mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${eligibilityPct}%`,
                        backgroundColor: eligibilityPct >= 80 ? '#166534' : '#D97706',
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    You meet <strong>{metCount}</strong> of <strong>{totalCount}</strong>{' '}
                    eligibility criteria
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('eligibility')}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'var(--primary)' }}
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Eligibility */}
          {activeTab === 'eligibility' && (
            <div className="flex flex-col gap-4">
              <SectionHeader
                icon={<CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />}
                title="Eligibility Criteria"
              />
              <div className="flex flex-col gap-3">
                {grant.eligibilityCriteria.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{
                      borderColor: item.met ? '#BBF7D0' : '#FDE68A',
                      backgroundColor: item.met ? '#F0FDF4' : '#FFFBEB',
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {item.met ? (
                        <CheckCircle2 size={18} style={{ color: '#166534' }} />
                      ) : (
                        <AlertCircle size={18} style={{ color: '#D97706' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {item.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={
                        item.met
                          ? { backgroundColor: '#DCFCE7', color: '#166534' }
                          : { backgroundColor: '#FEF3C7', color: '#92400E' }
                      }
                    >
                      {item.met ? 'Met' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funding Tiers */}
          {activeTab === 'funding' && (
            <div className="flex flex-col gap-4">
              <SectionHeader
                icon={<Banknote size={16} style={{ color: 'var(--primary)' }} />}
                title="Funding Tiers"
              />
              <div className="flex flex-col gap-4">
                {grant.fundingTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 rounded-2xl border"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                      style={{ backgroundColor: tier.color }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold mb-0.5"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {tier.tier}
                      </p>
                      <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        {tier.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-base font-extrabold tabular-nums"
                        style={{ color: tier.color }}
                      >
                        {tier.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-4">
              <SectionHeader
                icon={<Calendar size={16} style={{ color: 'var(--primary)' }} />}
                title="Application Timeline"
              />
              <div className="flex flex-col gap-0">
                {grant.timeline.map((phase, idx) => (
                  <div key={idx} className="flex gap-4">
                    {/* Connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-xs font-bold"
                        style={
                          phase.status === 'active'
                            ? {
                                backgroundColor: grant.color,
                                borderColor: grant.color,
                                color: 'white',
                              }
                            : phase.status === 'completed'
                              ? {
                                  backgroundColor: '#DCFCE7',
                                  borderColor: '#BBF7D0',
                                  color: '#166534',
                                }
                              : {
                                  backgroundColor: 'var(--muted)',
                                  borderColor: 'var(--border)',
                                  color: 'var(--muted-foreground)',
                                }
                        }
                      >
                        {phase.status === 'completed' ? '✓' : idx + 1}
                      </div>
                      {idx < grant.timeline.length - 1 && (
                        <div
                          className="w-0.5 flex-1 my-1"
                          style={{ backgroundColor: 'var(--border)', minHeight: '24px' }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                          {phase.phase}
                        </p>
                        {phase.status === 'active' && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold mb-1" style={{ color: grant.color }}>
                        {phase.date}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {activeTab === 'requirements' && (
            <div className="flex flex-col gap-4">
              <SectionHeader
                icon={<FileText size={16} style={{ color: 'var(--primary)' }} />}
                title="Application Requirements"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grant.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{
                      borderColor: req.required ? 'var(--border)' : '#E0E7FF',
                      backgroundColor: req.required ? 'var(--muted)' : '#EEF2FF',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: req.required ? grant.color : '#818CF8',
                        color: 'white',
                      }}
                    >
                      <FileText size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {req.label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {req.required ? 'Required' : 'Optional'}
                      </p>
                    </div>
                    {req.required ? (
                      <CheckCircle2 size={16} style={{ color: '#166534', flexShrink: 0 }} />
                    ) : (
                      <span
                        className="text-xs font-medium flex-shrink-0"
                        style={{ color: '#818CF8' }}
                      >
                        Optional
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Contact info */}
              <div
                className="flex items-center gap-3 p-4 rounded-xl border mt-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
              >
                <Building2 size={16} style={{ color: 'var(--muted-foreground)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                    Administering Body
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {grant.contactBody} · {grant.website}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Ready to apply for {grant.name}?
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Our AI agents will guide you through every step of the application process.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              Back
            </Link>
            <button
              onClick={() =>
                toast.success(`Starting application for ${grant.name}`, {
                  description: 'AI agents will begin discovery and eligibility analysis',
                })
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
              style={{ backgroundColor: grant.color, color: 'white' }}
            >
              <Zap size={14} />
              Start Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
