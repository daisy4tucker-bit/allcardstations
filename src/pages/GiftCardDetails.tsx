import React, { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle, 
  Clock, 
  Lock, 
  ArrowLeft, 
  Info, 
  Heart, 
  Globe, 
  Edit3, 
  Sparkles, 
  DollarSign 
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TopProgressBar } from '../components/ui/TopProgressBar';
import { GIFT_CARDS } from '../data/brands';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_CURRENCIES, getCurrencyByCode, formatCurrencyAmount } from '../data/currencies';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { LiveCurrencyConverter } from '../components/checkout/LiveCurrencyConverter';
import { OpenGraphMeta } from '../components/common/OpenGraphMeta';

export const GiftCardDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const card = GIFT_CARDS.find((c) => c.slug === slug);
  const { isFavorite, toggleFavorite } = useAuth();

  // Live Currency & Crypto Rates
  const {
    rates: liveRates,
    cryptoRates,
    isLive,
    isLoading: isRatesLoading,
    updatedAt: ratesUpdatedAt,
    refreshRates,
  } = useCurrencyRates();

  // Currency selection state (defaults to URL param, card currency, or USD)
  const urlCurrency = searchParams.get('currency');
  const defaultCurrencyCode = (urlCurrency && SUPPORTED_CURRENCIES.some(c => c.code.toLowerCase() === urlCurrency.toLowerCase()))
    ? SUPPORTED_CURRENCIES.find(c => c.code.toLowerCase() === urlCurrency.toLowerCase())!.code
    : (card?.currency && SUPPORTED_CURRENCIES.some(c => c.code === card.currency) ? card.currency : 'USD');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrencyCode);
  const [isCurrencyFolded, setIsCurrencyFolded] = useState<boolean>(false);

  // Amount input state
  const initialAmountParam = searchParams.get('amount');
  const parsedInitial = initialAmountParam ? Number(initialAmountParam) : '';
  const initialAmountStr = !isNaN(Number(parsedInitial)) && Number(parsedInitial) >= 50 ? parsedInitial.toString() : '';

  const [amountInput, setAmountInput] = useState<string>(initialAmountStr);
  const [amountError, setAmountError] = useState<string>('');

  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);

  const activeCurrency = getCurrencyByCode(selectedCurrency, liveRates);

  const effectiveAmount = Number(amountInput) || 0;
  const isValidAmount = effectiveAmount >= 50 && effectiveAmount <= 10000;

  const platformServiceFee = effectiveAmount * 0.05499;
  const totalOrderPrice = effectiveAmount + platformServiceFee;

  const handleAmountChange = (val: string) => {
    // Allow digits and at most one decimal point
    const cleaned = val.replace(/[^0-9.]/g, '');
    setAmountInput(cleaned);

    const num = Number(cleaned);
    if (!cleaned) {
      setAmountError('Please enter an amount.');
    } else if (isNaN(num)) {
      setAmountError('Please enter a valid numeric amount.');
    } else if (num < 50) {
      setAmountError(`Minimum card amount is ${activeCurrency.symbol}50.`);
    } else if (num > 10000) {
      setAmountError(`Maximum card amount is ${activeCurrency.symbol}10,000.`);
    } else {
      setAmountError('');
    }
  };

  const handleStartCheckout = () => {
    if (!isValidAmount || !amountInput) {
      setAmountError(`Please enter a card amount (min ${activeCurrency.symbol}50).`);
      return;
    }

    setIsProcessingCheckout(true);
    setTimeout(() => {
      setIsProcessingCheckout(false);
      navigate(`/checkout/${slug}?amount=${totalOrderPrice}&cardAmount=${effectiveAmount}&currency=${selectedCurrency}`);
    }, 400);
  };

  if (!card) {
    return (
      <PageContainer
        breadcrumbs={[
          { label: 'Gift Cards', path: '/gift-cards' },
          { label: 'Card Not Found' },
        ]}
      >
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Gift Card Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            The requested gift card brand could not be found or may have been updated.
          </p>
          <Link to="/gift-cards">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to All Gift Cards
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const {
    name,
    category,
    region,
    description,
    longDescription,
    availableDenominations = [50, 100, 200, 250, 500],
    themeColor,
    symbol,
    redemptionType,
    terms,
  } = card;

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Gift Cards', path: '/gift-cards' },
        { label: category, path: `/gift-cards?category=${encodeURIComponent(category)}` },
        { label: name },
      ]}
    >
      <OpenGraphMeta
        title={`Buy ${name} Gift Card Online - Instant Email Delivery | AllCardVault`}
        description={`Purchase digital ${name} gift cards with instant 256-bit encrypted delivery. ${description}`}
        image={card.image}
        type="product"
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Visual Gift Card & Feature Highlights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Visual Gift Card Display */}
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-slate-900/10 dark:border-slate-700/30 bg-slate-900">
            {card.image ? (
              <img
                src={card.image}
                alt={`${name} gift card`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div
                className={`relative w-full h-full bg-gradient-to-br ${themeColor?.bgGradient || 'from-indigo-600 to-indigo-900'} p-6 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs uppercase font-mono tracking-widest font-bold">eGift Card</span>
                  <span className="text-xs font-mono font-extrabold bg-white/20 px-2.5 py-1 rounded-md">{symbol}</span>
                </div>
                <div className="text-white font-extrabold text-2xl drop-shadow-md">{name}</div>
                <div className="flex items-center justify-between text-xs text-white/90">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified</span>
                  <span>{region} • {redemptionType}</span>
                </div>
              </div>
            )}

            {/* Physical Card Ambient Specular Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none mix-blend-overlay" />

            {/* Subtle Inner Bevel / Laminated Border */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25 pointer-events-none" />

            {/* Overlaid Selected Denomination & Currency Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="text-sm font-mono font-extrabold text-white bg-slate-950/85 px-3.5 py-1.5 rounded-xl border border-white/25 shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                <span>{activeCurrency.symbol}{effectiveAmount > 0 ? effectiveAmount : '--'}</span>
                <span className="text-[11px] text-slate-300 font-normal">{activeCurrency.code}</span>
              </span>
            </div>
          </div>

          {/* Key Card Guarantees / Features Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3.5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              AllCardVault Assurance
            </h4>

            <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Instant Digital Delivery:</span> Delivered to your email and account portal.
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Zero Maintenance Fees:</span> Card balance never expires with no deduction fees.
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Authentic Code Guarantee:</span> Direct authorized digital balance redemption.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details, Currency Picker, Custom/Preset Amount, Checkout Action */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          {/* Header & Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <Badge variant="primary" size="md">
              {category}
            </Badge>
            <Badge variant="default" size="md">
              Region: {region}
            </Badge>
            <Badge variant="success" size="md">
              {redemptionType}
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {name}
            </h1>
            <button
              type="button"
              id={`btn-fav-detail-${slug}`}
              onClick={() => toggleFavorite(slug!)}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isFavorite(slug!)
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
              }`}
              title={isFavorite(slug!) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite(slug!) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {longDescription || description}
          </p>

          <hr className="border-slate-100 dark:border-slate-800 mb-6" />

          {/* Currency Selection Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Currency</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Selected: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activeCurrency.name} ({activeCurrency.code})</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCurrencyFolded(!isCurrencyFolded)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-1"
                >
                  {isCurrencyFolded ? 'Change' : 'Fold'}
                </button>
              </div>
            </div>

            {isCurrencyFolded ? (
              <div 
                onClick={() => setIsCurrencyFolded(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{activeCurrency.flag}</span>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {activeCurrency.code} — {activeCurrency.name} ({activeCurrency.symbol})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Currency chosen successfully • Click to change or unfold
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Change
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SUPPORTED_CURRENCIES.slice(0, 10).map((curr) => {
                  const isCurSelected = selectedCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      id={`btn-curr-${curr.code}`}
                      onClick={() => {
                        setSelectedCurrency(curr.code);
                        setIsCurrencyFolded(true);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isCurSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{curr.flag}</span>
                      <span>{curr.code}</span>
                      <span className="text-slate-400 font-normal text-[11px]">({curr.symbol})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="input-card-amount" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Enter Card Amount ({activeCurrency.code})
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Min {activeCurrency.symbol}50 • Max {activeCurrency.symbol}10,000
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold font-mono text-base pointer-events-none">
                {activeCurrency.symbol}
              </div>
              <input
                type="number"
                min="50"
                max="10000"
                step="1"
                id="input-card-amount"
                placeholder="Enter amount (min. 50)"
                value={amountInput}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-16 pr-16 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                {activeCurrency.code}
              </div>
            </div>

            {amountError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amountError}</span>
              </p>
            )}
          </div>

          {/* Real-time Live Currency Conversion API Box */}
          <div className="mb-6">
            <LiveCurrencyConverter
              cardAmount={effectiveAmount > 0 ? effectiveAmount : 50}
              cardBaseCurrency={card?.currency || 'USD'}
              selectedLocalCurrency={selectedCurrency}
              onSelectCurrency={(curr) => setSelectedCurrency(curr)}
              liveRates={liveRates}
              cryptoRates={cryptoRates}
              isLive={isLive}
              isLoading={isRatesLoading}
              updatedAt={ratesUpdatedAt}
              onRefresh={refreshRates}
              cryptoCurrency="USDT"
            />
          </div>

          {/* Order Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 mb-8 space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
              <span>Selected Amount & Currency:</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {formatCurrencyAmount(effectiveAmount, selectedCurrency)} ({activeCurrency.code})
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Estimated Delivery:</span>
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                Digital Delivery (&lt; 1 min)
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
              <span>Platform Service Fee (5.499%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrencyAmount(platformServiceFee, selectedCurrency)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900 dark:text-white">Total Order Price:</span>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrencyAmount(totalOrderPrice, selectedCurrency)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{activeCurrency.code}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <Button
              id="btn-continue-checkout"
              size="lg"
              variant="primary"
              onClick={handleStartCheckout}
              disabled={!isValidAmount || !amountInput}
              isLoading={isProcessingCheckout}
              className="w-full text-base py-3.5 shadow-md shadow-indigo-600/20"
              rightIcon={<CreditCard className="w-5 h-5" />}
            >
              {isProcessingCheckout 
                ? 'Securing Digital Allocation...' 
                : `Continue to Checkout (${formatCurrencyAmount(totalOrderPrice, selectedCurrency)})`}
            </Button>

            <Link
              to={`/validate?card=${slug}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Already have this card? Verify balance & scratch-off PIN</span>
            </Link>
          </div>

          {/* Terms and Conditions Accordion/List */}
          {terms && terms.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Terms & Redemption Notes</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
                {terms.map((term, index) => (
                  <li key={index} className="leading-relaxed">
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      {/* Top Progress Bar */}
      <TopProgressBar isLoading={isProcessingCheckout} />
    </PageContainer>
  );
};
