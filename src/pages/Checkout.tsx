import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Clock, 
  Lock, 
  AlertCircle, 
  Wallet,
  Globe,
  Edit3,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Upload
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GIFT_CARDS } from '../data/brands';
import { BitcoinQRCode } from '../components/ui/BitcoinQRCode';
import { 
  SUPPORTED_CURRENCIES, 
  getCurrencyByCode, 
  formatCurrencyAmount, 
  calculateCryptoEquivalent,
  convertAmount
} from '../data/currencies';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { LiveCurrencyConverter } from '../components/checkout/LiveCurrencyConverter';

export const Checkout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const initialAmountParam = searchParams.get('amount');
  const initialCurrencyParam = searchParams.get('currency');
  const navigate = useNavigate();

  const card = GIFT_CARDS.find((c) => c.slug === slug) || GIFT_CARDS[1]; // default to Apple if not found
  const cardBaseCurrency = (card?.currency && SUPPORTED_CURRENCIES.some(c => c.code === card.currency)) ? card.currency : 'USD';

  // Live Currency Rates Engine
  const { 
    rates: liveRates, 
    cryptoRates, 
    isLive, 
    isLoading: isRatesLoading, 
    updatedAt: ratesUpdatedAt, 
    refreshRates 
  } = useCurrencyRates();

  // Local currency selection state
  const initialCurrency = initialCurrencyParam 
    ? initialCurrencyParam 
    : cardBaseCurrency;
  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency);

  // Amount input state
  const initialCardAmountParam = searchParams.get('cardAmount');
  const parsedInitialCardAmount = initialCardAmountParam 
    ? Number(initialCardAmountParam) 
    : (initialAmountParam ? Number(initialAmountParam) / 1.05499 : 50);
  const initialAmount = !isNaN(Number(parsedInitialCardAmount)) && Number(parsedInitialCardAmount) >= 50 ? parsedInitialCardAmount : 50;

  const [step, setStep] = useState<number>(1);
  const [amountInput, setAmountInput] = useState<string>(initialAmount.toString());
  const [amountError, setAmountError] = useState<string>('');

  const [email, setEmail] = useState<string>('');
  const [cryptoCurrency, setCryptoCurrency] = useState<string>('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState<string>('Bitcoin Network');
  
  // User wallet address and QR code upload state
  const [userWalletAddress, setUserWalletAddress] = useState<string>('bc1qqgrfdets5v3j7lqdxqu0u4telzcla2dxwaylqz');
  const [txHash, setTxHash] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes countdown

  const activeCurrency = getCurrencyByCode(selectedCurrency, liveRates);
  const effectiveAmount = Number(amountInput) || 0;
  const isValidAmount = effectiveAmount >= 50 && effectiveAmount <= 10000;

  const platformServiceFee = effectiveAmount * 0.05499;
  const totalOrderDue = effectiveAmount + platformServiceFee;

  // Real-time estimated crypto calculation using live rates from API for total order due
  const cryptoCalculation = calculateCryptoEquivalent(
    totalOrderDue > 0 ? totalOrderDue : 50 * 1.05499,
    selectedCurrency,
    cryptoCurrency,
    liveRates,
    cryptoRates
  );

  // Converted amount in selected local currency (if card has a different base currency like USD)
  const localConversion = convertAmount(effectiveAmount, selectedCurrency, selectedCurrency, liveRates);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Countdown timer for crypto invoice
  useEffect(() => {
    if (step === 3 && !orderCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, orderCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const depositAddresses: Record<string, { address: string; network: string; symbol: string; name: string }> = {
    BTC: { address: 'bc1qqgrfdets5v3j7lqdxqu0u4telzcla2dxwaylqz', network: 'Bitcoin Network', symbol: 'BTC', name: 'Bitcoin' },
    USDT: { address: '0x90cf0f1028f4E5efEa82097e0204770F4Cd7060B', network: 'Ethereum (ERC20)', symbol: 'USDT', name: 'Tether USD (ERC20)' },
    ETH: { address: '0x90cf0f1028f4E5efEa82097e0204770F4Cd7060B', network: 'Ethereum (ERC20)', symbol: 'ETH', name: 'Ethereum' },
    USDC: { address: '0x90cf0f1028f4E5efEa82097e0204770F4Cd7060B', network: 'Ethereum (ERC20)', symbol: 'USDC', name: 'USD Coin (ERC20)' },
    LTC: { address: 'ltc1qa9flfw3e06028jqlwe0r8cw5vv7fwq762dgsk8', network: 'Litecoin Network', symbol: 'LTC', name: 'Litecoin' },
    SOL: { address: 'EgjEQZTEgjmi9Xe17jbPytbd6S39Bkcs8i3LjQSbBQxV', network: 'Solana Network', symbol: 'SOL', name: 'Solana' },
    TRX: { address: 'TG7RSqYoEvMi3RHy1r9k9Ja7wwG1ent3PR', network: 'TRON Network (TRC20)', symbol: 'TRX', name: 'Tron' },
  };

  const currentWallet = depositAddresses[cryptoCurrency] || depositAddresses['BTC'];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentWallet.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleAmountChange = (val: string) => {
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

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim() && !receiptFile) {
      setPaymentError('Please enter your transaction ID / hash or upload a payment screenshot/photo.');
      return;
    }
    setPaymentError('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      try {
        const newOrder = {
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          cardName: card.name,
          amount: effectiveAmount,
          currency: selectedCurrency,
          email: email || 'customer@example.com',
          cryptoCurrency: cryptoCurrency,
          cryptoAmount: cryptoCalculation.cryptoAmount,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          txHash: txHash.trim(),
        };
        const existing = JSON.parse(localStorage.getItem('user_orders') || '[]');
        localStorage.setItem('user_orders', JSON.stringify([newOrder, ...existing]));
      } catch {
        // ignore
      }
      setOrderCompleted(true);
    }, 1200);
  };

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Gift Cards', path: '/gift-cards' },
        { label: card.name, path: `/gift-cards/${card.slug}` },
        { label: 'Secure Checkout' },
      ]}
    >
      <div className="max-w-4xl mx-auto py-4">
        
        {/* Checkout Header Steps Indicator */}
        <div className="mb-8 overflow-x-auto py-2">
          <div className="flex items-center justify-between min-w-[300px] max-w-lg mx-auto mb-2 px-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${step >= 1 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                1
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold whitespace-nowrap ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                <span className="hidden xs:inline sm:inline">Details</span><span className="hidden sm:inline"> & Currency</span><span className="sm:hidden">Details</span>
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${step >= 2 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                2
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold whitespace-nowrap ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                <span className="hidden xs:inline sm:inline">Payment</span> <span className="hidden sm:inline">Asset</span><span className="sm:hidden">Asset</span>
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${step >= 3 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                3
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold whitespace-nowrap ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                <span className="hidden xs:inline sm:inline">Invoice</span> <span className="hidden sm:inline">& QR</span><span className="sm:hidden">QR</span>
              </span>
            </div>
          </div>
        </div>

        {!orderCompleted ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Main Interactive Checkout Form */}
            <div className="md:col-span-7 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        Order Configuration
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Confirm your {card.name} eGift Card denomination, preferred local currency, and delivery email.
                      </p>
                    </div>

                    {/* Selected Card preview badge */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          referrerPolicy="no-referrer"
                          className="w-16 h-12 object-cover rounded-lg shadow-xs" 
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{card.name} Digital Gift Card</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.region} • Instant Digital Code</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                          {formatCurrencyAmount(effectiveAmount, selectedCurrency)}
                        </span>
                      </div>
                    </div>

                    {/* Card Amount Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="input-checkout-amount" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Card Amount ({activeCurrency.code})
                        </label>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Min {activeCurrency.symbol}50 • Max {activeCurrency.symbol}10,000
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold font-mono text-base pointer-events-none">
                          {activeCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          min="50"
                          max="10000"
                          step="1"
                          id="input-checkout-amount"
                          placeholder="Enter amount"
                          value={amountInput}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="w-full pl-16 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
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

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                        Delivery Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="youremail@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Your digital gift card PIN code and instructions will be sent here immediately after confirmation.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={!isValidAmount || !amountInput}
                      onClick={() => {
                        if (!email) {
                          alert('Please enter a valid email address for delivery.');
                          return;
                        }
                        if (!isValidAmount || !amountInput) {
                          setAmountError(`Please enter a valid amount (min ${activeCurrency.symbol}50).`);
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      Continue to Payment Method ({formatCurrencyAmount(totalOrderDue, selectedCurrency)})
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          Select Cryptocurrency
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Choose your preferred crypto asset for instant secure checkout.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back to Details</span>
                      </button>
                    </div>

                    {/* Real-time Live Currency Conversion API Box */}
                    <LiveCurrencyConverter
                      cardAmount={effectiveAmount > 0 ? effectiveAmount : 50}
                      cardBaseCurrency={cardBaseCurrency}
                      selectedLocalCurrency={selectedCurrency}
                      onSelectCurrency={(curr) => setSelectedCurrency(curr)}
                      liveRates={liveRates}
                      cryptoRates={cryptoRates}
                      isLive={isLive}
                      isLoading={isRatesLoading}
                      updatedAt={ratesUpdatedAt}
                      onRefresh={refreshRates}
                      cryptoCurrency={cryptoCurrency}
                    />

                    {/* Step 2 Card & Amount Banner */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-9 object-cover rounded-lg shadow-xs" 
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{card.name} Digital Card</h4>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">{email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">
                          {formatCurrencyAmount(effectiveAmount, selectedCurrency)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {activeCurrency.code}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { code: 'BTC', name: 'Bitcoin', network: 'Bitcoin Network', icon: '₿' },
                        { code: 'USDT', name: 'Tether USD', network: 'Ethereum (ERC20)', icon: '⚡' },
                        { code: 'ETH', name: 'Ethereum', network: 'Ethereum (ERC20)', icon: 'Ξ' },
                        { code: 'USDC', name: 'USD Coin', network: 'Ethereum (ERC20)', icon: '🪙' },
                        { code: 'LTC', name: 'Litecoin', network: 'Litecoin Network', icon: 'Ł' },
                        { code: 'SOL', name: 'Solana', network: 'Solana Network', icon: '◎' },
                        { code: 'TRX', name: 'Tron', network: 'TRON Network (TRC20)', icon: 'T' },
                      ].map((crypto) => {
                        const estimated = calculateCryptoEquivalent(
                          effectiveAmount, 
                          selectedCurrency, 
                          crypto.code,
                          liveRates,
                          cryptoRates
                        );
                        return (
                          <div
                            key={crypto.code}
                            onClick={() => {
                              setCryptoCurrency(crypto.code);
                              setCryptoNetwork(crypto.network);
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                              cryptoCurrency === crypto.code
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-600 ring-2 ring-indigo-500/20'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                                {crypto.icon}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{crypto.name} ({crypto.code})</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Network: {crypto.network}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                ~{estimated.cryptoAmount} {crypto.code}
                              </div>
                              <input
                                type="radio"
                                name="cryptoSelect"
                                checked={cryptoCurrency === crypto.code}
                                onChange={() => setCryptoCurrency(crypto.code)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => setStep(3)}
                    >
                      Generate Crypto Invoice & QR Code
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    {/* Top Invoice Banner */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                          {cryptoCurrency === 'BTC' ? '₿' : cryptoCurrency === 'ETH' ? 'Ξ' : '🪙'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pay with {currentWallet.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{email || 'Digital Delivery'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {formatCurrencyAmount(effectiveAmount, selectedCurrency)}
                        </div>
                        <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {cryptoCalculation.cryptoAmount} {cryptoCurrency}
                        </div>
                      </div>
                    </div>

                    {/* Exact Amount Banner */}
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-center space-y-1">
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Send exactly</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-300">
                        {cryptoCalculation.cryptoAmount} {cryptoCurrency}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Equivalent to {formatCurrencyAmount(effectiveAmount, selectedCurrency)} ({activeCurrency.code})
                      </div>
                    </div>

                    {/* QR Code Box */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-52 h-52 bg-white p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative group">
                          <BitcoinQRCode 
                            size={188} 
                            address={currentWallet.address} 
                            currency={cryptoCurrency}
                            amount={cryptoCalculation.cryptoAmount}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Scan with your {currentWallet.name} wallet or camera app
                      </p>

                      {/* Timer */}
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 py-2 px-3 rounded-xl border border-amber-200/60 dark:border-amber-900/50">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>Invoice expires in: <strong className="font-mono">{formatTime(timeLeft)}</strong></span>
                      </div>
                    </div>

                    {/* Crypto Address Box */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {cryptoCurrency} Deposit Address ({currentWallet.network})
                      </label>
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                        <span>{currentWallet.address}</span>
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shrink-0 ml-2 font-sans text-xs font-bold shadow-xs cursor-pointer"
                        >
                          {copiedAddress ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      {copiedAddress && <p className="text-[11px] text-emerald-600 font-semibold mt-1">Copied address to clipboard!</p>}
                    </div>

                    {/* Transaction ID / Hash & Photo Upload */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Transaction ID / Hash
                        </label>
                        <input
                          type="text"
                          placeholder="Paste your transaction ID or hash here"
                          value={txHash}
                          onChange={(e) => {
                            setTxHash(e.target.value);
                            if (e.target.value.trim() || receiptFile) setPaymentError('');
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Or Upload Payment Receipt / Photo (Screenshot)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer text-xs text-slate-600 dark:text-slate-300 transition-colors">
                            <Upload className="w-4 h-4 text-amber-500" />
                            <span className="truncate">{receiptFileName || 'Choose payment screenshot image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setReceiptFile(file);
                                  setReceiptFileName(file.name);
                                  setPaymentError('');
                                }
                              }}
                            />
                          </label>
                          {receiptFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptFileName('');
                              }}
                              className="px-3 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors shrink-0"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {paymentError && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{paymentError}</span>
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleCompletePayment} className="space-y-3 pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full shadow-md bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5"
                      >
                        {isSubmitting ? 'Verifying Transaction...' : "I've Sent the Payment"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:underline py-1 cursor-pointer"
                      >
                        ← Back to payment methods
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Order Summary
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isLive 
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {isLive ? 'Live API Rates' : 'Standard'}
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Gift Card Brand:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{card.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Currency:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeCurrency.flag} {activeCurrency.name} ({activeCurrency.code})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Card Amount:</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatCurrencyAmount(effectiveAmount, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Service Fee (5.499%):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyAmount(platformServiceFee, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Email:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{email || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Asset:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{cryptoCurrency} ({cryptoNetwork})</span>
                </div>
                <div className="flex justify-between">
                  <span>Crypto Equivalent:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {cryptoCalculation.cryptoAmount} {cryptoCurrency}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Total Order Due:</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrencyAmount(totalOrderDue, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Real-time Rate breakdown footer note */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Exchange Rate Reference:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  1 USD = {(liveRates[selectedCurrency] || activeCurrency.rateAgainstUSD).toFixed(2)} {activeCurrency.code}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Escrow Secured Transaction</span>
                </div>
                <p className="text-[11px] text-indigo-600/90 dark:text-indigo-300/80 leading-relaxed">
                  Your funds are secured until automatic digital delivery is verified and sent to your email.
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* PENDING / DISPATCH PENDING STATE */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-spin" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Payment Verification Pending
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 mb-2">
                Order Pending Confirmation
              </h2>
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Your <strong>{card.name}</strong> ({formatCurrencyAmount(totalOrderDue, selectedCurrency)}) digital code will be sent to <strong className="text-slate-900 dark:text-white">{email || 'your email'}</strong> upon payment confirmation.
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold mt-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span>Estimated delivery time: 2–5 minutes</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Transaction Submitted Successfully</span>
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                Your transaction hash or payment receipt has been logged. Our automated verifier and support team are reviewing the blockchain confirmation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/dashboard?tab=orders" className="flex-1">
                <Button variant="primary" className="w-full">
                  View in My Orders Dashboard
                </Button>
              </Link>
              <Link to="/gift-cards" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Buy Another Gift Card
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
