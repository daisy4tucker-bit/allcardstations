import React from 'react';
import { Sparkles, Info, ShieldAlert, KeyRound, Hash, HelpCircle, CheckCircle } from 'lucide-react';
import { CardValidationRequirement } from '../../data/cardValidationRequirements';

interface BrandCardRequirementBannerProps {
  brandName: string;
  requirement: CardValidationRequirement;
  codeLengthCurrent: number;
}

export const BrandCardRequirementBanner: React.FC<BrandCardRequirementBannerProps> = ({
  brandName,
  requirement,
  codeLengthCurrent
}) => {
  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-900 p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {brandName} Verification Specifications
            </h4>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
              Live criteria required by merchant gateway
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/70 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-3 w-3" /> Live Protocol
        </span>
      </div>

      {/* Visual Scratch-Off Guide Card */}
      <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-3 flex items-start gap-2.5">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
          <Info className="h-3.5 w-3.5" />
        </div>
        <div className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed">
          <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
            Card Back & Scratch-Off Instruction:
          </span>
          {requirement.scratchInstruction}
        </div>
      </div>

      {/* Key Requirement Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Code Format Rule */}
        <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-2.5">
          <Hash className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Format Rule
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
              {requirement.codeLengthRule}
            </span>
          </div>
        </div>

        {/* PIN / Security requirement */}
        <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-2.5">
          <ShieldAlert className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Security PIN
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
              {requirement.pinRequired 
                ? (requirement.pinLabel || 'Required PIN / CVV')
                : 'Not required for this brand'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Code Character Progress Tracker */}
      <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-2.5">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            {codeLengthCurrent >= 6 ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            Real-time Code Format Match:
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {codeLengthCurrent} characters entered
          </span>
        </div>
        
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Expected structure: </span>
          {requirement.codeRegexDescription}
        </p>
      </div>

      {/* Verification Tips */}
      {requirement.quickCheckTips && requirement.quickCheckTips.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> Quick Authentication Tips
          </span>
          <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            {requirement.quickCheckTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
