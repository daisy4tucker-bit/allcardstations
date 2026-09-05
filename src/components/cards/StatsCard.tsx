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
  badgeType?: 'success' | 'blue' | 'amber' | 'sage' | 'indigo' | 'emerald';
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
  badgeType = 'blue',
  isLive = false,
  timeframeBreakdown,
  className = '' 
}) => {
  const IconComponent = iconMap[stat.iconName] || ShoppingBag;

  const badgeStyles = {
    blue: 'bg-blue-50 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-blue-800/80',
    indigo: 'bg-blue-50 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-blue-800/80',
    sage: 'bg-[#86A98D]/15 text-[#86A98D] border-[#86A98D]/30',
    emerald: 'bg-[#86A98D]/15 text-[#86A98D] border-[#86A98D]/30',
    success: 'bg-[#86A98D]/15 text-[#86A98D] border-[#86A98D]/30',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
  };

  return (
    <div
      id={stat.id}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <IconComponent className="w-5 h-5" />
          </div>

          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          )}

          {!isLive && badge && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyles[badgeType] || badgeStyles.blue}`}>
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
              <div className="text-[10px] uppercase font-bold text-[#2563EB] dark:text-blue-400">{timeframeBreakdown.todayLabel}</div>
              <div className="font-extrabold text-[#2563EB] dark:text-blue-300 font-mono text-xs sm:text-sm">{timeframeBreakdown.todayValue}</div>
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
