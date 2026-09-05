import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Zap, ArrowRight, Activity, CheckCircle2, Lock, Star } from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'purchased' | 'verified';
  brand: string;
  amount: string;
  location: string;
  timeAgo: string;
}

const INITIAL_EVENTS: LiveEvent[] = [
  { id: '1', type: 'purchased', brand: 'Apple Store Gift Card', amount: '$50 USD', location: 'California, US', timeAgo: '12s ago' },
  { id: '2', type: 'verified', brand: 'PlayStation Network Card', amount: '$100 USD', location: 'London, UK', timeAgo: '28s ago' },
  { id: '3', type: 'purchased', brand: 'Xbox Digital Gift Card', amount: '$25 USD', location: 'Texas, US', timeAgo: '41s ago' },
  { id: '4', type: 'verified', brand: 'Amazon eGift Card', amount: '$100 USD', location: 'Toronto, CA', timeAgo: '55s ago' },
  { id: '5', type: 'purchased', brand: 'Steam Wallet Card', amount: '$20 USD', location: 'Berlin, DE', timeAgo: '1m ago' },
  { id: '6', type: 'verified', brand: 'Target GiftCard', amount: '$50 USD', location: 'New York, US', timeAgo: '1m ago' },
  { id: '7', type: 'purchased', brand: 'Netflix Subscription Card', amount: '$30 USD', location: 'Sydney, AU', timeAgo: '2m ago' },
  { id: '8', type: 'verified', brand: 'Google Play Gift Card', amount: '$50 USD', location: 'Frankfurt, DE', timeAgo: '2m ago' },
  { id: '9', type: 'purchased', brand: 'Razer Gold ePin', amount: '$100 USD', location: 'Singapore, SG', timeAgo: '3m ago' },
];

export interface LiveActivityTickerProps {
  giftCardsPurchased: number;
  giftCardsVerified: number;
  todayPurchased?: number;
  todayVerified?: number;
  showButtons?: boolean;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  giftCardsPurchased,
  giftCardsVerified,
  todayPurchased = 1842,
  todayVerified = 946,
  showButtons = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fade, setFade] = useState(true);

  // Live update flash animations
  const [purchasedFlash, setPurchasedFlash] = useState(false);
  const [verifiedFlash, setVerifiedFlash] = useState(false);

  useEffect(() => {
    setPurchasedFlash(true);
    const timer = setTimeout(() => setPurchasedFlash(false), 1200);
    return () => clearTimeout(timer);
  }, [todayPurchased, giftCardsPurchased]);

  useEffect(() => {
    setVerifiedFlash(true);
    const timer = setTimeout(() => setVerifiedFlash(false), 1200);
    return () => clearTimeout(timer);
  }, [todayVerified, giftCardsVerified]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % INITIAL_EVENTS.length);
        setFade(true);
      }, 150);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleReviewsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const section = document.getElementById('customer-reviews-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/#customer-reviews-section');
    setTimeout(() => {
      document.getElementById('customer-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const currentEvent = INITIAL_EVENTS[currentIndex];

  return (
    <div 
      id="live-activity-ticker-container"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-slate-900 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-2xl space-y-3 transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Tier 1: Metrics Counters & Action Buttons */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
        
        {/* Left: High-Contrast Live Metric Pills */}
        <div className="w-full xl:w-auto flex items-center flex-wrap justify-center sm:justify-start gap-2 text-xs font-semibold shrink-0">
          
          {/* Live Indicator Pill */}
          <div className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Today's Purchases Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Today's orders:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
              {todayPurchased.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-700">
              all-time: <strong className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs">{giftCardsPurchased.toLocaleString()}</strong>
            </span>
          </div>

          {/* Today's Verifications Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Today's checks:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">
              {todayVerified.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-700">
              all-time: <strong className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs">{giftCardsVerified.toLocaleString()}</strong>
            </span>
          </div>

        </div>

        {/* Right: Embedded Action Buttons with Buy, Validate, and Review */}
        {showButtons && (
          <div className="w-full sm:w-auto flex items-center flex-wrap justify-center sm:justify-end gap-2 shrink-0">
            <Link
              to="/gift-cards"
              id="ticker-buy-gift-card-btn"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Gift Card</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <Link
              to="/validate"
              id="ticker-validate-card-btn"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#2563EB] dark:border-blue-500 bg-white dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>Validate Card</span>
            </Link>

            <button
              type="button"
              id="ticker-reviews-btn"
              onClick={handleReviewsClick}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-500/60 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-xs transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Reviews</span>
            </button>
          </div>
        )}

      </div>

      {/* Tier 2: Dedicated Real-Time Card Activity Spotlight (High-Visibility & Uncut) */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        <div className="w-full md:w-auto flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
          
          {/* Label chip */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Live Card Stream:</span>
          </div>

          {/* Animated Real-time card transaction pill */}
          <div 
            className={`flex items-center gap-2 flex-wrap transition-all duration-300 ${
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
          >
            {currentEvent.type === 'purchased' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-200 font-black text-xs border border-blue-300 dark:border-blue-700/60 shadow-xs shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                CARD PURCHASED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#86A98D]/15 text-[#86A98D] font-black text-xs border border-[#86A98D]/30 shadow-xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#86A98D]" />
                CARD VERIFIED
              </span>
            )}

            {/* Prominent Card Brand / Type */}
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              {currentEvent.brand}
            </span>

            {/* Denomination / Amount Badge */}
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 font-mono font-black text-xs sm:text-sm shadow-xs shrink-0">
              {currentEvent.amount}
            </span>

            {/* Location */}
            <span className="text-slate-600 dark:text-slate-300 font-medium text-xs hidden sm:inline shrink-0">
              in <strong className="text-slate-800 dark:text-slate-100">{currentEvent.location}</strong>
            </span>

            {/* Time Ago */}
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full font-bold shrink-0">
              {currentEvent.timeAgo}
            </span>
          </div>

        </div>

        {/* Security & Verification Guarantee Tag */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
          <div className="flex items-center gap-1 text-[#86A98D] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instant Fulfillment</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

      </div>
    </div>
  );
};
