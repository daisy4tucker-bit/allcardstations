import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Layers, 
  ShieldCheck, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose a Card',
      subtitle: 'Explore 50+ Top Global Brands',
      description:
        'Browse our curated catalog across gaming, entertainment, retail, dining, travel, and lifestyle. Filter by region, currency, or category to find the ideal digital gift.',
      icon: Layers,
      color: 'from-indigo-600 to-blue-600',
      points: [
        'Organized categories for fast discovery',
        'Official authorized digital brands',
        'Clear region & currency indicators',
      ],
    },
    {
      number: '02',
      title: 'Enter Desired Amount',
      subtitle: 'Flexible Amounts from $50 to $10,000',
      description:
        'Pick the exact amount you wish to gift. Enter any custom card value from $50 up to $10,000 tailored to your occasion and budget with transparent pricing.',
      icon: CreditCard,
      color: 'from-blue-600 to-sky-600',
      points: [
        'Custom amount input tailored to your budget',
        'Zero platform markup or service fees',
        'Transparent exchange and multi-currency support',
      ],
    },
    {
      number: '03',
      title: 'Pay Securely',
      subtitle: 'Encrypted & Frictionless Checkout',
      description:
        'Complete your order in seconds through our high-security payment infrastructure. Protected with industry-standard TLS encryption and anti-fraud protocols.',
      icon: ShieldCheck,
      color: 'from-sky-600 to-emerald-600',
      points: [
        '256-bit SSL encrypted transactions',
        'Full customer buyer protection',
        'Immediate digital transaction receipt',
      ],
    },
    {
      number: '04',
      title: 'Receive Your Card',
      subtitle: 'Instant Electronic Delivery',
      description:
        'Your verified digital gift code is delivered immediately to your email address and accessible directly in your secure customer portal for immediate redemption.',
      icon: Send,
      color: 'from-emerald-600 to-teal-600',
      points: [
        'Delivered in under 30 seconds',
        'Copyable redemption codes with brand instructions',
        'Valid for instant online or in-store redemption',
      ],
    },
  ];

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'How It Works' }
      ]}
    >
      <SectionHeading
        tag="Simple & Transparent"
        title="How AllCardStation Works"
        subtitle="Sending and receiving digital gift cards has never been easier. Follow our four simple steps from discovery to instant redemption."
        align="center"
      />

      {/* 4 Steps Timeline Section */}
      <div className="space-y-8 my-12 max-w-5xl mx-auto">
        {steps.map((step) => {
          const IconComp = step.icon;

          return (
            <div
              key={step.number}
              id={`step-${step.number}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xs hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Step Number & Visual Badge */}
              <div className="lg:col-span-4 flex flex-col items-start lg:items-center text-left lg:text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md mb-4`}>
                  <IconComp className="w-7 h-7" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                  Step {step.number}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1">
                  {step.subtitle}
                </div>
              </div>

              {/* Step Details & Bullet Points */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {step.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assurance Highlights Grid */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-12 my-16 relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.25),transparent_70%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Digital Delivery Guarantee</span>
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Ready to experience seamless digital gifting?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Browse our digital marketplace right now to explore gift cards from top gaming, retail, and entertainment brands.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/gift-cards" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Gift Cards
              </Button>
            </Link>
            <Link to="/faq" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                View Common Questions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
