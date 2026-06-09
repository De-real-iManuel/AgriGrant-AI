'use client';
import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Bot, Clock, DollarSign } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const stats = [
  {
    id: 'stat-match',
    icon: TrendingUp,
    value: '92%',
    label: 'Average Match Accuracy',
    description: 'AI eligibility scoring across all grant programs',
    color: 'var(--primary)',
    bg: '#DCFCE7',
  },
  {
    id: 'stat-agents',
    icon: Bot,
    value: '5',
    label: 'AI Agents Working Together',
    description: 'Discovery, Eligibility, Document, Proposal, Submit',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    id: 'stat-time',
    icon: Clock,
    value: 'Days',
    label: 'Instead of Weeks',
    description: 'Average application preparation time reduction',
    color: '#CA8A04',
    bg: '#FEF9C3',
  },
  {
    id: 'stat-funding',
    icon: DollarSign,
    value: '₦Billions',
    label: 'Funding Opportunities Tracked',
    description: 'Across CBN, NIRSAL, FAO, AGSMEIS programmes',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
];

export default function StatsBar() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-14 lg:py-20"
      style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats?.map((stat, idx) => {
            const Icon = stat?.icon;
            return (
              <div
                key={stat?.id}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${idx * 100}ms`,
                  backgroundColor: stat?.bg,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <Icon size={22} style={{ color: stat?.color }} />
                </div>
                <div>
                  <p
                    className="text-3xl xl:text-4xl font-extrabold tabular-nums"
                    style={{ color: stat?.color }}
                  >
                    {stat?.value}
                  </p>
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--foreground)' }}>
                    {stat?.label}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {stat?.description}
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