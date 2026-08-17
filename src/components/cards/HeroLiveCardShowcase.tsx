import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';
import { GIFT_CARDS } from '../../data/brands';

export const HeroLiveCardShowcase: React.FC = () => {
  // Curated showcase cards representing major top brands
  const showcaseSlugs = ['apple', 'playstation', 'xbox', 'amazon', 'steam', 'target', 'netflix', 'spotify'];
  const showcaseCards = GIFT_CARDS.filter((c) => showcaseSlugs.includes(c.slug));
  const cards = showcaseCards.length > 0 ? showcaseCards : GIFT_CARDS.slice(0, 6);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-slide every 3 seconds from left to right
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [cards.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div 
      className="w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Card Frame */}
      <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 group">
        
        {/* Animated Card Slides */}
        {cards.map((card, idx) => {
          // Calculate offset position relative to currentIndex
          let positionClass = 'translate-x-full opacity-0 pointer-events-none z-0';
          
          if (idx === currentIndex) {
            // Active slide centered
            positionClass = 'translate-x-0 opacity-100 z-20';
          } else if (idx === (currentIndex - 1 + cards.length) % cards.length) {
            // Previous slide exiting to the left
            positionClass = '-translate-x-full opacity-0 pointer-events-none z-10';
          } else if (idx === (currentIndex + 1) % cards.length) {
            // Next slide waiting on the right
            positionClass = 'translate-x-full opacity-0 pointer-events-none z-10';
          }

          return (
            <div
              key={card.id}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${positionClass}`}
            >
              <div className="block w-full h-full relative group/card">
                {/* Card Background Image / Art */}
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${card.themeColor.bgGradient} p-6 flex flex-col justify-between text-white`}>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs uppercase font-bold tracking-wider opacity-80">Digital eGift</span>
                      <span className="font-extrabold text-sm bg-white/20 px-2.5 py-0.5 rounded-lg">{card.symbol}</span>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-1">{card.category}</div>
                      <div className="text-2xl sm:text-3xl font-black">{card.name}</div>
                    </div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>{card.region}</span>
                      <span>Instant Delivery</span>
                    </div>
                  </div>
                )}

                {/* Bottom Overlay with Direct Buy and Validate Options with transparent backgrounds */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                      {card.category}
                    </span>
                    <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                      {card.name}
                    </h3>
                  </div>

                  {/* Direct Action Options: Buy & Validate with transparent background and clean borders */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/gift-cards/${card.slug}`}
                      id={`hero-slide-buy-${card.slug}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-transparent hover:bg-white/10 text-white font-bold text-xs border border-white/40 hover:border-white/70 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buy</span>
                    </Link>

                    <Link
                      to={`/validate?card=${card.slug}`}
                      id={`hero-slide-validate-${card.slug}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-transparent hover:bg-white/10 text-white font-bold text-xs border border-white/40 hover:border-white/70 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Validate</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Floating Slide Navigation Arrows on the card */}
        <button
          type="button"
          id="hero-slide-prev-btn"
          onClick={handlePrev}
          aria-label="Previous card"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm z-30 transition-all hover:scale-110 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          id="hero-slide-next-btn"
          onClick={handleNext}
          aria-label="Next card"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm z-30 transition-all hover:scale-110 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Clean Slide Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            type="button"
            id={`hero-dot-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}: ${card.name}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-5 h-1.5 bg-amber-500'
                : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
