import React from 'react';

export interface GiftCardSkeletonProps {
  className?: string;
}

export const GiftCardSkeleton: React.FC<GiftCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 overflow-hidden select-none ${className}`}
    >
      {/* Shimmer overlay sweep */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-100/70 dark:via-slate-800/60 to-transparent pointer-events-none z-10" />

      {/* Top Visual Physical Card Artwork Skeleton */}
      <div className="relative w-full aspect-[16/10] rounded-xl bg-slate-200 dark:bg-slate-800 mb-4.5 overflow-hidden animate-pulse">
        {/* Decorative inner chip & logo placeholder */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-300/70 dark:bg-slate-700/60" />
        <div className="absolute bottom-3 left-3 w-24 h-4 rounded bg-slate-300/70 dark:bg-slate-700/60" />
      </div>

      {/* Brand Title Skeleton */}
      <div className="h-6 w-3/5 mx-auto bg-slate-200 dark:bg-slate-800 rounded-md mb-6 animate-pulse" />

      {/* Two Action Button Skeletons */}
      <div className="mt-auto space-y-2.5">
        {/* Buy Button Skeleton */}
        <div className="w-full h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        {/* Validate Button Skeleton */}
        <div className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      </div>
    </div>
  );
};

export const GiftCardSkeletonGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <GiftCardSkeleton key={`gift-card-skeleton-${index}`} />
      ))}
    </div>
  );
};
