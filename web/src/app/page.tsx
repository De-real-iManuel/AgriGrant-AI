// Landing Page — entry point
import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import StatsBar from './components/StatsBar';
import FeaturesSection from './components/FeaturesSection';
import GrantsShowcase from './components/GrantsShowcase';
import ReadinessSection from './components/ReadinessSection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <LandingNav />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <GrantsShowcase />
        <ReadinessSection />
      </main>
      <LandingFooter />
    </div>
  );
}