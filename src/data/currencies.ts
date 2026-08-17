export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // 1 USD = X Currency
  flag: string;
  popular?: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0, flag: '🇺🇸', popular: true },
  { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.924, flag: '🇪🇺', popular: true },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.789, flag: '🇬🇧', popular: true },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateAgainstUSD: 1.362, flag: '🇨🇦', popular: true },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateAgainstUSD: 1.528, flag: '🇦🇺', popular: true },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 154.6, flag: '🇯🇵', popular: true },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateAgainstUSD: 0.892, flag: '🇨🇭', popular: true },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateAgainstUSD: 5.42, flag: '🇧🇷', popular: true },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 83.45, flag: '🇮🇳', popular: true },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateAgainstUSD: 3.673, flag: '🇦🇪' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', rateAgainstUSD: 1.348, flag: '🇸🇬' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateAgainstUSD: 1.642, flag: '🇳🇿' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateAgainstUSD: 18.25, flag: '🇿🇦' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rateAgainstUSD: 17.85, flag: '🇲🇽' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateAgainstUSD: 10.45, flag: '🇸🇪' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateAgainstUSD: 32.8, flag: '🇹🇷' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateAgainstUSD: 3.75, flag: '🇸🇦' },
];

export const getCurrencyByCode = (code: string, dynamicRates?: Record<string, number>): CurrencyOption => {
  const base = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || SUPPORTED_CURRENCIES[0];
  if (dynamicRates && dynamicRates[base.code]) {
    return {
      ...base,
      rateAgainstUSD: dynamicRates[base.code],
    };
  }
  return base;
};

export const formatCurrencyAmount = (
  amount: number,
  currencyCode: string = 'USD'
): string => {
  const curr = getCurrencyByCode(currencyCode);
  if (curr.code === 'JPY') {
    return `${curr.symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${curr.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Convert an amount from USD (or base currency) to target currency using live rates
export const convertAmount = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  liveRates?: Record<string, number>
): { convertedAmount: number; rate: number } => {
  const fromCode = fromCurrency.toUpperCase();
  const toCode = toCurrency.toUpperCase();
  
  const fromRate = liveRates?.[fromCode] ?? getCurrencyByCode(fromCode).rateAgainstUSD;
  const toRate = liveRates?.[toCode] ?? getCurrencyByCode(toCode).rateAgainstUSD;

  // Convert to USD first, then to target currency
  const inUSD = amount / (fromRate || 1.0);
  const converted = inUSD * (toRate || 1.0);
  const rate = (toRate || 1.0) / (fromRate || 1.0);

  return {
    convertedAmount: Number(converted.toFixed(2)),
    rate: Number(rate.toFixed(4)),
  };
};

// Estimate crypto conversion from fiat amount using live crypto and fiat rates
export const calculateCryptoEquivalent = (
  fiatAmount: number,
  fiatCurrencyCode: string,
  cryptoCode: string,
  liveFiatRates?: Record<string, number>,
  liveCryptoRates?: Record<string, number>
): { cryptoAmount: string; cryptoPriceUsd: number; live: boolean } => {
  const fiatRate = liveFiatRates?.[fiatCurrencyCode.toUpperCase()] ?? getCurrencyByCode(fiatCurrencyCode).rateAgainstUSD;
  const usdAmount = fiatAmount / (fiatRate || 1.0);

  // Default crypto prices in USD
  const defaultCryptoPrices: Record<string, number> = {
    BTC: 64200,
    ETH: 3450,
    USDT: 1.0,
    USDC: 1.0,
    LTC: 82.5,
    SOL: 145.0,
    TRX: 0.13,
  };

  const isLive = Boolean(liveCryptoRates && liveCryptoRates[cryptoCode.toUpperCase()]);
  const price = liveCryptoRates?.[cryptoCode.toUpperCase()] || defaultCryptoPrices[cryptoCode.toUpperCase()] || 64200;
  const rawCryptoAmount = usdAmount / price;

  let formattedAmount = '';
  if (cryptoCode === 'BTC' || cryptoCode === 'ETH') {
    formattedAmount = rawCryptoAmount.toFixed(8);
  } else if (cryptoCode === 'LTC') {
    formattedAmount = rawCryptoAmount.toFixed(6);
  } else if (cryptoCode === 'SOL') {
    formattedAmount = rawCryptoAmount.toFixed(4);
  } else if (cryptoCode === 'TRX') {
    formattedAmount = rawCryptoAmount.toFixed(2);
  } else {
    formattedAmount = rawCryptoAmount.toFixed(2);
  }

  return {
    cryptoAmount: formattedAmount,
    cryptoPriceUsd: price,
    live: isLive,
  };
};
