import React from 'react';
import { LayoutGrid, ShieldCheck, Send, CheckCircle2, LucideIcon } from 'lucide-react';
import { FeatureItem } from '../../types/giftCard';

const iconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  ShieldCheck,
  Send,
  CheckCircle2,
};

export interface FeatureCardProps {
  feature: FeatureItem;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, className = '' }) => {
  const IconComponent = iconMap[feature.iconName] || LayoutGrid;

  return (
    <div
      id={feature.id}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {feature.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
        <span>Learn more</span>
        <span className="ml-1">→</span>
      </div>
    </div>
  );
};
