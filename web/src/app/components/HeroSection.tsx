import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import AnimatedWorkflow from './AnimatedWorkflow';

export default function HeroSection() {
  return (
    <section className="gradient-hero pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Headline + CTA */}
          <div className="flex flex-col gap-6">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 self-start">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
              >
                🌾 AI-Powered Grant Platform
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Funding Intelligence{' '}
              <span style={{ color: 'var(--primary)' }}>for Modern</span>{' '}
              <span style={{ color: 'var(--accent)' }}>Agriculture</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--muted-foreground)' }}>
              Find grants, assess eligibility, prepare proposals, and submit applications
              with AI-powered assistance. Built exclusively for Nigerian farmers, cooperatives,
              and agribusinesses.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--secondary)' }} />
                Trusted by Farmers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--secondary)' }} />
                Cooperatives
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--secondary)' }} />
                Ministries
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/farmer-portal" className="btn-primary text-base px-7 py-3.5 gap-2">
                Find My Grants
                <ArrowRight size={18} />
              </Link>
              <button className="btn-secondary text-base px-7 py-3.5 gap-2">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#DCFCE7' }}
                >
                  <Play size={14} style={{ color: 'var(--primary)' }} />
                </span>
                Watch Demo
              </button>
            </div>

            {/* Social proof strip */}
            <div
              className="flex items-center gap-3 pt-2 pb-1 px-4 rounded-xl self-start"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex -space-x-2">
                {['#166534', '#22C55E', '#EAB308', '#059669']?.map((color, i) => (
                  <div
                    key={`avatar-${i}`}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: color, borderColor: 'var(--card)' }}
                  >
                    {['E', 'A', 'K', 'F']?.[i]}
                  </div>
                ))}
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>2,400+</span> farmers
                already applying
              </div>
            </div>
          </div>

          {/* Right — Animated Workflow */}
          <div className="flex justify-center lg:justify-end">
            <AnimatedWorkflow />
          </div>
        </div>
      </div>
    </section>
  );
}