import React, { useState, useMemo } from 'react';
import {
  Users,
  CreditCard,
  History,
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Camera,
  Eye,
  EyeOff,
  Maximize2,
  X,
  FileText,
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AdminUserData,
  AdminOrderData,
  AdminGiftCardData,
  AdminValidationData,
  AdminDataBrowserPayload,
} from '../../services/adminService';
import { GiftCardValidationTableEditor } from './GiftCardValidationTableEditor';

interface AdminDataBrowserProps {
  data: AdminDataBrowserPayload | null;
  isLoading: boolean;
  onRefresh: () => void;
}

type SubTab = 'validations' | 'users' | 'orders' | 'giftcards';

export const AdminDataBrowser: React.FC<AdminDataBrowserProps> = ({
  data,
  isLoading,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('validations');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.warn('Failed to update order status:', e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.profile?.country && u.profile.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.profile?.phone && u.profile.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [data?.users, searchQuery, roleFilter]);

  // Filtered Orders / Transactions
  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.giftCardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.transactionHash && o.transactionHash.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.walletAddress && o.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || o.paymentStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data?.orders, searchQuery, statusFilter]);

  // Filtered Gift Cards
  const filteredGiftCards = useMemo(() => {
    if (!data?.giftCards) return [];
    return data.giftCards.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.region.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === 'ALL' || g.category === categoryFilter;

      return matchSearch && matchCat;
    });
  }, [data?.giftCards, searchQuery, categoryFilter]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    if (!data?.giftCards) return [];
    const set = new Set(data.giftCards.map((g) => g.category));
    return Array.from(set).sort();
  }, [data?.giftCards]);

  // Unique validation brands for filtering
  const validationBrands = useMemo(() => {
    if (!data?.validations) return [];
    const set = new Set(data.validations.map((v) => v.brand));
    return Array.from(set).sort();
  }, [data?.validations]);

  // Export current view as CSV
  const handleExportCsv = () => {
    let csvContent = '';
    const fileName = `audit-${activeSubTab}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeSubTab === 'validations') {
      const list = data?.validations || [];
      const headers = ['Record ID', 'Brand', 'Card Number', 'PIN', 'CVV', 'Expiry Date', 'Card Amount', 'Currency', 'Status', 'Notes', 'Customer Email', 'Customer IP', 'Photos Count', 'Submitted At'];
      const rows = list.map((v) => [
        `"${v.id}"`,
        `"${v.brand}"`,
        `"${v.cardNumber}"`,
        `"${v.pin || ''}"`,
        `"${v.cvv || ''}"`,
        `"${v.expiryDate || ''}"`,
        v.cardAmount,
        `"${v.currency}"`,
        `"${v.status}"`,
        `"${(v.notes || '').replace(/"/g, '""')}"`,
        `"${v.customerEmail || ''}"`,
        `"${v.customerIp || ''}"`,
        v.images.length,
        `"${v.createdAt}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (activeSubTab === 'users') {
      const headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Role', 'Phone', 'Country', 'Orders Count', 'Favorites Count', 'Created At'];
      const rows = filteredUsers.map((u) => [
        `"${u.id}"`,
        `"${u.firstName}"`,
        `"${u.lastName}"`,
        `"${u.email}"`,
        `"${u.role}"`,
        `"${u.profile?.phone || ''}"`,
        `"${u.profile?.country || ''}"`,
        u.ordersCount,
        u.favoritesCount,
        `"${u.createdAt}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (activeSubTab === 'orders') {
      const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Gift Card', 'Amount', 'Currency', 'Payment Method', 'Crypto Currency', 'Status', 'Tx Hash', 'Date'];
      const rows = filteredOrders.map((o) => [
        `"${o.id}"`,
        `"${o.userName}"`,
        `"${o.userEmail}"`,
        `"${o.giftCardName}"`,
        o.amount,
        `"${o.currency}"`,
        `"${o.paymentMethod}"`,
        `"${o.cryptoCurrency || 'N/A'}"`,
        `"${o.paymentStatus}"`,
        `"${o.transactionHash || ''}"`,
        `"${o.createdAt}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const headers = ['Card ID', 'Name', 'Slug', 'Category', 'Region', 'Currency', 'Starting Price', 'Available', 'Total Orders', 'Total Favorites'];
      const rows = filteredGiftCards.map((g) => [
        `"${g.id}"`,
        `"${g.name}"`,
        `"${g.slug}"`,
        `"${g.category}"`,
        `"${g.region}"`,
        `"${g.currency}"`,
        g.startingPrice,
        g.available ? 'YES' : 'NO',
        g.ordersCount,
        g.favoritesCount,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uploaded Card Submissions Metric */}
        <div
          onClick={() => {
            setActiveSubTab('validations');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'validations'
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-sm ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Uploaded Card Database
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? '...' : data?.counts.totalValidations || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400">Uploaded card records</span>
            <span>in admin database</span>
          </p>
        </div>

        {/* User Profiles Metric */}
        <div
          onClick={() => {
            setActiveSubTab('users');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-sm ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              User Profiles
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? '...' : data?.counts.totalUsers || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>Read-only user ledger & profiles</span>
          </p>
        </div>

        {/* Transactions Metric */}
        <div
          onClick={() => {
            setActiveSubTab('orders');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Transactions Ledger
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? '...' : data?.counts.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ${(data?.counts.totalVolumeUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span>settled volume</span>
          </p>
        </div>

        {/* Gift Card Catalog Metric */}
        <div
          onClick={() => {
            setActiveSubTab('giftcards');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'giftcards'
              ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-sm ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gift Card SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? '...' : data?.counts.totalGiftCards || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>Active SKU catalog & inventory</span>
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Sub-tabs Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('validations');
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'validations'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Validation Table Editor ({data?.validations?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('users');
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'users'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Profiles ({data?.users.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('orders');
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'orders'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Transactions ({data?.orders.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('giftcards');
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'giftcards'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Gift Cards ({data?.giftCards.length || 0})</span>
              </button>
            </div>

            {/* Action Buttons for general ledger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>

              {activeSubTab !== 'validations' && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export {activeSubTab.toUpperCase()} CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Bar (for Users, Orders, Gift Cards) */}
          {activeSubTab !== 'validations' && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeSubTab === 'users'
                      ? 'Search users by name, email, country, phone, or ID...'
                      : activeSubTab === 'orders'
                      ? 'Search transactions by order ID, email, gift card, hash, address...'
                      : 'Search gift cards by name, category, region, description...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Contextual Filter dropdowns */}
              {activeSubTab === 'users' && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Role: CUSTOMER</option>
                  <option value="ADMIN">Role: ADMIN</option>
                  <option value="SUPPORT_AGENT">Role: SUPPORT_AGENT</option>
                </select>
              )}

              {activeSubTab === 'orders' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PAID">Status: PAID</option>
                  <option value="CONFIRMING">Status: CONFIRMING</option>
                  <option value="WAITING_PAYMENT">Status: WAITING_PAYMENT</option>
                  <option value="PENDING">Status: PENDING</option>
                  <option value="FAILED">Status: FAILED</option>
                  <option value="EXPIRED">Status: EXPIRED</option>
                </select>
              )}

              {activeSubTab === 'giftcards' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      Category: {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* ================= VIEW 1: GIFT CARD VALIDATION TABLE EDITOR ================= */}
        {activeSubTab === 'validations' && (
          <div className="p-4 sm:p-6">
            <GiftCardValidationTableEditor
              validations={data?.validations || []}
              onRefresh={onRefresh}
            />
          </div>
        )}

        {/* ================= VIEW 2: USER PROFILES TABLE ================= */}
        {activeSubTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Contact & Location</th>
                  <th className="py-3.5 px-4">Activity</th>
                  <th className="py-3.5 px-4">User ID (UUID)</th>
                  <th className="py-3.5 px-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No user records match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                            {u.firstName ? u.firstName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10.5px] border ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : u.role === 'SUPPORT_AGENT'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          {u.profile?.phone ? (
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.profile.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No phone set</span>
                          )}
                          {u.profile?.country && (
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{u.profile.country}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {u.ordersCount} Orders
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                            {u.favoritesCount} Favs
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {u.id}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= VIEW 3: TRANSACTIONS / ORDERS TABLE ================= */}
        {activeSubTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Gift Card</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method / Network</th>
                  <th className="py-3.5 px-4">TX ID & Proof Image</th>
                  <th className="py-3.5 px-4">Status & Action</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No transaction records match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        #{o.id.slice(0, 10)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{o.userName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{o.userEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{o.giftCardName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 dark:text-white text-sm">
                          ${o.amount.toFixed(2)}
                        </div>
                        <div className="text-[10.5px] text-slate-400 uppercase font-mono">{o.currency}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {o.paymentMethod} {o.cryptoCurrency ? `(${o.cryptoCurrency})` : ''}
                        </div>
                        {o.blockchainNetwork && (
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">
                            Net: {o.blockchainNetwork}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {o.transactionHash ? (
                            <div className="flex items-center gap-1 font-mono text-[10.5px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 max-w-[180px] truncate" title={o.transactionHash}>
                              <span>tx:</span>
                              <span className="truncate">{o.transactionHash}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No TX Hash</span>
                          )}

                          {o.receiptImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewImageModalUrl(o.receiptImage || null)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                              📸 View Payment Proof
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10.5px] border ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : o.paymentStatus === 'CONFIRMING'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : o.paymentStatus === 'WAITING_PAYMENT' || o.paymentStatus === 'PENDING'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {o.paymentStatus === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            {o.paymentStatus === 'PENDING' && <Clock className="w-3 h-3 text-amber-500" />}
                            {o.paymentStatus === 'FAILED' && <XCircle className="w-3 h-3 text-rose-500" />}
                            <span>{o.paymentStatus}</span>
                          </span>

                          <div className="flex items-center gap-1">
                            {o.paymentStatus !== 'PAID' && (
                              <button
                                type="button"
                                disabled={updatingOrderId === o.id}
                                onClick={() => handleUpdateOrderStatus(o.id, 'PAID')}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {o.paymentStatus !== 'FAILED' && (
                              <button
                                type="button"
                                disabled={updatingOrderId === o.id}
                                onClick={() => handleUpdateOrderStatus(o.id, 'FAILED')}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= VIEW 4: GIFT CARD CATALOG TABLE ================= */}
        {activeSubTab === 'giftcards' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Brand / Gift Card</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Region / Currency</th>
                  <th className="py-3.5 px-4">Starting Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Orders & Favs</th>
                  <th className="py-3.5 px-4">Identifier Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredGiftCards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No gift cards match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGiftCards.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {g.image ? (
                            <img
                              src={g.image}
                              alt={g.name}
                              className="w-10 h-6 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                              GC
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{g.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                              {g.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {g.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{g.region}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-400 uppercase font-mono">{g.currency}</div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">
                        ${g.startingPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10.5px] border ${
                            g.available
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {g.available ? 'AVAILABLE' : 'DISABLED'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {g.ordersCount} orders · {g.favoritesCount} favs
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {g.slug}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info banner */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {activeSubTab === 'validations'
                ? data?.validations?.length || 0
                : activeSubTab === 'users'
                ? filteredUsers.length
                : activeSubTab === 'orders'
                ? filteredOrders.length
                : filteredGiftCards.length}
            </span>{' '}
            records
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Database state synchronized</span>
          </div>
        </div>
      </div>

      {/* Payment Proof Lightbox Modal */}
      {previewImageModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📸</span> Payment Receipt Screenshot / Proof
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImageModalUrl(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/50 rounded-xl p-2">
              <img
                src={previewImageModalUrl}
                alt="Payment Proof Receipt"
                className="max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImageModalUrl(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
