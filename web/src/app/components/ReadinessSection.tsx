import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  { id: 'ben-1', text: 'No grant writing expertise required' },
  { id: 'ben-2', text: 'Supports all 36 Nigerian states' },
  { id: 'ben-3', text: 'Works for individuals and cooperatives' },
  { id: 'ben-4', text: 'Secure document storage — CBN compliant' },
  { id: 'ben-5', text: 'Free to start — no hidden fees' },
  { id: 'ben-6', text: 'Track every application in real time' },
];

export default function ReadinessSection() {
  return (
    <section id="about" className="py-20 lg:py-28" style={{ backgroundColor: 'var(--card)' }}>
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Readiness score visual */}
          <div className="flex justify-center">
            <div
              className="relative w-72 h-72 xl:w-80 xl:h-80 rounded-full flex items-center justify-center"
              style={{
                background: 'conic-gradient(var(--primary) 0% 91%, var(--border) 91% 100%)',
              }}
            >
              <div
                className="absolute inset-3 rounded-full flex flex-col items-center justify-center"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <p className="text-6xl font-extrabold tabular-nums" style={{ color: 'var(--primary)' }}>
                  91
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                  out of 100
                </p>
                <p
                  className="text-xs font-bold mt-1 px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
                >
                  Funding Ready
                </p>
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex flex-col gap-6">
            <span
              className="inline-block self-start px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}
            >
              AI Funding Readiness Score
            </span>

            <h2
              className="text-3xl xl:text-4xl font-extrabold tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Know Exactly How Ready You Are Before Applying
            </h2>

            <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              AgriGrant AI calculates your personal Funding Readiness Score across four dimensions.
              See where you stand, fix gaps before submission, and maximize your chances of success.
            </p>

            {/* Dimension bars */}
            <div className="flex flex-col gap-3">
              {[
                { id: 'dim-eligibility', label: 'Eligibility', score: 95, color: 'var(--primary)' },
                { id: 'dim-docs', label: 'Documentation', score: 88, color: '#0D9488' },
                { id: 'dim-proposal', label: 'Proposal Quality', score: 90, color: '#CA8A04' },
                { id: 'dim-compliance', label: 'Compliance', score: 92, color: '#2563EB' },
              ]?.map((dim) => (
                <div key={dim?.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-36 flex-shrink-0" style={{ color: 'var(--foreground)' }}>
                    {dim?.label}
                  </span>
                  <div className="flex-1 progress-track">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${dim?.score}%`, backgroundColor: dim?.color }}
                    />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-10 text-right" style={{ color: dim?.color }}>
                    {dim?.score}%
                  </span>
                </div>
              ))}
            </div>

            {/* Benefits checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {benefits?.map((b) => (
                <div key={b?.id} className="flex items-center gap-2">
                  <CheckCircle size={15} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{b?.text}</span>
                </div>
              ))}
            </div>

            <Link href="/sign-up-login-screen" className="btn-primary self-start gap-2">
              Check Your Readiness Score
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}