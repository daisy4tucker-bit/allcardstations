import React from 'react';
import { 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  Sparkles,
  LucideIcon 
} from 'lucide-react';
import { StatItem } from '../../types/giftCard';

const iconMap: Record<string, LucideIcon> = {
  ShoppingBag,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Activity,
  Sparkles,
};

export interface StatsCardProps {
  stat: StatItem;
  badge?: string;
  badgeType?: 'success' | 'indigo' | 'amber' | 'emerald';
  isLive?: boolean;
  timeframeBreakdown?: {
    overallValue: string;
    overallLabel: string;
    todayValue: string;
    todayLabel: string;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  stat, 
  badge,
  badgeType = 'indigo',
  isLive = false,
  timeframeBreakdown,
  className = '' 
}) => {
  const IconComponent = iconMap[stat.iconName] || ShoppingBag;

  const badgeStyles = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    success: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
  };

  return (
    <div
      id={stat.id}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <IconComponent className="w-5 h-5" />
          </div>

          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          )}

          {!isLive && badge && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyles[badgeType]}`}>
              {badge}
            </span>
          )}
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
          {stat.value}
        </div>
        
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
          {stat.label}
        </div>

        {/* Dual Metric Breakdown (Overall vs Today) */}
        {timeframeBreakdown && (
          <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs">
            <div className="border-r border-slate-200 dark:border-slate-700 pr-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">{timeframeBreakdown.overallLabel}</div>
              <div className="font-extrabold text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm">{timeframeBreakdown.overallValue}</div>
            </div>
            <div className="pl-1">
              <div className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400">{timeframeBreakdown.todayLabel}</div>
              <div className="font-extrabold text-indigo-600 dark:text-indigo-300 font-mono text-xs sm:text-sm">{timeframeBreakdown.todayValue}</div>
            </div>
          </div>
        )}
      </div>

      {stat.description && (
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          {stat.description}
        </div>
      )}
    </div>
  );
};
