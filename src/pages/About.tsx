import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Globe, 
  ArrowRight
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { SEO_CONFIG } from '../config/seo';
import { TrustpilotProofSection } from '../components/common/TrustpilotProofSection';

export const About: React.FC = () => {
  const values = [
    {
      icon: Zap,
      title: 'Frictionless Convenience',
      desc: 'We eliminate physical logistics and lengthy checkout queues, delivering authenticated digital codes to inboxes in under a minute.',
    },
    {
      icon: ShieldCheck,
      title: 'Uncompromised Security',
      desc: 'Every transaction is safeguarded by 256-bit encryption and real-time fraud mitigation to ensure codes are genuine and secure.',
    },
    {
      icon: Heart,
      title: 'Customer-First Transparency',
      desc: 'Zero platform markups, no hidden inactivity penalties, and crystal-clear regional compatibility indicators on every card.',
    },
    {
      icon: Globe,
      title: 'Global Brand Access',
      desc: 'Connecting users to top international gaming, streaming, lifestyle, and retail networks through one unified station.',
    },
  ];

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'About Us' }
      ]}
    >
      <SEO
        title="About AllCardStatus – Digital Gift Card Marketplace & Security Standards"
        description="Learn about AllCardStatus, our mission to redefine digital gifting, our 256-bit encryption standards, and instant digital delivery worldwide."
        canonicalPath="/about"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About AllCardStatus",
            "url": "https://allcardstatus.com/about",
            "description": "AllCardStatus is an authorized digital gift card marketplace and card validation platform.",
            "mainEntity": SEO_CONFIG.organizationSchema
          },
          SEO_CONFIG.organizationSchema
        ]}
      />
      <SectionHeading
        tag="Our Mission & Values"
        title="About AllCardStatus – Redefining Digital Gifting & Validation"
        subtitle="AllCardStatus is built with a singular focus: to make finding, selecting, validating, and sending digital gift cards simple, fast, and trustworthy."
        align="center"
        as="h1"
      />

      {/* Main Mission Story Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xs my-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              The AllCardStatus Mission
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Traditional gift giving often involves physical store trips, postal delays, or confusing terms. AllCardStatus was conceived to create a streamlined digital marketplace where modern consumers can browse a rich catalog of digital cards, choose exact denominations, and send memorable gifts instantly.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether celebrating a birthday, rewarding an employee, or leveling up your gaming wallet, our platform provides a dependable, transparent gateway to the digital goods you love.
            </p>
          </div>

          <div className="md:col-span-4 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center border border-indigo-500/20">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-white mb-3 shadow-lg">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="font-extrabold text-lg">AllCardStatus</div>
            <div className="text-xs text-indigo-300 mt-1">Founded on trust & digital speed</div>
          </div>
        </div>
      </div>

      {/* Verified Trustpilot Proof & Domain Notice Section */}
      <div className="max-w-4xl mx-auto">
        <TrustpilotProofSection />
      </div>

      {/* Core Values Grid */}
      <div className="my-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            What Sets Us Apart
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2">
            The principles that guide our marketplace design and engineering standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {values.map((val, idx) => {
            const IconComponent = val.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{val.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Pillars */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-12 max-w-5xl mx-auto my-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left border border-slate-800">
        <div>
          <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-1">
            Authenticity
          </div>
          <h3 className="text-lg font-bold text-white mb-2">100% Genuine Codes</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            All cards in our catalog are sourced and verified to ensure direct, uncompromised account redemption.
          </p>
        </div>

        <div>
          <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-1">
            Availability
          </div>
          <h3 className="text-lg font-bold text-white mb-2">24/7 Global Access</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Instant digital fulfillment anytime, day or night, with dedicated customer support.
          </p>
        </div>

        <div>
          <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-1">
            Simplicity
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Zero Hassle</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            No complex signups required to browse. Clean, responsive design on all devices.
          </p>
        </div>
      </div>

      {/* Explore CTA */}
      <div className="text-center my-12">
        <Link to="/gift-cards">
          <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore the Marketplace Catalog
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
};
