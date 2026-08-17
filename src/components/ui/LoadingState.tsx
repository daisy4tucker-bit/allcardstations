import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { GiftCardSkeletonGrid } from '../cards/GiftCardSkeleton';

export interface LoadingStateProps {
  count?: number;
  message?: string;
  showProgressBar?: boolean;
  progress?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  count = 8, 
  message = 'Fetching verified gift cards...',
  showProgressBar = true,
  progress,
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress & Status Banner */}
      {showProgressBar && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span>{message}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Querying inventory nodes</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            {typeof progress === 'number' ? (
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            ) : (
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full w-1/3 animate-indeterminate" />
            )}
          </div>
        </div>
      )}

      {/* Grid of Skeleton Cards with Shimmer Effect */}
      <GiftCardSkeletonGrid count={count} />
    </div>
  );
};
