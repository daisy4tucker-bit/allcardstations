import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, ArrowRight, Star } from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'purchased' | 'verified';
  brand: string;
  amount: string;
  location: string;
  timeAgo: string;
}

const INITIAL_EVENTS: LiveEvent[] = [
  { id: '1', type: 'purchased', brand: 'Apple Gift Card', amount: '$50 USD', location: 'California, US', timeAgo: '12s ago' },
  { id: '2', type: 'verified', brand: 'PlayStation Card', amount: '$100 USD', location: 'London, UK', timeAgo: '28s ago' },
  { id: '3', type: 'purchased', brand: 'Xbox Gift Card', amount: '$25 USD', location: 'Texas, US', timeAgo: '41s ago' },
  { id: '4', type: 'verified', brand: 'Amazon eGift Card', amount: '$100 USD', location: 'Toronto, CA', timeAgo: '55s ago' },
  { id: '5', type: 'purchased', brand: 'Steam Wallet Card', amount: '$20 USD', location: 'Berlin, DE', timeAgo: '1m ago' },
  { id: '6', type: 'verified', brand: 'Target GiftCard', amount: '$50 USD', location: 'New York, US', timeAgo: '1m ago' },
  { id: '7', type: 'purchased', brand: 'Netflix Subscription', amount: '$30 USD', location: 'Sydney, AU', timeAgo: '2m ago' },
  { id: '8', type: 'verified', brand: 'Google Play Card', amount: '$50 USD', location: 'Frankfurt, DE', timeAgo: '2m ago' },
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
  showButtons = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % INITIAL_EVENTS.length);
        setFade(true);
      }, 150);
    }, 2800);

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
      className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-slate-900 dark:text-white shadow-2xs transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Live Transaction Stream */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 min-w-0">
            {/* LIVE tag */}
            <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider shrink-0 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </div>

            {/* Cycling Event */}
            <div 
              className={`flex items-center gap-1.5 truncate transition-opacity duration-200 ${
                fade ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {currentEvent.type === 'purchased' ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded shrink-0">
                  <ShoppingBag className="w-3 h-3" />
                  Purchased
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}

              <span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[120px] sm:max-w-none">
                {currentEvent.brand}
              </span>

              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px] shrink-0 bg-blue-50/80 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/50">
                {currentEvent.amount}
              </span>

              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono hidden md:inline">
                • {currentEvent.timeAgo}
              </span>
            </div>
          </div>

          {/* Mobile Rating Badge (shown inline on mobile) */}
          <div className="sm:hidden shrink-0">
            <button
              type="button"
              onClick={handleReviewsClick}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/60 bg-amber-50/80 text-amber-900 dark:text-amber-200 font-bold text-[10px] transition-colors cursor-pointer"
            >
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 shrink-0" />
              <span>4.9/5</span>
            </button>
          </div>
        </div>

        {/* Combined Daily Totals & Desktop Rating */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Today's Activity Stats */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Today:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{todayPurchased.toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">orders</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{todayVerified.toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">checks</span>
          </div>

          {/* Desktop Rating Badge */}
          <div className="hidden sm:block shrink-0">
            <button
              type="button"
              onClick={handleReviewsClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-500/60 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold text-[11px] transition-colors cursor-pointer"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
              <span className="font-semibold">4.9/5</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
