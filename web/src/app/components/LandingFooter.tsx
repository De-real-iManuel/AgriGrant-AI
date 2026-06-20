import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, Phone, MapPin } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

const footerLinks = {
  Platform: [
    { id: 'fl-grants', label: 'Grant Marketplace', href: '#grants' },
    { id: 'fl-ai', label: 'AI Agents', href: '#features' },
    { id: 'fl-readiness', label: 'Readiness Score', href: '#about' },
    { id: 'fl-coop', label: 'Cooperative Tools', href: '#features' },
  ],
  'Grant Programs': [
    { id: 'fl-cbn', label: 'CBN ACGSF', href: '#grants' },
    { id: 'fl-nirsal', label: 'NIRSAL', href: '#grants' },
    { id: 'fl-anchor', label: 'Anchor Borrowers', href: '#grants' },
    { id: 'fl-agsmeis', label: 'AGSMEIS', href: '#grants' },
    { id: 'fl-fao', label: 'FAO Nigeria', href: '#grants' },
    { id: 'fl-farmermoni', label: 'FarmerMoni', href: '#grants' },
  ],
  Company: [
    { id: 'fl-about', label: 'About AgriGrant', href: '/about-us' },
    { id: 'fl-contact', label: 'Contact Us', href: '#contact' },
    { id: 'fl-terms', label: 'Terms of Service', href: '/terms-of-service' },
    { id: 'fl-privacy', label: 'Privacy Policy', href: '/privacy-policy' },
    { id: 'fl-cookies', label: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function LandingFooter() {
  return (
    <footer
      id="contact"
      className="pt-16 pb-8"
      style={{ backgroundColor: '#0F172A', color: '#CBD5E1' }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 2xl:px-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10 pb-12 border-b border-slate-700">
          {/* Brand column */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <AppLogo size={36} />
              <span className="font-bold text-lg text-white">
                AgriGrant <span style={{ color: '#EAB308' }}>AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#94A3B8' }}>
              Empowering Nigerian farmers with intelligent grant discovery and AI-powered
              application management. Built for smallholders, cooperatives, and agribusinesses.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
                <Mail size={14} style={{ color: '#22C55E' }} />
                info@agrigrant.xyz
              </div>
              <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
                <Phone size={14} style={{ color: '#22C55E' }} />
                +234 705 525 0587
              </div>
              <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
                <MapPin size={14} style={{ color: '#22C55E' }} />
                10b Agip Road, Port Harcourt, Rivers State
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { id: 'social-twitter', Icon: TwitterIcon, label: 'Twitter' },
                { id: 'social-linkedin', Icon: LinkedinIcon, label: 'LinkedIn' },
                { id: 'social-facebook', Icon: FacebookIcon, label: 'Facebook' },
              ]?.map(({ id, Icon, label }) => (
                <button
                  key={id}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
                  aria-label={label}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks)?.map(([section, links]) => (
            <div key={`footer-section-${section}`} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-white">
                {section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links?.map((link) => (
                  <li key={link?.id}>
                    <Link
                      href={link?.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: '#94A3B8' }}
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#64748B' }}>
            © 2026 AgriGrant AI. All rights reserved. <b>Built By REM Labs</b> for Nigerian
            Agriculture.
          </p>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
            >
              🌾 Proudly Nigerian
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
            >
              CBN Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
