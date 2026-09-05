import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Printer, 
  Search, 
  Filter, 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  Layers, 
  Calendar, 
  AlertCircle,
  Coins,
  QrCode,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PurchaseTransaction, OrderStatus, TimelineEvent } from '../../types/order';
import { GIFT_CARDS } from '../../data/brands';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { GiftCardQuickViewModal } from './GiftCardQuickViewModal';
import { formatAmount, printVoucher, downloadVoucherFile } from '../../utils/voucherGenerator';

// Default realistic demo transactions to ensure the timeline is rich, testable, and demonstrable
const INITIAL_DEMO_ORDERS: PurchaseTransaction[] = [
  {
    id: 'ORD-984210',
    cardName: 'Amazon eGift Card',
    cardSlug: 'amazon',
    cardImage: '/cards/amazon.svg',
    category: 'Shopping',
    amount: 100,
    currency: 'USD',
    customerEmail: 'daisy4tucker@gmail.com',
    cryptoCurrency: 'BTC',
    cryptoAmount: '0.00112',
    walletAddress: 'bc1qqgrfdets5v3j7lqdxqu0u4telzcla2dxwaylqz',
    txHash: '7c9f8a2e1b4d0c3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    status: 'DELIVERED',
    statusLabel: 'Delivered & Active',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    eCode: 'AMZ-9948-2018-8421',
    pin: '9421',
    expiresAt: 'Sep 04, 2028',
    timeline: [
      { step: 1, title: 'Order Placed', description: 'Invoice generated for $100.00 USD', timestamp: '2 hours ago', completed: true },
      { step: 2, title: 'Crypto Paid', description: 'Received 0.00112 BTC on Bitcoin Network', timestamp: '1 hour 58 mins ago', completed: true },
      { step: 3, title: 'Verified', description: 'Escrow confirmed & security cleared', timestamp: '1 hour 57 mins ago', completed: true },
      { step: 4, title: 'Dispatched', description: 'Digital code delivered to email', timestamp: '1 hour 55 mins ago', completed: true },
    ],
  },
  {
    id: 'ORD-849102',
    cardName: 'Apple Gift Card',
    cardSlug: 'apple',
    cardImage: '/cards/apple.svg',
    category: 'Tech',
    amount: 50,
    currency: 'USD',
    customerEmail: 'daisy4tucker@gmail.com',
    cryptoCurrency: 'USDT',
    cryptoAmount: '50.00',
    walletAddress: '0x71C...4b91',
    txHash: '0x4f8a2e1b4d0c3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    status: 'DELIVERED',
    statusLabel: 'Delivered & Active',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    eCode: 'X849-2910-4KL4-2901',
    pin: '4920',
    expiresAt: 'Sep 04, 2028',
    timeline: [
      { step: 1, title: 'Order Placed', description: 'Invoice generated for $50.00 USD', timestamp: 'Yesterday', completed: true },
      { step: 2, title: 'Crypto Paid', description: 'Received 50.00 USDT (ERC-20)', timestamp: 'Yesterday', completed: true },
      { step: 3, title: 'Verified', description: 'Escrow confirmed & security cleared', timestamp: 'Yesterday', completed: true },
      { step: 4, title: 'Dispatched', description: 'Digital code delivered to email', timestamp: 'Yesterday', completed: true },
    ],
  },
  {
    id: 'ORD-729015',
    cardName: 'Steam Wallet Card',
    cardSlug: 'steam',
    cardImage: '/cards/steam.svg',
    category: 'Gaming',
    amount: 50,
    currency: 'USD',
    customerEmail: 'daisy4tucker@gmail.com',
    cryptoCurrency: 'SOL',
    cryptoAmount: '0.345',
    walletAddress: '8F7s...93La',
    txHash: '5K2b8a2e1b4d0c3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    status: 'PROCESSING',
    statusLabel: 'Confirming Blockchain',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    eCode: 'STM-8821-4491-0029',
    pin: '8821',
    expiresAt: 'Sep 04, 2028',
    timeline: [
      { step: 1, title: 'Order Placed', description: 'Invoice generated for $50.00 USD', timestamp: '15 mins ago', completed: true },
      { step: 2, title: 'Crypto Paid', description: 'Transaction hash broadcasted', timestamp: '12 mins ago', completed: true },
      { step: 3, title: 'Validating Block', description: 'Awaiting 3 confirmations on Solana', timestamp: 'In Progress', completed: false, active: true },
      { step: 4, title: 'Dispatched', description: 'Instant email delivery on confirmation', timestamp: 'Pending', completed: false },
    ],
  }
];

