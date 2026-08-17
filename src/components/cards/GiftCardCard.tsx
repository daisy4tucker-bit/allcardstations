import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import { GiftCard } from '../../types/giftCard';

export interface GiftCardCardProps {
  giftCard: GiftCard;
  selectedCurrency?: string;
  selectedRegion?: string;
  className?: string;
}

export const GiftCardCard: React.FC<GiftCardCardProps> = ({ 
  giftCard, 
  selectedCurrency,
  selectedRegion,
  className = '' 
}) => {
  const { name, slug, image, themeColor, symbol } = giftCard;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  // Build target query string if currency or region is specified
  const queryParams = new URLSearchParams();
  if (selectedCurrency && selectedCurrency !== 'All') {
    queryParams.set('currency', selectedCurrency);
  }
  if (selectedRegion && selectedRegion !== 'All') {
    queryParams.set('region', selectedRegion);
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return (
    <div
      id={`gift-card-${slug}`}
      className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transform transition-all duration-300 ease-out hover:-translate-y-1.5 p-4 sm:p-5 ${className}`}
    >
      {/* Top Visual Physical Gift Card Artwork */}
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-900/10 dark:border-slate-700/30 bg-slate-900 mb-4.5 transform group-hover:-translate-y-1 group-hover:scale-[1.015] transition-all duration-300 ease-out">
        
        {/* Skeleton placeholder while image is fetching */}
        {image && !isImageLoaded && !isImageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent pointer-events-none" />
            <div className="text-slate-400 dark:text-slate-600 font-mono text-xs uppercase tracking-wider font-bold">
              {symbol || name.slice(0, 3)}
            </div>
          </div>
        )}

        {image && !isImageError ? (
          <img
            src={image}
            alt={`${name} gift card`}
            referrerPolicy="no-referrer"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageError(true)}
            className={`w-full h-full object-cover select-none transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${themeColor.bgGradient} p-4 flex flex-col justify-between text-white`}>
            <span className="text-[10px] font-mono uppercase">{symbol}</span>
            <span className="font-extrabold text-lg">{name}</span>
          </div>
        )}

        {/* Physical Card Ambient Specular Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none mix-blend-overlay" />
        
        {/* Subtle Inner Bevel / Laminated Border */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25 pointer-events-none" />

        {/* Stock & Instant Delivery Indicators */}
        <div className="absolute bottom-2 left-2.5 z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            In Stock
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-amber-300 border border-amber-500/30">
            Instant Delivery
          </span>
        </div>
      </div>

      {/* Brand Name Centered */}
      <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg text-center leading-snug mb-4">
        {name}
      </h3>

      {/* Two Action Buttons */}
      <div className="mt-auto space-y-2.5">
        <Link
          to={`/gift-cards/${slug}${queryString}`}
          id={`btn-buy-${slug}`}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buy Gift Card</span>
        </Link>

        <Link
          to={`/validate?card=${slug}`}
          id={`btn-validate-${slug}`}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Validate Card</span>
        </Link>
      </div>
    </div>
  );
};

