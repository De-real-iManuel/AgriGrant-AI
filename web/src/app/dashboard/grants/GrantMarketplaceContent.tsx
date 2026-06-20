'use client';
import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Building2,
  Leaf,
  ExternalLink,
  Target,
  Filter,
  ArrowRight,
  Sparkles,
  Star,
  Calendar,
} from 'lucide-react';
import { usePortalResults } from '@/context/PortalResultsContext';
import { toast } from 'sonner';
import Link from 'next/link';

const GRANT_CATALOGUE = [
  // INTERNATIONAL / MULTILATERAL
  {
    id: 'usaid-agrifood',
    name: 'USAID Africa Food Security Grants',
    org: 'USAID',
    category: 'International',
    amount: '$10,000 – $500,000',
    deadline: 'Rolling basis',
    region: 'Sub-Saharan Africa',
    description:
      'Funds agricultural productivity, food security, and climate-resilient farming for smallholder farmers across Africa.',
    eligibility: ['Smallholder farmers', 'Farmer cooperatives', 'Agri-SMEs'],
    url: 'https://www.usaid.gov/food-assistance',
    featured: true,
    tags: ['crop', 'livestock', 'climate', 'women'],
  },
  {
    id: 'gates-agri',
    name: 'Bill & Melinda Gates Foundation Agri Grant',
    org: 'Gates Foundation',
    category: 'International',
    amount: '$50,000 – $2,000,000',
    deadline: 'Open cycle – quarterly reviews',
    region: 'Sub-Saharan Africa & South Asia',
    description:
      'Supports smallholder farmer productivity, digital agriculture innovation, and women economic empowerment in farming.',
    eligibility: ['Smallholder farmers', 'Women-led farms', 'AgriTech innovators'],
    url: 'https://www.gatesfoundation.org/about/committed-grants',
    featured: true,
    tags: ['smallholder', 'women', 'agritech', 'digital'],
  },
  {
    id: 'agra-transform',
    name: 'AGRA Smallholder Transformation Grant',
    org: 'Alliance for a Green Revolution in Africa (AGRA)',
    category: 'International',
    amount: '$25,000 – $200,000',
    deadline: 'Feb 28, 2025',
    region: 'Nigeria, Kenya, Ghana, Tanzania',
    description:
      'Strengthens African food systems by supporting soil health, certified seeds, and market access for smallholder farmers.',
    eligibility: ['Smallholder farmers', 'Farmer groups', 'Cooperatives'],
    url: 'https://agra.org/grants/',
    featured: true,
    tags: ['crop', 'smallholder', 'cooperative', 'soil'],
  },
  {
    id: 'worldbank-nigeria',
    name: 'World Bank Nigeria Agri-Business Program',
    org: 'World Bank Group',
    category: 'International',
    amount: '₦5M – ₦50M',
    deadline: 'Mar 31, 2025',
    region: 'Nigeria (All states)',
    description:
      'Non-repayable grants and technical assistance to strengthen Nigerian agri-value chains and improve rural livelihoods.',
    eligibility: ['SME farms', 'Agro-processors', 'Youth farmers (18–35)'],
    url: 'https://www.worldbank.org/en/country/nigeria',
    featured: false,
    tags: ['agroprocessing', 'youth', 'value-chain'],
  },
  {
    id: 'ifad-rural',
    name: 'IFAD Rural Entrepreneurship Grant',
    org: 'International Fund for Agricultural Development (IFAD)',
    category: 'International',
    amount: '$5,000 – $100,000',
    deadline: 'Rolling basis',
    region: 'West Africa including Nigeria',
    description:
      'Supports rural entrepreneurs, women farmers, and youth in building sustainable agricultural enterprises.',
    eligibility: ['Women farmers', 'Youth (18–35)', 'Rural entrepreneurs'],
    url: 'https://www.ifad.org/en/grants',
    featured: false,
    tags: ['women', 'youth', 'livestock', 'mixed'],
  },
  {
    id: 'fao-climate',
    name: 'FAO Climate Smart Agriculture Fund',
    org: 'Food & Agriculture Organization (FAO)',
    category: 'International',
    amount: '$20,000 – $300,000',
    deadline: 'Apr 30, 2025',
    region: 'Africa-wide',
    description:
      'Supports farmers adopting climate-resilient practices including drought-resistant crops, irrigation, and soil conservation.',
    eligibility: ['All farm types', 'Farmer cooperatives', 'NGO-supported farms'],
    url: 'https://www.fao.org/climate-smart-agriculture/',
    featured: false,
    tags: ['climate', 'crop', 'irrigation', 'cooperative'],
  },
  // NGO GRANTS
  {
    id: 'heifer-nigeria',
    name: 'Heifer International Nigeria Livestock Grant',
    org: 'Heifer International',
    category: 'NGO',
    amount: '$1,000 – $15,000',
    deadline: 'Rolling basis',
    region: 'Nigeria',
    description:
      'Provides livestock, training, and business support to help families achieve a living income through animal husbandry.',
    eligibility: ['Livestock farmers', 'Poultry farmers', 'Women-led farms'],
    url: 'https://www.heifer.org/',
    featured: false,
    tags: ['livestock', 'poultry', 'women', 'training'],
  },
  {
    id: 'technoserve-agri',
    name: 'TechnoServe Agricultural Enterprise Grant',
    org: 'TechnoServe',
    category: 'NGO',
    amount: '$5,000 – $50,000',
    deadline: 'May 15, 2025',
    region: 'Nigeria, Ghana, Ethiopia',
    description:
      'Business mentorship and grant funding for farmers transforming their agricultural operations into viable enterprises.',
    eligibility: ['Agri-SMEs', 'Cooperatives', 'Youth entrepreneurs'],
    url: 'https://www.technoserve.org/our-work/agriculture/',
    featured: false,
    tags: ['agritech', 'cooperative', 'youth', 'agroprocessing'],
  },
  {
    id: 'crs-food',
    name: 'Catholic Relief Services Food Security Grant',
    org: 'Catholic Relief Services (CRS)',
    category: 'NGO',
    amount: '₦500K – ₦5M',
    deadline: 'Jun 30, 2025',
    region: 'Northern Nigeria',
    description:
      'Community-based grants for vulnerable rural farmers, with focus on food security and livelihoods.',
    eligibility: ['Smallholder farmers', 'Displaced farmer communities', 'Women groups'],
    url: 'https://www.crs.org/',
    featured: false,
    tags: ['crop', 'smallholder', 'women', 'climate'],
  },
  {
    id: 'oxfam-nigeria',
    name: 'Oxfam Nigeria Women in Agriculture Grant',
    org: 'Oxfam International',
    category: 'NGO',
    amount: '$3,000 – $30,000',
    deadline: 'Jul 31, 2025',
    region: 'Nigeria',
    description:
      'Empowers women farmers with grants, market linkages, and advocacy support to close the gender gap in agriculture.',
    eligibility: ['Women farmers only', 'Women cooperatives'],
    url: 'https://www.oxfam.org/en/nigeria',
    featured: true,
    tags: ['women', 'crop', 'cooperative'],
  },
  // NIGERIAN GOVERNMENT
  {
    id: 'fmard-agro',
    name: 'FMARD Agro-Processing Grant',
    org: 'Federal Ministry of Agriculture & Rural Development',
    category: 'Nigerian Government',
    amount: '₦2M – ₦20M',
    deadline: 'Mar 15, 2025',
    region: 'All states (Nigeria)',
    description:
      'Non-repayable grants for small and medium agro-processors to acquire equipment, upgrade facilities, and access markets.',
    eligibility: ['Agro-processors', 'SME farms with CAC registration', 'Cooperatives'],
    url: 'https://fmard.gov.ng/',
    featured: true,
    tags: ['agroprocessing', 'cooperative', 'cac'],
  },
  {
    id: 'nirsal-agsmeis',
    name: 'NIRSAL AGSMEIS Equity Grant',
    org: 'NIRSAL (CBN-backed)',
    category: 'Nigerian Government',
    amount: '₦1M – ₦10M',
    deadline: 'Rolling basis',
    region: 'Nigeria',
    description:
      'Non-interest equity and grant support for agricultural small businesses under the CBN AGSMEIS programme.',
    eligibility: ['All farm types', 'BVN required', 'Clean CRMS credit history'],
    url: 'https://nirsal.com/',
    featured: false,
    tags: ['crop', 'livestock', 'poultry', 'bvn'],
  },
  {
    id: 'youth-agribiz',
    name: 'Youth Agribusiness Grant (YAGEP)',
    org: 'CBN / State Governments',
    category: 'Nigerian Government',
    amount: '₦500K – ₦3M',
    deadline: 'Rolling – state-dependent',
    region: 'Nigeria (by state)',
    description:
      'Direct grant and training for Nigerian youth (18–35) who want to start or scale agricultural businesses.',
    eligibility: ['Youth 18–35 years', 'Nigerian citizen', 'No formal employment'],
    url: 'https://www.cbn.gov.ng/',
    featured: false,
    tags: ['youth', 'crop', 'poultry', 'livestock', 'mixed'],
  },
  {
    id: 'boa-grant',
    name: 'Bank of Agriculture Equity Grant',
    org: 'Bank of Agriculture (BOA)',
    category: 'Nigerian Government',
    amount: '₦300K – ₦5M',
    deadline: 'Rolling basis',
    region: 'Nigeria',
    description:
      'Non-repayable equity grants for smallholder and medium-scale farmers to purchase inputs and equipment.',
    eligibility: ['Smallholder farmers', 'Medium farms', 'Cooperatives'],
    url: 'https://www.boanig.com/',
    featured: false,
    tags: ['crop', 'livestock', 'smallholder', 'cooperative'],
  },
];

