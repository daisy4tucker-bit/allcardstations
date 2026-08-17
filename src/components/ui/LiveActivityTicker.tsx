import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'purchased' | 'verified';
  brand: string;
  amount: string;
  location: string;
  timeAgo: string;
}

const INITIAL_EVENTS: LiveEvent[] = [
  { id: '1', type: 'purchased', brand: 'Apple Store', amount: '$50 USD', location: 'California, US', timeAgo: '12s ago' },
  { id: '2', type: 'verified', brand: 'PlayStation Network', amount: '$100 USD', location: 'London, UK', timeAgo: '28s ago' },
  { id: '3', type: 'purchased', brand: 'Xbox Digital', amount: '$25 USD', location: 'Texas, US', timeAgo: '41s ago' },
  { id: '4', type: 'verified', brand: 'Amazon eGift', amount: '$100 USD', location: 'Toronto, CA', timeAgo: '55s ago' },
  { id: '5', type: 'purchased', brand: 'Steam Wallet', amount: '$20 USD', location: 'Berlin, DE', timeAgo: '1m ago' },
  { id: '6', type: 'verified', brand: 'Target GiftCard', amount: '$50 USD', location: 'New York, US', timeAgo: '1m ago' },
  { id: '7', type: 'purchased', brand: 'Netflix Subscription', amount: '$30 USD', location: 'Sydney, AU', timeAgo: '2m ago' },
];

export interface LiveActivityTickerProps {
  giftCardsPurchased: number;
  giftCardsVerified: number;
  todayPurchased?: number;
  todayVerified?: number;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  giftCardsPurchased,
  giftCardsVerified,
  todayPurchased = 1842,
  todayVerified = 946,
}) => {
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
      }, 200);
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentEvent = INITIAL_EVENTS[currentIndex];

  return (
    <div 
      id="live-activity-ticker-container"
      className="w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 text-white shadow-xl flex items-center min-h-[52px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-2 sm:gap-3 overflow-hidden">
        
        {/* Integrated Pills with explicit "Today" phrasing & bold numbers */}
        <div className="w-full lg:w-auto flex items-center flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold shrink-0">
          
          {/* Live Status Chip */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 shadow-sm shadow-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-md shadow-amber-400/80" />
            <Zap className="w-3 h-3" />
            <span>Live</span>
          </div>

          {/* Today's Purchases Pill */}
          <div className="inline-flex items-center gap-1.5 bg-indigo-950/70 border border-indigo-500/30 px-2.5 sm:px-3 py-1 rounded-xl text-slate-200">
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-medium">Today's purchases:</span>
            <span className="font-normal text-white font-mono text-xs sm:text-sm">{todayPurchased.toLocaleString()}</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 pl-1 sm:pl-1.5 border-l border-indigo-500/30">
              all-time: <span className="font-normal text-cyan-400 font-mono text-xs sm:text-sm">{giftCardsPurchased.toLocaleString()}</span>
            </span>
          </div>

          {/* Today's Verifications Pill */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/30 px-2.5 sm:px-3 py-1 rounded-xl text-slate-200">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">Today's verifications:</span>
            <span className="font-normal text-white font-mono text-xs sm:text-sm">{todayVerified.toLocaleString()}</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 pl-1 sm:pl-1.5 border-l border-emerald-500/30">
              all-time: <span className="font-normal text-emerald-400 font-mono text-xs sm:text-sm">{giftCardsVerified.toLocaleString()}</span>
            </span>
          </div>

        </div>

        {/* Compact Event Feed */}
        <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-300 overflow-hidden min-w-0 max-w-full">
          <div 
            className={`flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-200 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-slate-500 font-medium hidden sm:inline">•</span>
            {currentEvent.type === 'purchased' ? (
              <span className="text-indigo-400 font-semibold shrink-0">🛍️ Purchased:</span>
            ) : (
              <span className="text-emerald-400 font-semibold shrink-0">🛡️ Verified:</span>
            )}
            <span className="font-bold text-white truncate max-w-[120px] sm:max-w-none">{currentEvent.brand}</span>
            <span className="text-slate-400 font-mono text-[11px] sm:text-xs shrink-0">({currentEvent.amount})</span>
            <span className="hidden md:inline text-slate-500 shrink-0">in {currentEvent.location}</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono bg-slate-800/60 px-1.5 py-0.5 rounded shrink-0">
              {currentEvent.timeAgo}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