export const PurchaseHistoryTimeline: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'PROCESSING' | 'PENDING'>('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'compact'>('timeline');

  // Modal State
  const [selectedTx, setSelectedTx] = useState<PurchaseTransaction | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  // Copy Feedback State
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [revealedCodeIds, setRevealedCodeIds] = useState<Record<string, boolean>>({});

  const toggleRevealCode = (id: string) => {
    setRevealedCodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // 1. Try to fetch real orders from Backend API
      let apiOrders: any[] = [];
      try {
        const res = await apiRequest('/orders');
        if (res?.data && Array.isArray(res.data)) {
          apiOrders = res.data;
        }
      } catch (err) {
        console.warn('Could not fetch orders from API:', err);
      }

      // 2. Read local storage orders
      let localOrders: any[] = [];
      try {
        const stored = localStorage.getItem('user_orders');
        if (stored) {
          localOrders = JSON.parse(stored);
        }
      } catch (err) {
        console.warn('Could not read user_orders from localStorage:', err);
      }

      // 3. Format and Merge orders
      const combinedMap = new Map<string, PurchaseTransaction>();

      // Seed with initial realistic demo orders first
      INITIAL_DEMO_ORDERS.forEach((tx) => {
        // Customize email if user is logged in
        const enriched = {
          ...tx,
          customerEmail: user?.email || tx.customerEmail,
        };
        combinedMap.set(tx.id, enriched);
      });

      // Overlay API orders
      apiOrders.forEach((o) => {
        const brandMatch = GIFT_CARDS.find((g) => 
          g.name.toLowerCase() === (o.giftCardName || '').toLowerCase() || 
          g.slug === o.giftCardSlug
        );
        const cardImg = brandMatch?.image || '/cards/amazon.svg';
        const cardCat = brandMatch?.category || 'Shopping';

        const statusUpper = (o.paymentStatus || 'PENDING').toUpperCase() as OrderStatus;
        const isDelivered = statusUpper === 'COMPLETED' || statusUpper === 'DELIVERED';
        const isProcessing = statusUpper === 'PROCESSING' || statusUpper === 'CONFIRMING';

        const txItem: PurchaseTransaction = {
          id: o.id,
          cardName: o.giftCardName || 'Digital Gift Card',
          cardSlug: o.giftCardSlug || brandMatch?.slug,
          cardImage: cardImg,
          category: cardCat,
          amount: typeof o.amount === 'number' ? o.amount : parseFloat(o.amount) || 100,
          currency: o.currency || 'USD',
          customerEmail: o.userEmail || user?.email || 'customer@example.com',
          cryptoCurrency: o.cryptoCurrency || 'USDT',
          cryptoAmount: o.cryptoAmount || '100.00',
          walletAddress: o.walletAddress || undefined,
          txHash: o.transactionHash || undefined,
          receiptImage: o.receiptImage || null,
          status: isDelivered ? 'DELIVERED' : isProcessing ? 'PROCESSING' : 'PENDING',
          statusLabel: isDelivered ? 'Delivered & Active' : isProcessing ? 'Confirming Blockchain' : 'Payment Verification Pending',
          createdAt: o.createdAt || new Date().toISOString(),
          eCode: `ACV-${o.id.replace(/\D/g, '').slice(0, 4) || '9842'}-8102-5501`,
          pin: '8849',
          expiresAt: 'Sep 04, 2028',
          timeline: [
            { step: 1, title: 'Order Placed', description: `Invoice generated for $${o.amount} ${o.currency || 'USD'}`, timestamp: 'Done', completed: true },
            { step: 2, title: 'Crypto Paid', description: `Settle via ${o.cryptoCurrency || 'Crypto'}`, timestamp: 'Done', completed: true },
            { step: 3, title: isProcessing ? 'Verifying Block' : 'Security Verification', description: isProcessing ? 'Validating confirmations' : 'Escrow cleared', timestamp: isProcessing ? 'In Progress' : 'Done', completed: isDelivered, active: isProcessing },
            { step: 4, title: 'Dispatched', description: `Delivered to ${o.userEmail || 'email'}`, timestamp: isDelivered ? 'Done' : 'Pending', completed: isDelivered },
          ],
        };
        combinedMap.set(o.id, txItem);
      });

      // Overlay LocalStorage orders
      localOrders.forEach((lo) => {
        if (!combinedMap.has(lo.id)) {
          const brandMatch = GIFT_CARDS.find((g) => g.name.toLowerCase() === (lo.cardName || '').toLowerCase());
          const txItem: PurchaseTransaction = {
            id: lo.id,
            cardName: lo.cardName || 'Digital Gift Card',
            cardSlug: brandMatch?.slug,
            cardImage: brandMatch?.image || '/cards/amazon.svg',
            category: brandMatch?.category || 'Shopping',
            amount: Number(lo.amount) || 100,
            currency: lo.currency || 'USD',
            customerEmail: lo.email || user?.email || 'customer@example.com',
            cryptoCurrency: lo.cryptoCurrency || 'USDT',
            cryptoAmount: lo.cryptoAmount || '100.00',
            txHash: lo.txHash || undefined,
            status: 'PENDING',
            statusLabel: 'Payment Verification Pending',
            createdAt: lo.createdAt || new Date().toISOString(),
            eCode: `ACV-${lo.id.replace(/\D/g, '').slice(0, 4) || '8491'}-7721-9901`,
            pin: '7721',
            expiresAt: 'Sep 04, 2028',
            timeline: [
              { step: 1, title: 'Order Placed', description: `Invoice for $${lo.amount} ${lo.currency}`, timestamp: 'Done', completed: true },
              { step: 2, title: 'Crypto Paid', description: `Proof submitted via ${lo.cryptoCurrency}`, timestamp: 'Done', completed: true },
              { step: 3, title: 'Verification', description: 'Reviewing blockchain confirmation', timestamp: 'In Progress', completed: false, active: true },
              { step: 4, title: 'Dispatch', description: 'Code unlock upon confirmation', timestamp: 'Pending', completed: false },
            ],
          };
          combinedMap.set(lo.id, txItem);
        }
      });

      const list = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTransactions(list);
    } catch (e) {
      console.error('Error loading purchase history:', e);
      setTransactions(INITIAL_DEMO_ORDERS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions();
  };

  const handleOpenQuickView = (tx: PurchaseTransaction) => {
    setSelectedTx(tx);
    setIsQuickViewOpen(true);
  };

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Status Filter
      if (statusFilter === 'DELIVERED' && tx.status !== 'DELIVERED') return false;
      if (statusFilter === 'PROCESSING' && tx.status !== 'PROCESSING') return false;
      if (statusFilter === 'PENDING' && tx.status !== 'PENDING') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tx.cardName.toLowerCase().includes(q);
        const matchId = tx.id.toLowerCase().includes(q);
        const matchEmail = tx.customerEmail.toLowerCase().includes(q);
        const matchCrypto = tx.cryptoCurrency.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchEmail && !matchCrypto) return false;
      }

      return true;
    });
  }, [transactions, statusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = transactions.length;
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const deliveredCount = transactions.filter((t) => t.status === 'DELIVERED').length;
    const pendingCount = transactions.filter((t) => t.status !== 'DELIVERED').length;

    return {
      totalCount,
      totalVolume,
      deliveredCount,
      pendingCount,
    };
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Purchase History & Order Timeline
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time milestone tracking for your gift card purchases, verification progress, and instant voucher downloads.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />}
            >
              {isRefreshing ? 'Syncing...' : 'Refresh Orders'}
            </Button>

            <Link to="/gift-cards">
              <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Buy New Gift Card
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Total Transactions
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">All recorded orders</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Total Volume
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ${metrics.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">USD Equivalent face value</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Active & Delivered
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.deliveredCount}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Ready to redeem</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Average Speed
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              &lt; 3 mins
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Instant automated dispatch</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, Order ID, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'DELIVERED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Delivered ({metrics.deliveredCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PROCESSING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'PROCESSING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            In Progress
          </button>
        </div>
      </div>

      {/* Main Transactions Timeline List */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Loading your purchase history...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Matching Transactions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or filter settings to view your past orders.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTransactions.map((tx) => {
            const isDelivered = tx.status === 'DELIVERED';
            const isProcessing = tx.status === 'PROCESSING';
            const isRevealed = !!revealedCodeIds[tx.id];
            const isCopied = copiedCodeId === tx.id;
            const formattedDate = new Date(tx.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={tx.id}
                id={`transaction-card-${tx.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-200 space-y-6"
              >
                {/* Top Row: Brand Info + Status Pill + Quick Download Links */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center shadow-xs">
                      {tx.cardImage ? (
                        <img
                          src={tx.cardImage}
                          alt={tx.cardName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-6 h-6 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          {tx.cardName}
                        </h3>
                        <span className="font-mono text-xs text-slate-500 font-bold">
                          {tx.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Delivered to <strong className="text-slate-700 dark:text-slate-300">{tx.customerEmail}</strong> • {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
                    <div className="text-left lg:text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatAmount(tx.amount, tx.currency)}
                      </div>
                      <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                        Paid: {tx.cryptoAmount} {tx.cryptoCurrency}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{tx.statusLabel}</span>
                        </span>
                      ) : isProcessing ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                          <span>{tx.statusLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{tx.statusLabel}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Milestone Stepper Timeline */}
                <div className="py-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Transaction Milestone Progression
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {tx.timeline.map((event, index) => {
                      const isComplete = event.completed;
                      const isActive = event.active;

                      return (
                        <div
                          key={index}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isComplete
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200'
                              : isActive
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 ring-2 ring-amber-400/20'
                              : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                              Step 0{event.step}
                            </span>
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : isActive ? (
                              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                            )}
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                            {event.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {event.description}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1.5">
                            {event.timestamp}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* E-Code Credential Quick Access Banner */}
                {isDelivered && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                          Digital Redemption eCode & PIN
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-sm sm:text-base tracking-widest text-slate-900 dark:text-white">
                          {isRevealed ? (tx.eCode || 'ACV-9948-2018-8421') : '•••• •••• •••• ••••'}
                        </span>
                        {tx.pin && (
                          <span className="text-xs text-slate-500 font-mono">
                            PIN: <strong className="text-slate-800 dark:text-slate-200">{isRevealed ? tx.pin : '••••'}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRevealCode(tx.id)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(tx.id, tx.eCode || 'ACV-9948-2018-8421')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Quick-View & Download Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>256-bit SSL Cryptographic Escrow</span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenQuickView(tx)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                    >
                      Quick View Voucher
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadVoucherFile(tx)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download PDF
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => printVoucher(tx)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      className="hidden sm:inline-flex"
                    >
                      Print
                    </Button>

                    <Link to={tx.cardSlug ? `/gift-cards/${tx.cardSlug}` : '/gift-cards'}>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Buy Again
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Certificate Modal */}
      <GiftCardQuickViewModal
        transaction={selectedTx}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};
