import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SearchBar } from '../components/ui/SearchBar';
import { Accordion } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SEO } from '../components/common/SEO';
import { TrustpilotProofSection } from '../components/common/TrustpilotProofSection';
import { FAQS } from '../data/faq';

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'General', 'Gift Cards', 'Payments', 'Delivery', 'Validation', 'Security'];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      // Category match
      if (selectedCategory !== 'All' && faq.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQ = faq.question.toLowerCase().includes(query);
        const matchesA = faq.answer.toLowerCase().includes(query);
        const matchesC = faq.category.toLowerCase().includes(query);
        if (!matchesQ && !matchesA && !matchesC) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'FAQ' }
      ]}
    >
      <SEO
        title="Frequently Asked Questions (FAQ) – Digital Gift Cards & Validation"
        description="Get instant answers about buying digital gift cards, crypto checkout, email delivery, card authenticity validation, and refunds on AllCardStatus."
        canonicalPath="/faq"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.slice(0, 15).map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer
            }
          }))
        }}
      />
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          tag="Support & Answers"
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions about purchasing, delivering, validating, and redeeming digital gift cards."
          align="center"
          as="h1"
        />

        {/* Search Bar */}
        <div className="mb-3 sm:mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search questions by keyword (e.g., delivery, refund, fees, validation)..."
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0 pb-2 mb-4 sm:mb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                id={`faq-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Verified Trustpilot Proof & Domain Scope Section */}
        <TrustpilotProofSection />

        {/* Accordion Questions List */}
        {filteredFaqs.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xs mb-6 sm:mb-8">
            <Accordion items={filteredFaqs} defaultOpenIndex={0} />
          </div>
        ) : (
          <EmptyState
            title="No questions found"
            description={`No FAQ items matched your search query "${searchQuery}". Please try another search term or contact our support team.`}
            actionLabel="Clear Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mb-6 sm:mb-8"
          />
        )}

        {/* Still Have Questions Box */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 border border-slate-800">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <HelpCircle className="w-4 h-4" />
              <span>Need More Assistance?</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white">
              Still have questions about your order?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md">
              Our customer care specialists are on standby 24/7 to help you with code deliveries and order queries.
            </p>
          </div>

          <Link to="/contact" className="shrink-0 w-full sm:w-auto">
            <Button
              size="md"
              variant="primary"
              className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