const CATEGORIES = ['All', 'International', 'NGO', 'Nigerian Government'];
const TAGS = [
  'crop',
  'livestock',
  'poultry',
  'women',
  'youth',
  'smallholder',
  'cooperative',
  'agroprocessing',
  'agritech',
  'climate',
];

const categoryStyles: Record<string, { bg: string; color: string; Icon: React.ElementType }> = {
  International: { bg: 'var(--tint-blue)', color: '#60A5FA', Icon: Globe },
  NGO: { bg: 'var(--tint-purple)', color: '#A78BFA', Icon: Building2 },
  'Nigerian Government': { bg: 'var(--tint-green)', color: 'var(--primary)', Icon: Leaf },
};

function GrantCard({
  grant,
  onApply,
}: {
  grant: (typeof GRANT_CATALOGUE)[0];
  onApply: (name: string, url: string) => void;
}) {
  const style = categoryStyles[grant.category] ?? categoryStyles['International'];
  const CatIcon = style.Icon;

  return (
    <div className="card-elevated flex flex-col gap-4 hover:shadow-md transition-all duration-200 relative overflow-hidden">
      {grant.featured && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, var(--primary), #22C55E)' }}
        />
      )}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex gap-3 items-start min-w-0 flex-1">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: style.bg }}>
            <CatIcon size={18} style={{ color: style.color }} />
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-sm leading-snug"
              style={{ color: 'var(--foreground)' }}
            >
              {grant.name}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
              {grant.org}
            </p>
          </div>
        </div>
        {grant.featured && (
          <span
            className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: 'var(--tint-amber)', color: 'var(--accent)' }}
          >
            <Star size={9} /> Featured
          </span>
        )}
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {grant.description}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Funding
          </p>
          <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
            {grant.amount}
          </p>
        </div>
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Deadline
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
            {grant.deadline}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {grant.eligibility.map((e) => (
          <span
            key={e}
            className="px-2 py-0.5 rounded-full text-[11px]"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            {e}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <a
          href={grant.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-muted"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <ExternalLink size={13} /> Official Site
        </a>
        <button
          onClick={() => onApply(grant.name, grant.url)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Apply Now <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function GrantMarketplaceContent() {
  const { latestResult } = usePortalResults();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTag, setActiveTag] = useState('');
  const [view, setView] = useState<'ai' | 'catalogue'>('ai');

  const aiGrants = latestResult?.matchedGrants ?? [];

  const filtered = useMemo(() => {
    let g = GRANT_CATALOGUE;
    if (category !== 'All') g = g.filter((x) => x.category === category);
    if (activeTag) g = g.filter((x) => x.tags.includes(activeTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      g = g.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.org.toLowerCase().includes(q) ||
          x.description.toLowerCase().includes(q)
      );
    }
    return [...g].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [category, activeTag, search]);

  const handleApply = (name: string, url: string) => {
    toast.success(`Opening application for ${name}`, {
      description: 'You will be redirected to the official grantor portal.',
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-7">
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--muted)' }}>
        <button
          onClick={() => setView('ai')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: view === 'ai' ? 'var(--card)' : 'transparent',
            color: view === 'ai' ? 'var(--primary)' : 'var(--muted-foreground)',
            boxShadow: view === 'ai' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} /> AI-Matched ({aiGrants.length})
          </span>
        </button>
        <button
          onClick={() => setView('catalogue')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: view === 'catalogue' ? 'var(--card)' : 'transparent',
            color: view === 'catalogue' ? 'var(--primary)' : 'var(--muted-foreground)',
            boxShadow: view === 'catalogue' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Globe size={13} /> Full Catalogue ({GRANT_CATALOGUE.length})
          </span>
        </button>
      </div>

      {/* ── AI-Matched ──────────────────────────────────────────────────── */}
      {view === 'ai' &&
        (aiGrants.length === 0 ? (
          <div className="card-elevated py-16 flex flex-col items-center gap-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--tint-green)' }}
            >
              <Sparkles size={26} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                No AI-matched grants yet
              </p>
              <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--muted-foreground)' }}>
                Complete your Farmer Profile so our AI can discover the best free grants for your
                farm, location, and goals.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/farmer-portal" className="btn-primary">
                Start Farm Profile
              </Link>
              <button onClick={() => setView('catalogue')} className="btn-secondary">
                Browse Full Catalogue
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {aiGrants.length} grants matched to your profile
              </p>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: 'var(--tint-green)', color: 'var(--primary)' }}
              >
                100% Free Grants — Verified Programmes
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {aiGrants.map((grant, i) => {
                const scoreColor =
                  grant.matchScore >= 90
                    ? 'var(--primary)'
                    : grant.matchScore >= 80
                      ? '#A78BFA'
                      : 'var(--accent)';
                const scoreBg =
                  grant.matchScore >= 90
                    ? 'var(--tint-green)'
                    : grant.matchScore >= 80
                      ? 'var(--tint-purple)'
                      : 'var(--tint-amber)';
                return (
                  <div
                    key={i}
                    className="card-elevated flex flex-col gap-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                          {grant.grantName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          {grant.grantingOrganization}
                        </p>
                      </div>
                      <div
                        className="flex flex-col items-center px-2.5 py-1.5 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: scoreBg }}
                      >
                        <span
                          className="text-sm font-bold leading-none"
                          style={{ color: scoreColor }}
                        >
                          {grant.matchScore}%
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                          match
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {grant.matchReason}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          Funding
                        </p>
                        <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                          {grant.fundingAmountRange}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          Deadline
                        </p>
                        <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                          {grant.applicationDeadline}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex gap-2 pt-3 border-t mt-auto"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {grant.applicationUrl && (
                        <a
                          href={grant.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border hover:bg-muted transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                        >
                          <ExternalLink size={12} /> Details
                        </a>
                      )}
                      <button
                        onClick={() => handleApply(grant.grantName, grant.applicationUrl)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        Apply <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {/* ── Full Catalogue ──────────────────────────────────────────────── */}
      {view === 'catalogue' && (
        <div className="space-y-5">
          {/* Search + category filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted-foreground)' }}
              />
              <input
                type="text"
                placeholder="Search grants or organizations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: category === c ? 'var(--primary)' : 'var(--card)',
                    color: category === c ? 'white' : 'var(--muted-foreground)',
                    borderColor: category === c ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tag chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Filter size={12} /> Filter by:
            </span>
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? '' : t)}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-all border"
                style={{
                  backgroundColor: activeTag === t ? 'var(--tint-green)' : 'var(--card)',
                  color: activeTag === t ? 'var(--primary)' : 'var(--muted-foreground)',
                  borderColor: activeTag === t ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Showing <strong style={{ color: 'var(--foreground)' }}>{filtered.length}</strong>{' '}
              grants
            </p>
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
              style={{ backgroundColor: 'var(--tint-green)', color: 'var(--primary)' }}
            >
              Grants Only — Verified
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="card-elevated py-10 text-center">
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                No grants match your search
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Try different keywords or clear the filters
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setActiveTag('');
                }}
                className="btn-secondary mt-4 text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((grant) => (
                <GrantCard key={grant.id} grant={grant} onApply={handleApply} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
