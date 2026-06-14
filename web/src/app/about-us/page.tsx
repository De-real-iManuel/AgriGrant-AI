'use client';
import React from 'react';
import Link from 'next/link';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import AppLogo from '@/components/ui/AppLogo';
import {
  Bot, ShieldCheck, FileText, Search, Sparkles, CheckCircle2,
  Users, ArrowRight, ArrowUpRight, Award, Compass, Heart
} from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <LandingNav />

      <main className="flex-grow pt-24">
        {/* Hero Banner Section */}
        <section className="relative overflow-hidden py-16 lg:py-24" style={{ background: 'linear-gradient(180deg, rgba(22, 101, 52, 0.08) 0%, rgba(22, 101, 52, 0.02) 100%)' }}>
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16 relative z-10">
            <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
              >
                🌱 About AgriGrant AI
              </span>
              <h1
                className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                style={{ color: 'var(--foreground)' }}
              >
                Empowering Nigerian Agriculture Through{' '}
                <span style={{ color: 'var(--primary)' }}>Intelligent</span>{' '}
                <span style={{ color: 'var(--accent)' }}>Financing</span>
              </h1>
              <p className="text-lg lg:text-xl leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Connecting smallholder farmers, cooperatives, and agribusinesses with critical funding opportunities 
                through state-of-the-art AI agents and robotic automation.
              </p>
            </div>
          </div>
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: 'var(--primary)' }} />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: 'var(--accent)' }} />
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <Compass size={24} />
                  <span className="font-bold tracking-wider uppercase text-sm">Our Mission</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight" style={{ color: 'var(--foreground)' }}>
                  Bridging the Agricultural Grant Funding Gap
                </h2>
                <p className="text-base lg:text-lg leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Agriculture remains the backbone of the Nigerian economy, employing over 35% of the population. 
                  Yet, billions of Naira in national and international agricultural grants go unclaimed every year. 
                  Farmers lose out because of complex application portals, rigid compliance rules, and lack of professional proposal-writing support.
                </p>
                <p className="text-base lg:text-lg leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  AgriGrant AI was created to solve this. We demystify the funding process by bringing advanced technology down to the roots. 
                  By translating requirements into plain English and Pidgin, analyzing compliance instantly, and automating submission, we empower every farmer to secure their future.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                  {[
                    { icon: ShieldCheck, title: '92% Accuracy', desc: 'Precise eligibility evaluations' },
                    { icon: Sparkles, title: '10 Minutes', desc: 'From onboarding to full application packages' },
                    { icon: Award, title: 'Real Impact', desc: 'Built for actual Nigerian grassroots scale' }
                  ].map((item, idx) => (
                    <div key={`stat-${idx}`} className="flex flex-col gap-2 p-4 rounded-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <item.icon size={24} style={{ color: 'var(--primary)' }} />
                      <h4 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{item.title}</h4>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column highlight block */}
              <div className="lg:col-span-5 relative">
                <div 
                  className="rounded-3xl p-8 lg:p-10 text-white flex flex-col gap-6 relative z-10 overflow-hidden"
                  style={{ background: 'linear-gradient(160deg, #14532D 0%, #166534 60%, #15803D 100%)' }}
                >
                  <Heart size={40} className="opacity-80" style={{ color: 'var(--accent)' }} />
                  <h3 className="text-2xl font-bold">Why We Care</h3>
                  <p className="text-sm leading-relaxed opacity-90">
                    "Every bag of fertilizer, every borehole, and every mechanized tractor funded changes a family's livelihood. 
                    We believe the tech sector's job is not just to build chatbots for cities, but to build tools that feed nations."
                  </p>
                  <div className="border-t border-emerald-700/60 pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold" style={{ color: 'var(--accent)' }}>
                      N
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Nwajari Emmanuel</p>
                      <p className="text-xs opacity-75">Founder, AgriGrant AI</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-3xl opacity-10 bg-amber-400 rotate-12" />
              </div>
            </div>
          </div>
        </section>

        {/* The 5-Agent Pipeline Section */}
        <section className="py-16" style={{ backgroundColor: 'var(--card)' }}>
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
            <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-16">
              <span className="font-bold tracking-wider uppercase text-sm" style={{ color: 'var(--primary)' }}>
                Powered by UiPath Agentic Automation
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold" style={{ color: 'var(--foreground)' }}>
                The Five Specialized AI Agents
              </h2>
              <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
                Our system coordinates five autonomous AI agents working in a secure, conditional BPMN pipeline to deliver your grant package.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[
                {
                  step: '01',
                  icon: Search,
                  name: 'Grant Discovery',
                  desc: 'Orchestrates live web queries to find matching federal, state, and international agricultural grants based on farm profile.'
                },
                {
                  step: '02',
                  icon: ShieldCheck,
                  name: 'Eligibility & Risk',
                  desc: 'Scores candidates (0-100) against CBN/NIRSAL rules, flagging risks like lack of cooperative letters, BVN, or CAC.'
                },
                {
                  step: '03',
                  icon: Bot,
                  name: 'Document Analysis',
                  desc: 'Extracts, validates, and cross-checks uploaded identity papers, C of O, land surveys, and farm bank statements.'
                },
                {
                  step: '04',
                  icon: FileText,
                  name: 'Proposal Generation',
                  desc: 'Generates professional, print-ready grant proposals and cover letters addressed directly to specific selection committees.'
                },
                {
                  step: '05',
                  icon: Sparkles,
                  name: 'Submission Delivery',
                  desc: 'Prepackages submission instructions and schedules automated RPA robots to help input forms into government portals.'
                }
              ].map((agent, index) => (
                <div
                  key={`agent-card-${index}`}
                  className="flex flex-col gap-4 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(22, 101, 52, 0.1)', color: 'var(--primary)' }}
                    >
                      <agent.icon size={20} />
                    </div>
                    <span className="text-xs font-bold font-mono tracking-wider" style={{ color: 'var(--accent)' }}>
                      AGENT {agent.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mt-2" style={{ color: 'var(--foreground)' }}>
                    {agent.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {agent.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-16">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
            <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-16">
              <span className="font-bold tracking-wider uppercase text-sm" style={{ color: 'var(--primary)' }}>
                Our Leadership
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold" style={{ color: 'var(--foreground)' }}>
                Meet the Innovators
              </h2>
              <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
                The team combining engineering, agricultural operations, and AI to transform grant access across Nigeria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Nwajari Emmanuel */}
              <div
                className="rounded-3xl p-8 flex flex-col sm:flex-row gap-6 items-start transition-all hover:shadow-lg"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-2xl text-white"
                  style={{ background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)' }}
                >
                  NE
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Nwajari Emmanuel</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                      Founder & Technical Lead
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    Emmanuel is a senior AI engineer specializing in agentic automation. He architected AgriGrant AI's 
                    BPMN orchestration system and supervises integration between the Next.js stack, Python services, 
                    and UiPath Cloud API gateways.
                  </p>
                  <a href="mailto:nwajariemmanuel355@gmail.com" className="text-xs font-medium inline-flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
                    nwajariemmanuel355@gmail.com <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>

              {/* Kodu Giobari */}
              <div
                className="rounded-3xl p-8 flex flex-col sm:flex-row gap-6 items-start transition-all hover:shadow-lg"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-2xl text-white"
                  style={{ background: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)' }}
                >
                  KG
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Kodu Giobari</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                      Operations Lead
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    Giobari coordinates field operations and community partnerships. He is dedicated to building 
                    alliances with farming cooperatives across Nigeria, ensuring the platform's outputs fit the 
                    actual realities of rural farms.
                  </p>
                  <a href="mailto:giobarikodu@gmail.com" className="text-xs font-medium inline-flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
                    giobarikodu@gmail.com <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
            <div
              className="rounded-3xl p-8 lg:p-12 xl:p-16 text-center flex flex-col items-center gap-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #14532D 0%, #064E3B 100%)',
                color: 'white'
              }}
            >
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight max-w-2xl">
                Ready to Find Your Agricultural Grant?
              </h2>
              <p className="text-base lg:text-lg max-w-xl opacity-90 text-emerald-100">
                It takes less than 10 minutes to input your details, check your score, and get your AI-generated submission package.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-2 relative z-10">
                <Link
                  href="/sign-up-login-screen"
                  className="btn-primary border-none shadow-lg text-base px-8 py-3.5 gap-2 hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: 'var(--accent)', color: '#166534' }}
                >
                  Start Grant Evaluation
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/"
                  className="rounded-xl border border-emerald-600/80 hover:bg-emerald-800/20 text-white font-medium text-base px-8 py-3.5 transition-colors"
                >
                  Return Home
                </Link>
              </div>

              {/* Decorative backgrounds */}
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10 bg-emerald-300 blur-2xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-10 bg-amber-300 blur-2xl" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
