import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Search,
  ShoppingBag,
  Activity,
  Tag,
  Gift,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GiftCardCard } from '../components/cards/GiftCardCard';
import { StatsCard } from '../components/cards/StatsCard';
import { FeatureCard } from '../components/cards/FeatureCard';
import { CustomerReviews } from '../components/home/CustomerReviews';
import { LiveActivityTicker } from '../components/ui/LiveActivityTicker';
import { HeroLiveCardShowcase } from '../components/cards/HeroLiveCardShowcase';
import { PromotionalBanner } from '../components/common/PromotionalBanner';
import { GIFT_CARDS } from '../data/brands';
import { FEATURES } from '../data/features';
import { CategoryType } from '../types/giftCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Dynamic live random numbers for Gift Cards Purchased and Verified (All-Time vs Today)
  const [giftCardsPurchased, setGiftCardsPurchased] = useState<number>(() => {
    return 384500 + Math.floor(Math.random() * 4500);
  });

  const [todayCardsPurchased, setTodayCardsPurchased] = useState<number>(() => {
    return 1842 + Math.floor(Math.random() * 85);
  });

  const [giftCardsVerified, setGiftCardsVerified] = useState<number>(() => {
    return 248200 + Math.floor(Math.random() * 3200);
  });

  const [todayCardsVerified, setTodayCardsVerified] = useState<number>(() => {
    return 946 + Math.floor(Math.random() * 45);
  });

  // Stats timescale view state
  const [statsView, setStatsView] = useState<'comparison' | 'overall' | 'today'>('comparison');

  // Hero search bar state
  const [heroSearch, setHeroSearch] = useState<string>('');
  const [showHeroSuggestions, setShowHeroSuggestions] = useState<boolean>(false);


  // Home category tab filter for preview grid
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryType>('All');

  // Realistic random increment timers for live counters
  useEffect(() => {
    // Increment purchased counter every 4.5 - 7.5 seconds
    const purchasedInterval = setInterval(() => {
      const inc = Math.random() > 0.3 ? 1 : 2;
      setGiftCardsPurchased((prev) => prev + inc);
      setTodayCardsPurchased((prev) => prev + inc);
    }, 5500);

    // Increment verified counter every 6 - 9 seconds
    const verifiedInterval = setInterval(() => {
      setGiftCardsVerified((prev) => prev + 1);
      setTodayCardsVerified((prev) => prev + 1);
    }, 7200);

    return () => {
      clearInterval(purchasedInterval);
      clearInterval(verifiedInterval);
    };
  }, []);

  // Quick categories for the Hero bar
  const heroCategories: { label: string; value: CategoryType; icon: string }[] = [
    { label: 'All Cards', value: 'All', icon: '✨' },
    { label: 'Gaming', value: 'Gaming', icon: '🎮' },
    { label: 'Shopping', value: 'Shopping', icon: '🛍️' },
    { label: 'Entertainment', value: 'Entertainment', icon: '🎬' },
    { label: 'Food & Dining', value: 'Food', icon: '🍔' },
    { label: 'Technology', value: 'Technology', icon: '💻' },
    { label: 'Fashion', value: 'Fashion', icon: '👔' },
    { label: 'Travel', value: 'Travel', icon: '✈️' },
  ];

  // Search auto-suggestions
  const filteredSuggestions = useMemo(() => {
    if (!heroSearch.trim()) return [];
    const query = heroSearch.toLowerCase().trim();
    return GIFT_CARDS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.tagline.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [heroSearch]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/gift-cards?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/gift-cards');
    }
  };

  // Filtered popular cards for the showcase section
  const displayedCards = useMemo(() => {
    if (activeCategoryTab === 'All') {
      return GIFT_CARDS.slice(0, 8);
    }
    return GIFT_CARDS.filter((c) => c.category === activeCategoryTab).slice(0, 8);
  }, [activeCategoryTab]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-[#F5F7FA] dark:bg-slate-950 text-[#1E293B] dark:text-white pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-18 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Top Live Ticker Ribbon */}
          <div>
            <LiveActivityTicker
              giftCardsPurchased={giftCardsPurchased}
              giftCardsVerified={giftCardsVerified}
              todayPurchased={todayCardsPurchased}
              todayVerified={todayCardsVerified}
            />
          </div>

          {/* Carousel & Featured Display of Cards Showcase (Rendered directly after Live Stream container) */}
          <div className="space-y-5 max-w-4xl mx-auto pt-1">
            {/* Micro Trust & Gold Review Button Header Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant eDelivery</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <Lock className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>256-bit Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Zero Inactivity Fees</span>
              </div>
              <button
                type="button"
                id="hero-client-reviews-badge-btn"
                onClick={() => {
                  document.getElementById('customer-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-500/80 bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>Client Reviews (4.9/5)</span>
              </button>
            </div>

            {/* Interactive Carousel */}
            <HeroLiveCardShowcase />
          </div>

          {/* Clean Main Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E293B] dark:text-white">
              Digital Gift Cards & Card Validation
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Choose an action below to get started. You can buy new digital gift cards with instant delivery, or verify the status and balance of an existing card.
            </p>
          </div>

          {/* TWO MAIN CLEAR CHOICE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* OPTION 1: BUY A GIFT CARD */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 font-mono">Option 1</span>
                    <h2 className="text-xl font-extrabold text-[#1E293B] dark:text-white">Buy a Gift Card</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Purchase authentic digital gift cards for Apple, Amazon, Steam, Xbox, PlayStation, and 50+ brands. Delivered to your email instantly.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Apple', 'Amazon', 'PlayStation', 'Xbox', 'Steam', 'Target'].map((brand) => (
                    <span key={brand} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F5F7FA] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/gift-cards"
                  id="hero-buy-gift-card-btn"
                  className="w-full py-3.5 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse & Buy Cards</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* OPTION 2: VALIDATE A CARD */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 font-mono">Option 2</span>
                    <h2 className="text-xl font-extrabold text-[#1E293B] dark:text-white">Check / Validate Card</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Check if your gift card is active, verify its available balance, or test your physical card code and receipt photos securely.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Balance Check', 'Code Authenticity', 'Photo Verification', 'Instant Results'].map((tag) => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/validate"
                  id="hero-validate-card-btn"
                  className="w-full py-3.5 px-5 rounded-xl border-2 border-[#2563EB] dark:border-blue-500 bg-white dark:bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                  <span>Validate Card Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

          {/* Quick Search & Showcase Row */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            
            {/* Search Bar */}
            <div className="lg:col-span-7">
              <div className="relative">
                <form onSubmit={handleHeroSearchSubmit} className="relative flex items-center">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="hero-search-input"
                      value={heroSearch}
                      onChange={(e) => {
                        setHeroSearch(e.target.value);
                        setShowHeroSuggestions(true);
                      }}
                      onFocus={() => setShowHeroSuggestions(true)}
                      placeholder="Search card by brand (e.g. Apple, Amazon, Steam)..."
                      className="w-full pl-10 pr-24 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-[#1E293B] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    />
                    <button
                      type="submit"
                      id="hero-search-submit-btn"
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Search</span>
                    </button>
                  </div>
                </form>

                {/* Suggestions Dropdown */}
                {showHeroSuggestions && filteredSuggestions.length > 0 && (
                  <div 
                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-30 p-2 text-left"
                    onMouseLeave={() => setShowHeroSuggestions(false)}
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                      Matching Gift Cards
                    </div>
                    <div className="py-1">
                      {filteredSuggestions.map((item) => (
                        <Link
                          key={item.id}
                          to={`/gift-cards/${item.slug}`}
                          onClick={() => setShowHeroSuggestions(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1E293B] dark:text-white">{item.name}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 font-mono">
                            From ${item.startingPrice}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Micro Trust Indicators (with Sage Green Checkmarks) */}
            <div className="lg:col-span-5 flex flex-wrap items-center justify-center lg:justify-end gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#86A98D] shrink-0" />
                <span className="text-[#1E293B] dark:text-slate-300">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span className="text-[#1E293B] dark:text-slate-300">256-bit Secure</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('customer-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-500/80 bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 cursor-pointer font-bold transition-all shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>4.9/5 Reviews</span>
              </button>
            </div>

          </div>

          {/* 3 Ultra-Simple Visual Steps for Any User */}
          <div className="max-w-4xl mx-auto pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center font-black text-[#2563EB] dark:text-blue-400 text-sm shrink-0">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E293B] dark:text-white">Choose Brand</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Apple, Steam, Xbox & more</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center font-black text-[#2563EB] dark:text-blue-400 text-sm shrink-0">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E293B] dark:text-white">Buy or Check Code</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Select amount or enter code</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-[#86A98D]/15 dark:bg-[#86A98D]/25 flex items-center justify-center font-black text-[#86A98D] text-sm shrink-0">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E293B] dark:text-white">Instant Result</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Get code or balance status</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST & REAL-TIME STATS SECTION */}
      <section className="relative py-12 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Timescale Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm uppercase font-mono tracking-wider text-[#2563EB] dark:text-blue-400 font-bold">
                  Verified Marketplace Metrics
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparing all-time platform volume with live 24-hour activity.
              </p>
            </div>

            {/* Interactive Timescale View Switcher */}
            <div className="flex flex-wrap items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-stretch sm:self-auto gap-1 sm:gap-0">
              <button
                type="button"
                onClick={() => setStatsView('comparison')}
                className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statsView === 'comparison'
                    ? 'bg-[#2563EB] text-white font-extrabold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Overall vs Today
              </button>
              <button
                type="button"
                onClick={() => setStatsView('overall')}
                className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statsView === 'overall'
                    ? 'bg-[#2563EB] text-white font-extrabold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                All-Time Total
              </button>
              <button
                type="button"
                onClick={() => setStatsView('today')}
                className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statsView === 'today'
                    ? 'bg-[#2563EB] text-white font-extrabold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Today (24h)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stat 1: Gift Cards Purchased (All-Time vs Today) */}
            <StatsCard
              stat={{
                id: 'stat-purchased',
                value: statsView === 'today' 
                  ? `${todayCardsPurchased.toLocaleString()}` 
                  : `${giftCardsPurchased.toLocaleString()}+`,
                label: statsView === 'today' 
                  ? 'Cards Purchased Today' 
                  : statsView === 'overall' 
                  ? 'Total Purchased Overall' 
                  : 'Gift Cards Purchased',
                description: statsView === 'today'
                  ? 'Active orders completed in the last 24 hours with instant electronic code distribution'
                  : 'Cumulative gift cards purchased electronically since inception with instant delivery',
                iconName: 'ShoppingBag',
              }}
              badge={statsView === 'today' ? '+34 this hour' : `+${todayCardsPurchased} today`}
              badgeType="indigo"
              isLive={true}
              timeframeBreakdown={statsView === 'comparison' ? {
                overallLabel: 'Total Purchased',
                overallValue: `${giftCardsPurchased.toLocaleString()}+`,
                todayLabel: 'Purchased Today',
                todayValue: `+${todayCardsPurchased}`,
              } : undefined}
            />

            {/* Stat 2: Gift Cards Verified (All-Time vs Today) */}
            <StatsCard
              stat={{
                id: 'stat-verified',
                value: statsView === 'today'
                  ? `${todayCardsVerified.toLocaleString()}`
                  : `${giftCardsVerified.toLocaleString()}+`,
                label: statsView === 'today'
                  ? 'Cards Verified Today'
                  : statsView === 'overall'
                  ? 'Total Verified Overall'
                  : 'Gift Cards Verified',
                description: statsView === 'today'
                  ? 'Card cryptographic validations and balance checks performed within the past 24 hours'
                  : 'Cumulative digital codes authenticated across global merchant security protocols',
                iconName: 'ShieldCheck',
              }}
              badge={statsView === 'today' ? '99.98% authentic' : `+${todayCardsVerified} today`}
              badgeType="sage"
              isLive={true}
              timeframeBreakdown={statsView === 'comparison' ? {
                overallLabel: 'All-Time Total',
                overallValue: `${giftCardsVerified.toLocaleString()}+`,
                todayLabel: 'Verified Today',
                todayValue: `+${todayCardsVerified}`,
              } : undefined}
            />

            {/* Stat 3: 50+ Brands */}
            <StatsCard
              stat={{
                id: 'stat-brands',
                value: '50+ Top Brands',
                label: 'Authorized Issuers',
                description: 'Direct relationships with premier gaming, entertainment & retail platforms',
                iconName: 'Layers',
              }}
              badge="Global catalog"
              badgeType="indigo"
            />

            {/* Stat 4: Digital Delivery */}
            <StatsCard
              stat={{
                id: 'stat-delivery',
                value: '< 30 Seconds',
                label: 'Instant Delivery',
                description: 'High-speed automated distribution pipeline available 24/7/365',
                iconName: 'Zap',
              }}
              badge="Automated"
              badgeType="amber"
            />

          </div>
        </div>
      </section>

      {/* FEATURED PROMOTIONAL BANNER SECTION */}
      <section className="py-8 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionalBanner
            variant="full"
            badgeText="🔥 HOT PROMOTION"
            title="Claim Up To 15% Off Top Digital Cards"
            description="Use coupon code VAULT15 at checkout to receive instant discounts on selected PlayStation, Apple, Steam, Xbox, and Amazon digital gift cards. All codes verified with 100% authenticity guarantee."
            discountCode="VAULT15"
            discountPercentage={15}
            ctaText="Shop Promo Catalog"
            ctaLink="/gift-cards"
            secondaryCtaText="Check Card Validity"
            secondaryCtaLink="/validate"
            expiresInHours={12}
            dismissible={false}
          />
        </div>
      </section>

      {/* POPULAR GIFT CARDS MARKETPLACE PREVIEW */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Featured Digital Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Popular Gift Cards
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl">
                Choose a category or explore our most purchased digital cards with authentic claim guarantees.
              </p>
            </div>

            <Link to="/gift-cards" className="shrink-0">
              <Button variant="outline" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View All 50+ Cards
              </Button>
            </Link>
          </div>

          {/* Home Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 mb-8">
            {heroCategories.map((cat) => {
              const isSelected = activeCategoryTab === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategoryTab(cat.value)}
                  className={`px-3.5 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-accent shrink-0 ${
                    isSelected
                      ? 'bg-accent text-white shadow-md shadow-[var(--accent-primary)]/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedCards.map((card) => (
              <GiftCardCard key={card.id} giftCard={card} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/gift-cards">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Full Gift Card Catalog ({GIFT_CARDS.length} Available)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK VALIDATE CALLOUT BANNER */}
      <section className="py-12 bg-blue-900 dark:bg-slate-900 text-white relative overflow-hidden border-y border-blue-800 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.25),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-blue-950/60 dark:bg-slate-900/90 rounded-3xl border border-blue-500/30 backdrop-blur-md">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#86A98D]">
                <ShieldCheck className="w-4 h-4" />
                <span>Card Authentication Suite</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Already have a gift card code? Validate it now.
              </h3>
              <p className="text-blue-100 dark:text-slate-300 text-xs sm:text-sm max-w-xl">
                Check regional compatibility and claim protocol formats for all supported brands in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
              <Link to="/validate" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                  Go to Card Validator
                </Button>
              </Link>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-blue-800/50 text-white border-blue-300/40 font-bold">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="Why AllCardStatus"
            title="Everything you need for digital gifting"
            subtitle="Engineered from the ground up for seamless gift card discovery, secure digital delivery, and effortless validation."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS & SOCIAL PROOF */}
      <CustomerReviews />

      {/* HOW IT WORKS TEASER */}
      <section className="py-16 sm:py-24 bg-[#F5F7FA] dark:bg-slate-950 text-[#1E293B] dark:text-white relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E293B] dark:text-white">
              How AllCardStatus Works
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              Get your digital gift card in your inbox in less than a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose a Card',
                desc: 'Select from dozens of premier gaming, streaming, and retail brands.',
              },
              {
                step: '02',
                title: 'Enter Desired Amount',
                desc: 'Enter any custom amount from $50 up to $10,000 in your local currency.',
              },
              {
                step: '03',
                title: 'Pay Securely',
                desc: 'Fast, encrypted transaction with instant order receipt.',
              },
              {
                step: '04',
                title: 'Receive Your Card',
                desc: 'Get your official digital code immediately via instant delivery.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-[#2563EB]/50 transition-colors shadow-xs"
              >
                <div className="text-3xl font-extrabold font-mono text-[#2563EB] dark:text-blue-400 mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/how-it-works">
              <Button
                variant="outline"
                className="border-blue-300 dark:border-blue-800 text-[#2563EB] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Learn More About The Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-[#1D4ED8] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
              Ready to find the perfect gift card?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mb-8 leading-relaxed">
              Explore 50+ digital brands with instant electronic delivery and zero fees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/gift-cards" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#1E293B] font-extrabold shadow-md border border-slate-200">
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/validate" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-blue-700 text-white border-blue-300/40 font-bold">
                  Check Card Validity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
