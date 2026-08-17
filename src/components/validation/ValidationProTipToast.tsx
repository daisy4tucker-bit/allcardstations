import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  X, 
  Wand2, 
  Layers, 
  HelpCircle, 
  Check, 
  AlertTriangle,
} from 'lucide-react';
import { CardFormatAnalysis, CardFormatIssue } from '../../utils/cardFormatChecker';

export interface ValidationProTipToastProps {
  analysis: CardFormatAnalysis;
  brandName: string;
  brandId: string;
  currentCode: string;
  currentCurrency: string;
  onApplyCleanedCode?: (cleanCode: string) => void;
  onOpenWhereIsMyCode?: () => void;
  onClose?: () => void;
  onSelectCurrency?: (currency: string) => void;
}

export const ValidationProTipToast: React.FC<ValidationProTipToastProps> = ({
  analysis,
  brandName,
  brandId,
  currentCode,
  currentCurrency,
  onApplyCleanedCode,
  onOpenWhereIsMyCode,
  onClose,
  onSelectCurrency,
}) => {
  const [appliedClean, setAppliedClean] = useState(false);

  const primaryIssue = analysis.issues[0] || null;

  const handleApplyClean = () => {
    if (onApplyCleanedCode && analysis.cleanedCode) {
      onApplyCleanedCode(analysis.cleanedCode);
      setAppliedClean(true);
      setTimeout(() => setAppliedClean(false), 2000);
    }
  };

  return (
    <div
      id="validation-pro-tip-toast"
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-[70] max-w-md w-[calc(100vw-1.5rem)] sm:w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-amber-400/80 dark:border-amber-500/70 p-4 sm:p-5 text-slate-900 dark:text-white transition-all transform animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Lightbulb className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/80">
                {analysis.hasFormatIssues ? 'FORMAT FIX & PRO-TIPS' : 'VALIDATION PRO-TIPS'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
              {analysis.hasFormatIssues ? 'Format Issue Detected' : `${brandName} Validation Tips`}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss pro-tip"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Issue Highlight Box (If active issue detected) */}
      {primaryIssue ? (
        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                {primaryIssue.title}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11.5px] mt-0.5 leading-relaxed">
                {primaryIssue.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 mb-3 text-xs">
          <p className="font-semibold text-blue-900 dark:text-blue-200">
            Quick tips to ensure successful card verification:
          </p>
        </div>
      )}

      {/* Actionable Checklist & Fix Tips */}
      <div className="space-y-2 mb-3.5 text-xs">
        {/* Hidden Characters Tip */}
        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <span className="text-[11.5px]">
            <strong className="text-slate-900 dark:text-white font-semibold">Hidden characters:</strong> Watch out for trailing spaces, invisible unicode, or extra hyphens copied from email receipts.
          </span>
        </div>

        {/* Letter vs Digit Confusion Tip */}
        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <span className="text-[11.5px]">
            <strong className="text-slate-900 dark:text-white font-semibold">Scratch confusion:</strong> Double check <span className="font-mono font-bold text-amber-700 dark:text-amber-400">O vs 0</span>, <span className="font-mono font-bold text-amber-700 dark:text-amber-400">I vs 1</span>, <span className="font-mono font-bold text-amber-700 dark:text-amber-400">S vs 5</span>, or <span className="font-mono font-bold text-amber-700 dark:text-amber-400">B vs 8</span> under silver foil.
          </span>
        </div>

        {/* Brand Specific Hint */}
        {analysis.brandSpecificTip && (
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 p-2 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white font-semibold">{brandName} Guidance:</strong> {analysis.brandSpecificTip}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Quick Fix Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {onApplyCleanedCode && analysis.hasCleanedDifference && analysis.cleanedCode && (
          <button
            type="button"
            onClick={handleApplyClean}
            id="btn-apply-cleaned-card-code"
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            {appliedClean ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Cleaned & Applied!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Clean Code</span>
              </>
            )}
          </button>
        )}

        {onOpenWhereIsMyCode && (
          <button
            type="button"
            onClick={onOpenWhereIsMyCode}
            id="btn-open-where-is-code-from-toast"
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Where is Code?</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer ml-auto"
        >
          Got it
        </button>
      </div>

      {/* Currency Switcher Quick Bar */}
      {onSelectCurrency && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Card Currency:</span>
          <div className="flex items-center gap-1">
            {['USD', 'CAD', 'GBP', 'EUR', 'AUD'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onSelectCurrency(curr)}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  currentCurrency === curr
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
