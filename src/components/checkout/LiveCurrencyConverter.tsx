import React, { useState } from 'react';
import { 
  Globe, 
  RefreshCw, 
  ArrowRightLeft, 
  TrendingUp, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Coins
} from 'lucide-react';
import { 
  SUPPORTED_CURRENCIES, 
  CurrencyOption, 
  getCurrencyByCode, 
  formatCurrencyAmount, 
  convertAmount, 
  calculateCryptoEquivalent 
} from '../../data/currencies';

interface LiveCurrencyConverterProps {
  cardAmount: number;
  cardBaseCurrency?: string;
  selectedLocalCurrency: string;
  onSelectCurrency: (currencyCode: string) => void;
  liveRates: Record<string, number>;
  cryptoRates: Record<string, number>;
  isLive: boolean;
  isLoading: boolean;
  updatedAt: string | null;
  onRefresh: () => void;
  cryptoCurrency?: string;
}

export const LiveCurrencyConverter: React.FC<LiveCurrencyConverterProps> = ({
  cardAmount,
  cardBaseCurrency = 'USD',
  selectedLocalCurrency,
  onSelectCurrency,
  liveRates,
  cryptoRates,
  isLive,
  isLoading,
  updatedAt,
  onRefresh,
  cryptoCurrency = 'USDT',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFolded, setIsFolded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const safeAmount = cardAmount > 0 ? cardAmount : 50;

  // Active user-selected currency details
  const activeCurrencyObj = getCurrencyByCode(selectedLocalCurrency, liveRates);
  const activeRateAgainstUSD = liveRates[selectedLocalCurrency.toUpperCase()] || activeCurrencyObj.rateAgainstUSD || 1.0;

  // Amount in USD equivalent
  const amountInUSD = safeAmount / activeRateAgainstUSD;

  // Exchange rate representations
  const rate1UserCurrInUSD = 1 / activeRateAgainstUSD;
  const rate1USDInUserCurr = activeRateAgainstUSD;

  // Real-time Crypto conversion based on user's selected amount & currency plus 5.499% platform service fee
  const totalAmountWithFee = safeAmount * 1.05499;
  const cryptoQuote = calculateCryptoEquivalent(
    totalAmountWithFee,
    selectedLocalCurrency,
    cryptoCurrency,
    liveRates,
    cryptoRates
  );

  const cryptoPrice = cryptoRates[cryptoCurrency.toUpperCase()] || 64200;

  // Filter supported currencies for search
  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  // Popular currencies for quick reference bar
  const quickCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'BRL', 'INR'];

  if (isFolded) {
    return (
      <div 
        onClick={() => setIsFolded(false)}
        className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/60 p-4 shadow-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                Live Local Currency Conversion
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Folded • {activeCurrencyObj.code} Chosen
              </span>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-2">
              <span>{activeCurrencyObj.flag} {activeCurrencyObj.name} ({activeCurrencyObj.code})</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrencyAmount(safeAmount, selectedLocalCurrency)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFolded(false);
          }}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
        >
          Change Currency
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-4 sm:p-5 shadow-xs transition-all">
      {/* Header with Live Status badge & Refresh button */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Local Currency Conversion
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLive 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isLive ? 'Live API Rates' : 'Standard Rates'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live valuation for {activeCurrencyObj.flag} {activeCurrencyObj.name} ({activeCurrencyObj.code}) • Updated {formattedTime}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh real-time conversion rates"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Main Converted Display Card centered around the User's Chosen Currency and Amount */}
      <div className="bg-white dark:bg-slate-950/80 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50 shadow-xs mb-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* User's Chosen Amount & Benchmark */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Your Selected Amount & Currency</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {formatCurrencyAmount(safeAmount, selectedLocalCurrency)}
              </span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {activeCurrencyObj.code}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>USD Benchmark:</span>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {formatCurrencyAmount(amountInUSD, 'USD')} USD
              </span>
            </div>
          </div>

          {/* Crypto Equivalent & Live Exchange Rate */}
          <div className="sm:text-right sm:border-l sm:border-slate-100 dark:sm:border-slate-800/80 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex sm:justify-end items-center gap-1">
              <Coins className="w-3 h-3 text-amber-500" />
              <span>Est. Crypto Equivalent ({cryptoCurrency})</span>
            </div>
            
            <div className="text-lg sm:text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              ~ {cryptoQuote.cryptoAmount} {cryptoCurrency}
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex sm:justify-end items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
              {selectedLocalCurrency.toUpperCase() === 'USD' ? (
                <span>Base Currency USD (1.0000)</span>
              ) : (
                <span>
                  1 {activeCurrencyObj.code} = ${rate1UserCurrInUSD.toFixed(4)} USD • 1 USD = {rate1USDInUserCurr.toFixed(4)} {activeCurrencyObj.code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};
