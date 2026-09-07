import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, ArrowRight, Activity, CheckCircle2, Lock } from 'lucide-react';

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
  todayPurchased = 300 + Math.floor(Math.random() * 251),
  todayVerified = 300 + Math.floor(Math.random() * 251),
  showButtons = true,
}) => {
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
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentEvent = INITIAL_EVENTS[currentIndex];

  return (
    <div 
      id="live-activity-ticker-container"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 text-slate-900 dark:text-white shadow-xs dark:shadow-none space-y-2.5 transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Bar: Live Status + Daily Metrics + Primary Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Left: Live Indicator & Symmetrical Daily Metrics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 text-xs">
          
          {/* Top micro-bar on mobile: Live Indicator Badge */}
          <div className="flex items-center justify-between sm:justify-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono uppercase font-bold tracking-wider">Live Today</span>
            </div>
          </div>

          {/* Symmetrical 50/50 Grid on Mobile, Inline on Tablet/Desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
            {/* Today's Orders Counter */}
            <div className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg border transition-colors ${
              purchasedFlash
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60'
            }`}>
              <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">Orders:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
                {todayPurchased.toLocaleString()}
              </span>
            </div>

            {/* Today's Checks Counter */}
            <div className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg border transition-colors ${
              verifiedFlash
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">Checks:</span>
              <span className="font-bold text-[#2563EB] dark:text-blue-400 font-mono text-xs sm:text-sm">
                {todayVerified.toLocaleString()}
              </span>
            </div>
          </div>

        </div>

        {/* Right: Modern, High-Recognition Action Buttons (50/50 on mobile, inline on desktop) */}
        {showButtons && (
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              to="/gift-cards"
              id="ticker-buy-gift-card-btn"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white font-bold text-[11px] sm:text-xs shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-white" />
              <span>Buy Gift Card</span>
            </Link>

            <Link
              to="/validate"
              id="ticker-validate-card-btn"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] sm:text-xs shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-white" />
              <span>Check Card Status</span>
            </Link>
          </div>
        )}

      </div>

      {/* Bottom Bar: Streamlined Modest Live Card Transaction Feed */}
      <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-2 sm:px-3 flex items-center justify-between gap-2 text-xs">
        
        {/* Stream event */}
        <div className="w-full flex items-center gap-2 overflow-hidden">
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
            <Activity className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="hidden sm:inline">Stream:</span>
          </div>

          <div 
            className={`w-full flex items-center justify-between gap-1.5 transition-all duration-300 min-w-0 ${
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              {currentEvent.type === 'purchased' ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[#2563EB] dark:text-blue-200 font-bold text-[10px] shrink-0">
                  PURCHASED
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                  VERIFIED
                </span>
              )}

              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate">
                {currentEvent.brand}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-mono font-bold text-xs shrink-0">
                {currentEvent.amount}
              </span>

              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                {currentEvent.timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Reassurance tags on larger displays */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Instant eDelivery
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#2563EB]" />
            256-Bit Encrypted
          </span>
        </div>

      </div>
    </div>
  );
};
