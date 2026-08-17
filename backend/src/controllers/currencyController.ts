import { Request, Response } from 'express';

// In-memory cache
interface CachedRates {
  timestamp: number;
  rates: Record<string, number>;
  cryptoRates: Record<string, number>;
  updatedAt: string;
}

let cache: CachedRates | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Default fallback rates against USD if external APIs are temporarily down
const FALLBACK_FIAT_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.924,
  GBP: 0.789,
  CAD: 1.362,
  AUD: 1.528,
  JPY: 154.6,
  CHF: 0.892,
  BRL: 5.42,
  AED: 3.673,
  INR: 83.45,
  SGD: 1.348,
  NZD: 1.642,
  ZAR: 18.25,
  MXN: 17.85,
  SEK: 10.45,
  NOK: 10.62,
  TRY: 32.8,
  SAR: 3.75,
  CNY: 7.24,
};

const FALLBACK_CRYPTO_RATES_IN_USD: Record<string, number> = {
  BTC: 64200.0,
  ETH: 3450.0,
  USDT: 1.0,
  USDC: 1.0,
  LTC: 82.5,
  SOL: 145.0,
  TRX: 0.13,
};

async function fetchLiveExchangeRates(): Promise<{ rates: Record<string, number>; cryptoRates: Record<string, number> }> {
  let rates = { ...FALLBACK_FIAT_RATES };
  let cryptoRates = { ...FALLBACK_CRYPTO_RATES_IN_USD };

  // 1. Fetch Fiat Exchange Rates
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      headers: { 'User-Agent': 'AllCardStation-CurrencyEngine/1.0' },
    });
    clearTimeout(timeoutId);

    if (fiatRes.ok) {
      const data: any = await fiatRes.json();
      if (data && data.rates && typeof data.rates === 'object') {
        rates = { ...FALLBACK_FIAT_RATES, ...data.rates };
      }
    }
  } catch (err) {
    // Attempt secondary backup API for fiat
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
      const backupRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        signal: controller2.signal,
      });
      clearTimeout(timeoutId2);
      if (backupRes.ok) {
        const backupData: any = await backupRes.json();
        if (backupData && backupData.rates) {
          rates = { ...FALLBACK_FIAT_RATES, ...backupData.rates };
        }
      }
    } catch {
      // Keep fallback
    }
  }

  // 2. Fetch Live Crypto Rates
  try {
    const cryptoController = new AbortController();
    const cryptoTimeoutId = setTimeout(() => cryptoController.abort(), 4000);
    const cryptoRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin,litecoin,solana,tron&vs_currencies=usd',
      {
        signal: cryptoController.signal,
        headers: { 'User-Agent': 'AllCardStation/1.0' },
      }
    );
    clearTimeout(cryptoTimeoutId);

    if (cryptoRes.ok) {
      const cData: any = await cryptoRes.json();
      if (cData?.bitcoin?.usd) cryptoRates.BTC = cData.bitcoin.usd;
      if (cData?.ethereum?.usd) cryptoRates.ETH = cData.ethereum.usd;
      if (cData?.tether?.usd) cryptoRates.USDT = cData.tether.usd;
      if (cData?.['usd-coin']?.usd) cryptoRates.USDC = cData['usd-coin'].usd;
      if (cData?.litecoin?.usd) cryptoRates.LTC = cData.litecoin.usd;
      if (cData?.solana?.usd) cryptoRates.SOL = cData.solana.usd;
      if (cData?.tron?.usd) cryptoRates.TRX = cData.tron.usd;
    }
  } catch {
    // Attempt secondary crypto API
    try {
      const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22LTCUSDT%22,%22SOLUSDT%22,%22TRXUSDT%22%5D');
      if (binanceRes.ok) {
        const bData: any = await binanceRes.json();
        if (Array.isArray(bData)) {
          for (const item of bData) {
            if (item.symbol === 'BTCUSDT') cryptoRates.BTC = parseFloat(item.price);
            if (item.symbol === 'ETHUSDT') cryptoRates.ETH = parseFloat(item.price);
            if (item.symbol === 'LTCUSDT') cryptoRates.LTC = parseFloat(item.price);
            if (item.symbol === 'SOLUSDT') cryptoRates.SOL = parseFloat(item.price);
            if (item.symbol === 'TRXUSDT') cryptoRates.TRX = parseFloat(item.price);
          }
        }
      }
    } catch {
      // Keep fallback crypto rates
    }
  }

  return { rates, cryptoRates };
}

export async function getLiveRates(req: Request, res: Response): Promise<void> {
  const now = Date.now();

  // Return cached if fresh
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    res.json({
      success: true,
      base: 'USD',
      rates: cache.rates,
      cryptoRates: cache.cryptoRates,
      updatedAt: cache.updatedAt,
      cached: true,
    });
    return;
  }

  try {
    const { rates, cryptoRates } = await fetchLiveExchangeRates();
    const updatedAt = new Date().toISOString();

    cache = {
      timestamp: now,
      rates,
      cryptoRates,
      updatedAt,
    };

    res.json({
      success: true,
      base: 'USD',
      rates,
      cryptoRates,
      updatedAt,
      cached: false,
    });
  } catch (error: any) {
    res.json({
      success: true,
      base: 'USD',
      rates: FALLBACK_FIAT_RATES,
      cryptoRates: FALLBACK_CRYPTO_RATES_IN_USD,
      updatedAt: new Date().toISOString(),
      fallback: true,
    });
  }
}

export async function convertCurrency(req: Request, res: Response): Promise<void> {
  const { amount, from = 'USD', to = 'USD' } = req.query;

  const numAmount = parseFloat(amount as string) || 0;
  const fromCode = (from as string).toUpperCase();
  const toCode = (to as string).toUpperCase();

  // Ensure rates are available
  let rates = cache?.rates || FALLBACK_FIAT_RATES;
  if (!cache || Date.now() - cache.timestamp >= CACHE_TTL_MS) {
    try {
      const live = await fetchLiveExchangeRates();
      rates = live.rates;
      cache = {
        timestamp: Date.now(),
        rates: live.rates,
        cryptoRates: live.cryptoRates,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      // Use existing rates
    }
  }

  const fromRateAgainstUSD = rates[fromCode] || 1.0;
  const toRateAgainstUSD = rates[toCode] || 1.0;

  // Convert from source currency to USD, then from USD to target currency
  const amountInUSD = numAmount / fromRateAgainstUSD;
  const convertedAmount = amountInUSD * toRateAgainstUSD;
  const directRate = toRateAgainstUSD / fromRateAgainstUSD;

  res.json({
    success: true,
    from: fromCode,
    to: toCode,
    originalAmount: numAmount,
    convertedAmount: Number(convertedAmount.toFixed(4)),
    rate: Number(directRate.toFixed(6)),
    timestamp: cache?.updatedAt || new Date().toISOString(),
  });
}
