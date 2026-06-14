'use client';
import React, { useState } from 'react';
import { Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/AuthContext';
import PricingModal from '@/components/ui/PricingModal';

interface PlanGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function PlanGate({ children, feature = 'this feature' }: PlanGateProps) {
  const currentUser = useUser();
  const [pricingOpen, setPricingOpen] = useState(false);

  if (currentUser?.plan === 'pro') return <>{children}</>;

  return (
    <>
      <div
        className="rounded-2xl border-2 p-6 flex flex-col items-center gap-4 text-center"
        style={{ borderColor: 'var(--accent)', backgroundColor: '#FFFBEB' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Lock size={24} style={{ color: '#0F172A' }} />
        </div>

        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Pro Feature
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Upgrade to Pro to unlock {feature}
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-left w-full max-w-xs">
          {[
            'Unlimited grant matches per search',
            'Full AI proposal generation',
            'Multi-grant simultaneous submissions',
            'Priority eligibility scoring',
            'Full agent activity transparency',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--foreground)' }}>{item}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setPricingOpen(true)}
          className="w-full max-w-xs flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: '#0F172A' }}
        >
          <Sparkles size={16} />
          See Pro Plan
          <ArrowRight size={14} />
        </button>
      </div>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}
