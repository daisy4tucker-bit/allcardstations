import React from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck, MapPin, Globe, Star } from 'lucide-react';

export const TrustpilotProofSection: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs my-8 overflow-hidden">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00B67A]/10 text-[#00B67A] flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-[#00B67A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                AllCardStatus Verified on Trustpilot
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Claimed Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official Third-Party Merchant Verification & Authenticity Records
            </p>
          </div>
        </div>

        <a
          href="https://www.trustpilot.com/review/allcardstatus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <span>View on Trustpilot</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Proof Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center">
        {/* Left Column: Image Snapshot of Claimed Profile */}
        <div className="md:col-span-6 lg:col-span-5">
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2 shadow-inner group">
            <img
              src="/trustpilot-claimed-badge.svg"
              alt="AllCardStatus Claimed Profile on Trustpilot (14 Reviews, Verified Domain allcardstatus.com, United States)"
              className="w-full h-auto rounded-lg object-contain shadow-xs transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2">
            Snapshot: Verified Claimed Profile on Trustpilot with 14 Customer Reviews
          </p>
        </div>

        {/* Right Column: Key Facts & Disambiguation Statements */}
        <div className="md:col-span-6 lg:col-span-7 space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Independent Digital Gift Card Marketplace</span>
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">
              <strong>AllCardStatus</strong> is an independent digital gift card marketplace and validation platform for retail and gaming e-gift vouchers (Apple, Steam, Amazon, Xbox, PlayStation). AllCardStatus is not a government agency, voter registration portal, or banking entity, and does not process government voter ID cards, national identification records, or credit/debit banking cards.
            </p>
            <p className="leading-relaxed text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 font-medium">
              AllCardStatus is an independent digital gift card marketplace and is <strong>not affiliated with or connected to prepaidcardstatus</strong>, government agencies, or financial institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registered: United States</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Domain: allcardstatus.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
