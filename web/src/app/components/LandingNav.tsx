'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Farmer Portal', href: '/farmer-portal' },
  { label: 'Grants', href: '#grants' },
  { label: 'Solutions', href: '#features' },
  { label: 'About', href: '#about' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(var(--background-rgb, 248,250,252),0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        background: scrolled ? 'var(--card)' : 'transparent',
      }}
    >
      <nav className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size={36} />
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--primary)' }}>
            AgriGrant <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks?.map((link) => (
            <Link key={`nav-${link?.label}`} href={link?.href} className="nav-link">
              {link?.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/sign-up-login-screen" className="btn-secondary text-sm px-4 py-2">
            Login
          </Link>
          <Link href="/farmer-portal" className="btn-primary text-sm px-4 py-2">
            Find My Grants
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--foreground)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-2"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {navLinks?.map((link) => (
            <Link
              key={`mobile-nav-${link?.label}`}
              href={link?.href}
              className="nav-link py-2.5"
              onClick={() => setMobileOpen(false)}
            >
              {link?.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link href="/sign-up-login-screen" className="btn-secondary justify-center">
              Login
            </Link>
            <Link href="/farmer-portal" className="btn-primary justify-center">
              Find My Grants
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}