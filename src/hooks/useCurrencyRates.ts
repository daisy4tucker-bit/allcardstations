import { useState, useEffect, useCallback } from 'react';
import { 
  SUPPORTED_CURRENCIES, 
  getCurrencyByCode, 
  formatCurrencyAmount, 
  convertAmount, 
  calculateCryptoEquivalent 
} from '../data/currencies';

export interface CurrencyRatesState {
  base: string;
  rates: Record<string, number>;
  cryptoRates: Record<string, number>;
  updatedAt: string | null;
  isLoading: boolean;
  isLive: boolean;
  error: string | null;
}

export function useCurrencyRates() {
  const [ratesState, setRatesState] = useState<CurrencyRatesState>({
    base: 'USD',
    rates: Object.fromEntries(SUPPORTED_CURRENCIES.map((c) => [c.code, c.rateAgainstUSD])),
    cryptoRates: {
      BTC: 64200,
      ETH: 3450,
      USDT: 1.0,
      USDC: 1.0,
      LTC: 82.5,
      SOL: 145.0,
      TRX: 0.13,
    },
    updatedAt: null,
    isLoading: true,
    isLive: false,
    error: null,
  });

  const fetchRates = useCallback(async () => {
    try {
      setRatesState((prev) => ({ ...prev, isLoading: true, error: null }));
      const res = await fetch('/api/currency/rates');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.rates) {
        setRatesState({
          base: data.base || 'USD',
          rates: data.rates,
          cryptoRates: data.cryptoRates || {
            BTC: 64200,
            ETH: 3450,
            USDT: 1.0,
            USDC: 1.0,
            LTC: 82.5,
            SOL: 145.0,
            TRX: 0.13,
          },
          updatedAt: data.updatedAt || new Date().toISOString(),
          isLoading: false,
          isLive: true,
          error: null,
        });
      }
    } catch (err: any) {
      console.warn('Real-time currency rates fetch error, fallback in use:', err.message);
      setRatesState((prev) => ({
        ...prev,
        isLoading: false,
        isLive: false,
        error: 'Live rates temporarily unavailable. Using standard fallback rates.',
      }));
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Poll every 60 seconds
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  // Convert fiat amount from one currency to another using live rates
  const convert = useCallback(
    (amount: number, fromCurrency: string = 'USD', toCurrency: string = 'USD') => {
      return convertAmount(amount, fromCurrency, toCurrency, ratesState.rates);
    },
    [ratesState.rates]
  );

  // Format currency with live symbol & precision
  const format = useCallback((amount: number, currencyCode: string = 'USD') => {
    return formatCurrencyAmount(amount, currencyCode);
  }, []);

  // Compute live crypto quote
  const getCryptoQuote = useCallback(
    (fiatAmount: number, fiatCurrencyCode: string, cryptoCode: string) => {
      return calculateCryptoEquivalent(
        fiatAmount,
        fiatCurrencyCode,
        cryptoCode,
        ratesState.rates,
        ratesState.cryptoRates
      );
    },
    [ratesState.rates, ratesState.cryptoRates]
  );

  return {
    ...ratesState,
    refreshRates: fetchRates,
    convert,
    format,
    getCryptoQuote,
  };
}
