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
      className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transform transition-all duration-300 ease-out hover:-translate-y-1 p-2.5 sm:p-3.5 lg:p-4 ${className}`}
    >
      {/* Top Visual Physical Gift Card Artwork */}
      <div className="relative w-full aspect-[16/10] rounded-lg sm:rounded-xl overflow-hidden border border-slate-900/10 dark:border-slate-700/30 bg-slate-900 mb-2 sm:mb-3 transform group-hover:-translate-y-0.5 group-hover:scale-[1.015] transition-all duration-300 ease-out">
        
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
            alt={`${name} digital gift card`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setIsImageLoaded(true)}
            onError={(e) => {
              if (slug === 'spotify' && (e.currentTarget as HTMLImageElement).src !== window.location.origin + '/cards/spotify.png') {
                (e.currentTarget as HTMLImageElement).src = '/cards/spotify.png';
                return;
              }
              setIsImageError(true);
            }}
            className={`w-full h-full object-cover select-none transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${themeColor.bgGradient} p-3 sm:p-4 flex flex-col justify-between text-white`}>
            <span className="text-[10px] font-mono uppercase">{symbol}</span>
            <span className="font-extrabold text-sm sm:text-base">{name}</span>
          </div>
        )}

        {/* Physical Card Ambient Specular Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none mix-blend-overlay" />
        
        {/* Subtle Inner Bevel / Laminated Border */}
        <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-white/25 pointer-events-none" />

        {/* Stock & Instant Delivery Indicators */}
        <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2.5 z-20 flex items-center gap-1 sm:gap-1.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold text-[#86A98D] border border-[#86A98D]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#86A98D] animate-pulse"></span>
            In Stock
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold text-amber-300 border border-amber-500/30">
            Instant
          </span>
        </div>
      </div>

      {/* Brand Name Centered */}
      <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base text-center leading-snug mb-2 sm:mb-3 line-clamp-1">
        {name}
      </h3>

      {/* Two Action Buttons */}
      <div className="mt-auto space-y-1.5 sm:space-y-2">
        <Link
          to={`/gift-cards/${slug}${queryString}`}
          id={`btn-buy-${slug}`}
          className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Buy Gift Card</span>
        </Link>

        <Link
          to={`/validate?card=${slug}`}
          id={`btn-validate-${slug}`}
          className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-[#2563EB] dark:border-blue-500 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
          <span>Check Card Status</span>
        </Link>
      </div>
    </div>
  );
};

