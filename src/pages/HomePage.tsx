import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingProjectShowcase } from '../components/landing/LandingProjectShowcase';
import { LandingAIFeature } from '../components/landing/LandingAIFeature';
import { LandingHowItWorks } from '../components/landing/LandingHowItWorks';
import { LandingBOSArchitecture } from '../components/landing/LandingBOSArchitecture';
import { LandingSecurityTrust } from '../components/landing/LandingSecurityTrust';
import { LandingCTA } from '../components/landing/LandingCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Navigation with Mode Toggle Button */}
      <LandingNavbar />

      {/* Hero with Real-time Imagery and Telemetry */}
      <LandingHero />

      {/* Features Overview */}
      <LandingFeatures />

      {/* Real-time Industrial Power Deployments Showcase */}
      <LandingProjectShowcase />

      {/* AI Copilot & Insights Section */}
      <LandingAIFeature />

      {/* How It Works */}
      <LandingHowItWorks />

      {/* Interconnected Operating System Architecture */}
      <LandingBOSArchitecture />

      {/* Security & Trust */}
      <LandingSecurityTrust />

      {/* Conversion CTA */}
      <LandingCTA />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
