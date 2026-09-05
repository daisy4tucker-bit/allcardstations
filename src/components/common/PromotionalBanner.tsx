import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Tag, Clock, ArrowRight, Copy, Check, Flame, X, Percent, Gift } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PromotionalBannerProps {
  variant?: 'full' | 'compact' | 'strip';
  badgeText?: string;
  title?: string;
  description?: string;
  discountCode?: string;
  discountPercentage?: number;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  expiresInHours?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  variant = 'full',
  badgeText = '⚡ FLASH DEALS',
  title = 'Special Discount: Save Up To 15% On Selected Cards',
  description = 'Instant delivery with verified balances on top Gaming, Shopping, and Entertainment gift cards.',
  discountCode = 'VAULT15',
  discountPercentage = 15,
  ctaText = 'Shop Featured Deals',
  ctaLink = '/gift-cards?discount=true',
  secondaryCtaText = 'View All Cards',
  secondaryCtaLink = '/gift-cards',
  expiresInHours = 12,
  dismissible = true,
  onDismiss,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Live countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>(() => {
    return { hours: expiresInHours, minutes: 42, seconds: 18 };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (discountCode) {
      navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  if (isDismissed) return null;

  // Format countdown string
  const formatNum = (num: number) => String(num).padStart(2, '0');

  /* VARIANT 1: STRIP (Compact Top Header / Ribbon) */
  if (variant === 'strip') {
    return (
      <div className={`relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-4 py-2.5 text-xs sm:text-sm border-b border-indigo-500/50 shadow-sm ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
              <Flame className="w-3 h-3 fill-slate-950" /> {badgeText}
            </span>
            <span className="font-semibold text-white">{title}</span>
            {discountCode && (
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-xs bg-indigo-900/90 text-amber-300 border border-indigo-400/40 px-2 py-0.5 rounded">
                Code: <strong>{discountCode}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className="flex items-center gap-1 font-mono text-xs text-indigo-100 bg-indigo-900/70 px-2.5 py-1 rounded-lg border border-indigo-400/40">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {formatNum(timeLeft.hours)}h {formatNum(timeLeft.minutes)}m {formatNum(timeLeft.seconds)}s
              </span>
            </div>

            <Link
              to={ctaLink}
              className="inline-flex items-center gap-1 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-lg transition-colors shadow-xs"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-indigo-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* VARIANT 2: COMPACT (Card / Sidebar Banner) */
  if (variant === 'compact') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-900 dark:via-slate-900 dark:to-indigo-950 text-slate-800 dark:text-white p-5 border border-indigo-200 dark:border-indigo-500/30 shadow-md ${className}`}>
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-400/20 border border-amber-300 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" /> {badgeText}
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{title}</h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>

          {discountCode && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-blue-200 dark:border-blue-500/40 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Promo Code: <span className="font-mono font-bold text-[#2563EB] dark:text-blue-400 text-xs">{discountCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-xs font-semibold text-[#2563EB] dark:text-blue-300 hover:text-[#1D4ED8] dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[#86A98D]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>{formatNum(timeLeft.hours)}h {formatNum(timeLeft.minutes)}m left</span>
            </div>

            <Link to={ctaLink}>
              <Button variant="primary" size="sm" className="text-xs py-1.5 px-3">
                {ctaText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* VARIANT 3: FULL (Rich Home Page Section / Hero Showcase Banner) */
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-800 dark:text-white border border-indigo-200/80 dark:border-indigo-500/30 shadow-lg shadow-indigo-100/50 dark:shadow-2xl ${className}`}>
      {/* Background Decorative Ambient Shapes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer shadow-xs"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-slate-950" /> {badgeText}
              </span>

              {discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  <Percent className="w-3.5 h-3.5 text-indigo-600 dark:text-amber-400" /> Save up to {discountPercentage}%
                </span>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>
                  Ends in: <strong className="text-slate-900 dark:text-white">{formatNum(timeLeft.hours)}h {formatNum(timeLeft.minutes)}m {formatNum(timeLeft.seconds)}s</strong>
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {description}
            </p>

            {/* CTA Buttons & Promo Code Box */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link to={ctaLink}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {ctaText}
                </Button>
              </Link>

              {secondaryCtaText && secondaryCtaLink && (
                <Link to={secondaryCtaLink}>
                  <Button variant="outline" size="lg" className="border-indigo-200 dark:border-indigo-400/40 text-indigo-700 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/40">
                    {secondaryCtaText}
                  </Button>
                </Link>
              )}

              {discountCode && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-500/50 shadow-xs">
                  <Tag className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Coupon:</span>
                  <span className="font-mono font-bold text-sm text-indigo-700 dark:text-amber-300 tracking-wider">{discountCode}</span>
                  <button
                    onClick={handleCopyCode}
                    id="btn-copy-promo-code"
                    className="ml-1 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/80 hover:bg-blue-100 dark:hover:bg-blue-800 text-[#2563EB] dark:text-blue-200 hover:text-[#1D4ED8] dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy promo code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#86A98D]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Visual Card Graphic / Featured Offer Highlights */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/40 shadow-xl backdrop-blur-md space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/30 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-500/30">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Featured Offer</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Instant Code Dispatch</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-extrabold text-[#86A98D] bg-[#86A98D]/15 border border-[#86A98D]/30 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Eligible Categories:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Gaming, Retail, Streaming</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Delivery Method:</span>
                  <span className="font-semibold text-[#86A98D]">Instant Email & Vault</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Minimum Order:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">$10.00 USD</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
                🔒 100% Guaranteed authentic codes directly from authorized issuers.
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
