import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Eye,
  EyeOff,
  Camera,
  Maximize2,
  X,
  Check,
  AlertTriangle,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Cloud,
  Database,
  UploadCloud,
  Copy,
  ExternalLink,
  Info,
  Bot,
} from 'lucide-react';
import { TelegramIntegrationModal } from './TelegramIntegrationModal';
import {
  AdminValidationData,
  createValidationRecord,
  updateValidationRecord,
  deleteValidationRecord,
  bulkDeleteValidationRecords,
  clearAllValidationRecords,
  syncValidationsToSupabase,
  getSupabaseSyncStatus,
} from '../../services/adminService';

interface GiftCardValidationTableEditorProps {
  validations: AdminValidationData[];
  onRefresh: () => void;
}

export const GiftCardValidationTableEditor: React.FC<GiftCardValidationTableEditorProps> = ({
  validations,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');

  // Selected rows for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [unmaskedCards, setUnmaskedCards] = useState<Record<string, boolean>>({});

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    brand: true,
    cardNumber: true,
    pin: true,
    cvv: true,
    expiry: true,
    amount: true,
    photos: true,
    status: true,
    result: true,
    notes: true,
    date: true,
    actions: true,
  });
  const [showColumnConfig, setShowColumnConfig] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AdminValidationData | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    brand: '',
    cardNumber: '',
    pin: '',
    cvv: '',
    expiryDate: '',
    cardAmount: 100,
    currency: 'USD',
    status: 'PENDING',
    result: 'Card is not yet activated',
    notes: '',
    customerEmail: '',
    imagesText: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Supabase Cloud Integration States
  const [isSyncingToSupabase, setIsSyncingToSupabase] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    configured: boolean;
    url: string | null;
    tableReady?: boolean;
    message?: string;
  }>({
    configured: false,
    url: null,
    tableReady: false,
  });
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    getSupabaseSyncStatus()
      .then((res) => {
        if (res && typeof res.configured === 'boolean') {
          setSupabaseStatus(res);
        } else {
          setSupabaseStatus({ configured: false, url: null, tableReady: false });
        }
      })
      .catch(() => setSupabaseStatus({ configured: false, url: null, tableReady: false }));
  }, []);

  const handleSyncToSupabase = async () => {
    setIsSyncingToSupabase(true);
    try {
      const res = await syncValidationsToSupabase();
      const payload = res?.data || res || {};
      const isConfigured = payload.configured ?? res?.configured ?? false;
      const isTableMissing = payload.tableMissing ?? res?.tableMissing ?? false;
      const isSuccess = payload.success ?? res?.success ?? false;
      const syncedCount = payload.syncedCount ?? res?.syncedCount ?? 0;
      const message = res?.message || payload.message || payload.error || '';

      if (!isConfigured) {
        showFeedback(
          'Supabase is not configured yet. Click "Supabase Setup Guide" to view required environment variables and SQL table setup.',
          'error'
        );
        setIsSupabaseModalOpen(true);
      } else if (isTableMissing) {
        showFeedback(
          "Table 'gift_card_validations' was not found in Supabase. Please copy the SQL from Supabase Guide and run it in Supabase SQL Editor.",
          'error'
        );
        setIsSupabaseModalOpen(true);
      } else if (isSuccess) {
        showFeedback(message || `Successfully synced ${syncedCount} records to Supabase!`);
        // Refresh health status
        getSupabaseSyncStatus().then((s) => {
          if (s && typeof s.configured === 'boolean') setSupabaseStatus(s);
        }).catch(() => {});
      } else {
        showFeedback(message || 'Failed to sync to Supabase.', 'error');
        if (isTableMissing) setIsSupabaseModalOpen(true);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Error connecting to Supabase sync API.', 'error');
    } finally {
      setIsSyncingToSupabase(false);
    }
  };

  const copySupabaseSql = () => {
    const sql = `-- 1. Create Enum for ValidationStatus (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ValidationStatus') THEN
    CREATE TYPE public."ValidationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'INVALID', 'ERROR');
  END IF;
END $$;

-- 2. Create GiftCardValidationpin Table
CREATE TABLE IF NOT EXISTS public."GiftCardValidationpin" (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  brand text NOT NULL,
  "cardNumber" text NOT NULL,
  pin text NULL,
  status public."ValidationStatus" NOT NULL DEFAULT 'PENDING'::public."ValidationStatus",
  result text NULL DEFAULT 'Validation pending'::text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  currency text NULL DEFAULT 'USD'::text,
  "cardAmount" double precision NULL DEFAULT 0.0,
  cvv text NULL,
  "expiryDate" text NULL,
  images text[] NULL DEFAULT '{}'::text[],
  CONSTRAINT "GiftCardValidationpin_pkey" PRIMARY KEY (id)
);

-- 3. Create Index
CREATE INDEX IF NOT EXISTS idx_validation_status
  ON public."GiftCardValidationpin" USING btree (status);

-- 4. Enable Row Level Security (RLS) and Service Role Policy
ALTER TABLE public."GiftCardValidationpin" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'GiftCardValidationpin' AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access" ON public."GiftCardValidationpin"
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const toggleUnmask = (id: string) => {
    setUnmaskedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredValidations.length && filteredValidations.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredValidations.map((v) => v.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered dataset
  const filteredValidations = useMemo(() => {
    return validations.filter((v) => {
      const matchSearch =
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.cardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.pin && v.pin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.cvv && v.cvv.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.result && v.result.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.customerEmail && v.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBrand = brandFilter === 'ALL' || v.brand === brandFilter;
      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchCurrency = currencyFilter === 'ALL' || (v.currency || 'USD') === currencyFilter;

      return matchSearch && matchBrand && matchStatus && matchCurrency;
    });
  }, [validations, searchQuery, brandFilter, statusFilter, currencyFilter]);

  // Unique filters
  const uniqueBrands = useMemo(() => {
    const set = new Set(validations.map((v) => v.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [validations]);

  const uniqueCurrencies = useMemo(() => {
    const set = new Set(validations.map((v) => v.currency || 'USD').filter(Boolean));
    return Array.from(set).sort();
  }, [validations]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = validations.length;
    const verified = validations.filter((v) => v.status === 'VERIFIED' || v.status === 'VALID').length;
    const pending = validations.filter((v) => v.status === 'PENDING' || v.status === 'PROCESSING').length;
    const invalid = validations.filter((v) => v.status === 'INVALID' || v.status === 'ERROR').length;
    const totalAmount = validations.reduce((sum, v) => sum + (v.cardAmount || 0), 0);
    return { total, verified, pending, invalid, totalAmount };
  }, [validations]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      brand: 'Apple Gift Card',
      cardNumber: '',
      pin: '',
      cvv: '',
      expiryDate: '',
      cardAmount: 100,
      currency: 'USD',
      status: 'PENDING',
      result: 'Card is not yet activated',
      notes: '',
      customerEmail: '',
      imagesText: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (rec: AdminValidationData) => {
    setEditingRecord(rec);
    setFormData({
      brand: rec.brand,
      cardNumber: rec.cardNumber,
      pin: rec.pin || '',
      cvv: rec.cvv || '',
      expiryDate: rec.expiryDate || '',
      cardAmount: rec.cardAmount || 0,
      currency: rec.currency || 'USD',
      status: rec.status,
      result: rec.result || '',
      notes: rec.notes || '',
      customerEmail: rec.customerEmail || '',
      imagesText: (rec.images || []).join('\n'),
    });
  };

  // Handle Save (Add or Edit)
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.cardNumber.trim()) {
      showFeedback('Brand and Card Number are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const parsedImages = formData.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (editingRecord) {
        // Update
        await updateValidationRecord(editingRecord.id, {
          brand: formData.brand,
          cardNumber: formData.cardNumber,
          pin: formData.pin || null,
          cvv: formData.cvv || null,
          expiryDate: formData.expiryDate || null,
          cardAmount: Number(formData.cardAmount) || 0,
          currency: formData.currency,
          status: formData.status,
          result: formData.result,
          notes: formData.notes || null,
          customerEmail: formData.customerEmail || null,
          images: parsedImages,
        });
        showFeedback(`Validation record for ${formData.brand} updated successfully.`);
        setEditingRecord(null);
      } else {
        // Create
        await createValidationRecord({
          brand: formData.brand,
          cardNumber: formData.cardNumber,
          pin: formData.pin || undefined,
          cvv: formData.cvv || undefined,
          expiryDate: formData.expiryDate || undefined,
          cardAmount: Number(formData.cardAmount) || 0,
          currency: formData.currency,
          status: formData.status,
          result: formData.result,
          notes: formData.notes || undefined,
          customerEmail: formData.customerEmail || undefined,
          images: parsedImages,
        });
        showFeedback(`New validation record added to table.`);
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to save validation record.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Single Delete
  const handleDeleteSingle = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteValidationRecord(id);
      showFeedback('Validation record deleted.');
      setDeleteConfirmId(null);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      onRefresh();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to delete record.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsSaving(true);
    try {
      const count = await bulkDeleteValidationRecords(selectedIds);
      showFeedback(`Deleted ${count} selected validation record(s).`);
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to delete selected records.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Bulk Status Change
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setIsSaving(true);
    try {
      for (const id of selectedIds) {
        await updateValidationRecord(id, { status: newStatus });
      }
      showFeedback(`Updated status to ${newStatus} for ${selectedIds.length} records.`);
      onRefresh();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to update status.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Inline Status update
  const handleInlineStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateValidationRecord(id, { status: newStatus });
      showFeedback(`Status updated to ${newStatus}.`);
      onRefresh();
    } catch (err: any) {
      showFeedback('Failed to update status.', 'error');
    }
  };

  // Restart / Wipe Table Entirely
  const handleClearAllTable = async () => {
    setIsSaving(true);
    try {
      const erased = await clearAllValidationRecords();
      showFeedback(`Validation table wiped completely. Erased ${erased} formal record(s).`);
      setIsClearAllModalOpen(false);
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to reset table.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Sample Test Record for quick verification
  const handleInsertSample = async () => {
    setIsSaving(true);
    try {
      await createValidationRecord({
        brand: 'Amazon Gift Card',
        cardNumber: `AQ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        pin: `${Math.floor(1000 + Math.random() * 9000)}`,
        cvv: `${Math.floor(100 + Math.random() * 900)}`,
        cardAmount: 100,
        currency: 'USD',
        status: 'PENDING',
        result: 'Card is not yet activated',
        notes: 'Table editor sample record',
      });
      showFeedback('Sample validation record inserted.');
      onRefresh();
    } catch (err: any) {
      showFeedback('Failed to insert sample record.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Brand',
      'Card Number',
      'PIN',
      'CVV',
      'Expiry Date',
      'Amount',
      'Currency',
      'Status',
      'Result Message',
      'Admin Notes',
      'Customer Email',
      'Photos Count',
      'Created At',
    ];

    const rows = filteredValidations.map((v) => [
      v.id,
      `"${(v.brand || '').replace(/"/g, '""')}"`,
      `"${(v.cardNumber || '').replace(/"/g, '""')}"`,
      `"${(v.pin || '').replace(/"/g, '""')}"`,
      `"${(v.cvv || '').replace(/"/g, '""')}"`,
      `"${(v.expiryDate || '').replace(/"/g, '""')}"`,
      v.cardAmount || 0,
      v.currency || 'USD',
      v.status,
      `"${(v.result || '').replace(/"/g, '""')}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`,
      `"${(v.customerEmail || '').replace(/"/g, '""')}"`,
      (v.images || []).length,
      `"${new Date(v.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gift-card-validations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback('CSV file exported successfully.');
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-black/10 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Metrics / Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Records</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Verified Cards</div>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{stats.verified}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Pending Review</div>
          <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">{stats.pending}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm">
          <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Invalid / Failed</div>
          <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{stats.invalid}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Claimed Volume</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Column Editor, Add, Restart Table */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table by brand, card code, PIN, CVV, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Supabase Cloud Sync Button */}
            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncingToSupabase || filteredValidations.length === 0}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                supabaseStatus.configured && supabaseStatus.tableReady
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                  : supabaseStatus.configured
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                  : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
              } disabled:opacity-50`}
              title={
                supabaseStatus.configured && supabaseStatus.tableReady
                  ? 'Supabase database table is connected & ready - click to sync all records'
                  : supabaseStatus.configured
                  ? "Supabase connected, but table 'gift_card_validations' needs to be created in SQL Editor."
                  : 'Click to sync or configure Supabase database credentials'
              }
            >
              {isSyncingToSupabase ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>{isSyncingToSupabase ? 'Syncing...' : 'Sync to Supabase'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseStatus.configured && supabaseStatus.tableReady
                    ? 'bg-emerald-500 animate-pulse'
                    : supabaseStatus.configured
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-slate-400'
                }`}
                title={
                  supabaseStatus.configured && supabaseStatus.tableReady
                    ? 'Supabase Table Ready'
                    : supabaseStatus.configured
                    ? 'Supabase Connected (Table setup required)'
                    : 'Supabase Not Configured'
                }
              />
            </button>

            {/* Supabase SQL & Connection Guide Modal Toggle */}
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
              title="View Supabase Table SQL Schema & Setup Guide"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Supabase Guide</span>
            </button>

            {/* Telegram Bot Integration Button */}
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Configure Telegram Bot instant alerts for new card uploads"
            >
              <Bot className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              <span>Telegram Alerts</span>
            </button>

            {/* Column Config Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  showColumnConfig
                    ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Columns</span>
              </button>

              {showColumnConfig && (
                <div className="absolute right-0 mt-2 w-56 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-30 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
                    Table Columns Editor
                  </div>
                  {Object.entries({
                    brand: 'Brand',
                    cardNumber: 'Card Number / Code',
                    pin: 'PIN',
                    cvv: 'CVV',
                    expiry: 'Expiration',
                    amount: 'Claimed Amount',
                    photos: 'Photos',
                    status: 'Status',
                    result: 'Result / Message',
                    notes: 'Admin Notes',
                    date: 'Created Date',
                    actions: 'Actions',
                  }).map(([colKey, colLabel]) => (
                    <label
                      key={colKey}
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 px-1.5 py-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[colKey]}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({ ...prev, [colKey]: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{colLabel}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredValidations.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* Add Record */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>

            {/* Restart Table / Clear Formal Data */}
            <button
              type="button"
              onClick={() => setIsClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-extrabold transition-colors"
              title="Restart table and erase all validation records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Table</span>
            </button>
          </div>
        </div>

        {/* Granular Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Brands ({uniqueBrands.length})</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="VERIFIED">VERIFIED / VALID</option>
            <option value="INVALID">INVALID</option>
            <option value="ERROR">ERROR</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Currencies</option>
            {uniqueCurrencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Quick Clear filters */}
          {(brandFilter !== 'ALL' || statusFilter !== 'ALL' || currencyFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setBrandFilter('ALL');
                setStatusFilter('ALL');
                setCurrencyFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-mono">
            Showing {filteredValidations.length} of {validations.length} records
          </div>
        </div>
      </div>

      {/* Bulk Action Banner when rows selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/80 dark:bg-indigo-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>{selectedIds.length} record(s) selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-semibold">Bulk Set Status:</span>
            <button
              onClick={() => handleBulkStatusChange('VERIFIED')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
            >
              Mark Verified
            </button>
            <button
              onClick={() => handleBulkStatusChange('PENDING')}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
            >
              Mark Pending
            </button>
            <button
              onClick={() => handleBulkStatusChange('INVALID')}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px]"
            >
              Mark Invalid
            </button>

            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-rose-50/60 dark:bg-rose-950/20 border-b border-rose-200/60 dark:border-rose-900/40 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {selectedIds.length === filteredValidations.length && filteredValidations.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                {visibleColumns.brand && <th className="py-3 px-3.5">Brand</th>}
                {visibleColumns.cardNumber && <th className="py-3 px-3.5">Card Number / Code</th>}
                {visibleColumns.pin && <th className="py-3 px-3.5">PIN</th>}
                {visibleColumns.cvv && <th className="py-3 px-3.5">CVV</th>}
                {visibleColumns.expiry && <th className="py-3 px-3.5">Expiry</th>}
                {visibleColumns.amount && <th className="py-3 px-3.5">Amount</th>}
                {visibleColumns.photos && <th className="py-3 px-3.5">Photos</th>}
                {visibleColumns.status && <th className="py-3 px-3.5">Status</th>}
                {visibleColumns.result && <th className="py-3 px-3.5">Validation Result</th>}
                {visibleColumns.notes && <th className="py-3 px-3.5">Admin Notes</th>}
                {visibleColumns.date && <th className="py-3 px-3.5">Created At</th>}
                {visibleColumns.actions && <th className="py-3 px-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredValidations.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                        {validations.length === 0
                          ? 'Table is Clean & Restarted (0 Records)'
                          : 'No validation records match your filter criteria'}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {validations.length === 0
                          ? 'All formal validation data has been erased. The table is ready for fresh entries or live submissions.'
                          : 'Try resetting your search query or brand/status filters.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenAddModal}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Card</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertSample}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Insert Test Sample</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredValidations.map((v) => {
                  const isSelected = selectedIds.includes(v.id);
                  const isUnmasked = unmaskedCards[v.id];
                  const isPhotoOnly = v.cardNumber?.startsWith('[Image Verification');

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(v.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Brand */}
                      {visibleColumns.brand && (
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs">
                            {v.brand}
                          </span>
                        </td>
                      )}

                      {/* Card Number */}
                      {visibleColumns.cardNumber && (
                        <td className="py-3 px-3.5 font-mono">
                          {isPhotoOnly ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                              <Camera className="w-3 h-3" />
                              <span>Photo Submission</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {isUnmasked ? v.cardNumber : v.cardNumberMasked}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleUnmask(v.id)}
                                title={isUnmasked ? 'Mask code' : 'Reveal full code'}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              >
                                {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: {v.id.slice(0, 8)}...
                          </div>
                        </td>
                      )}

                      {/* PIN */}
                      {visibleColumns.pin && (
                        <td className="py-3 px-3.5 font-mono">
                          {v.pin ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                              {v.pin}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </td>
                      )}

                      {/* CVV */}
                      {visibleColumns.cvv && (
                        <td className="py-3 px-3.5 font-mono">
                          {v.cvv ? (
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {v.cvv}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </td>
                      )}

                      {/* Expiry */}
                      {visibleColumns.expiry && (
                        <td className="py-3 px-3.5 font-mono">
                          {v.expiryDate ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                              {v.expiryDate}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </td>
                      )}

                      {/* Amount */}
                      {visibleColumns.amount && (
                        <td className="py-3 px-3.5">
                          <div className="font-black text-slate-900 dark:text-white text-xs">
                            ${(v.cardAmount || 0).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{v.currency || 'USD'}</div>
                        </td>
                      )}

                      {/* Photos */}
                      {visibleColumns.photos && (
                        <td className="py-3 px-3.5">
                          {v.images && v.images.length > 0 ? (
                            <div className="flex items-center gap-1.5">
                              {v.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedLightboxImage(img)}
                                  className="relative group w-8 h-8 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer shrink-0 hover:scale-105 transition-transform"
                                  title={`Click to view photo #${idx + 1}`}
                                >
                                  <img
                                    src={img}
                                    alt={`Card ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                    <Maximize2 className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                              ))}
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ({v.images.length})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No photos</span>
                          )}
                        </td>
                      )}

                      {/* Status with quick inline dropdown */}
                      {visibleColumns.status && (
                        <td className="py-3 px-3.5">
                          <select
                            value={v.status}
                            onChange={(e) => handleInlineStatusChange(v.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10.5px] border cursor-pointer ${
                              v.status === 'VALID' || v.status === 'VERIFIED'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : v.status === 'PENDING' || v.status === 'PROCESSING'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="INVALID">INVALID</option>
                            <option value="ERROR">ERROR</option>
                          </select>
                        </td>
                      )}

                      {/* Result */}
                      {visibleColumns.result && (
                        <td className="py-3 px-3.5 max-w-[160px] truncate text-slate-700 dark:text-slate-300 text-xs">
                          {v.result || 'Validation pending'}
                        </td>
                      )}

                      {/* Notes */}
                      {visibleColumns.notes && (
                        <td className="py-3 px-3.5 max-w-[140px] truncate text-slate-500 text-xs">
                          {v.notes ? (
                            <span className="italic">{v.notes}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Date */}
                      {visibleColumns.date && (
                        <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(v.createdAt).toLocaleDateString()}{' '}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                      )}

                      {/* Row Actions */}
                      {visibleColumns.actions && (
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(v)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              title="Edit validation record in table editor"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(v.id)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                              title="Delete record from database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT VALIDATION RECORD ================= */}
      {(isAddModalOpen || editingRecord) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>{editingRecord ? 'Edit Validation Record' : 'Add New Validation Record'}</span>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingRecord(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Card Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple Gift Card"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="INVALID">INVALID</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Card Code / Redemption Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="e.g. X123-4567-8901-ABCD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PIN (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CVV (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    placeholder="12/28"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Claimed Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.cardAmount}
                    onChange={(e) => setFormData({ ...formData, cardAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Validation Result Message
                </label>
                <input
                  type="text"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  placeholder="Card is not yet activated / Balance verified"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Notes (Internal)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional internal remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Image URLs (1 per line, max 3)
                </label>
                <textarea
                  rows={2}
                  value={formData.imagesText}
                  onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                  placeholder="https://... photo link"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingRecord ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESTART / CLEAR ALL CONFIRMATION ================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900 overflow-hidden p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                Restart & Erase Validation Table?
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                This action will permanently erase all <strong>{validations.length}</strong> validation record(s) from the database table. The table structure will restart completely fresh at 0 records.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllTable}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Erasing...' : 'Yes, Restart Table Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SINGLE DELETE CONFIRMATION ================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              Delete Validation Record?
            </div>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this gift card validation row from the table?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingle(deleteConfirmId)}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX MODAL ================= */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedLightboxImage}
              alt="Uploaded Card Verification"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ================= MODAL: SUPABASE SETUP & SQL SCHEMA GUIDE ================= */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Supabase Cloud Sync & SQL Setup
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Real-time automatic cloud synchronization for verified gift cards
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Connection Status Box */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  supabaseStatus.configured
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      supabaseStatus.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs">
                      {supabaseStatus.configured
                        ? 'Supabase Connection Configured'
                        : 'Supabase Not Configured in Environment'}
                    </div>
                    <div className="text-[11px] opacity-80">
                      {supabaseStatus.configured
                        ? `Project URL: ${supabaseStatus.url || 'Configured via environment'}`
                        : 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your platform environment variables.'}
                    </div>
                  </div>
                </div>
                {supabaseStatus.configured && (
                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingToSupabase}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isSyncingToSupabase ? 'Syncing...' : 'Sync All Now'}</span>
                  </button>
                )}
              </div>

              {/* Step 1: SQL Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Create Table in Supabase (SQL Editor)</span>
                  </div>
                  <button
                    type="button"
                    onClick={copySupabaseSql}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  <pre>{`-- 1. Create Enum (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ValidationStatus') THEN
    CREATE TYPE public."ValidationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'INVALID', 'ERROR');
  END IF;
END $$;

-- 2. Create Table
CREATE TABLE IF NOT EXISTS public."GiftCardValidationpin" (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  brand text NOT NULL,
  "cardNumber" text NOT NULL,
  pin text NULL,
  status public."ValidationStatus" NOT NULL DEFAULT 'PENDING'::public."ValidationStatus",
  result text NULL DEFAULT 'Validation pending'::text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  currency text NULL DEFAULT 'USD'::text,
  "cardAmount" double precision NULL DEFAULT 0.0,
  cvv text NULL,
  "expiryDate" text NULL,
  images text[] NULL DEFAULT '{}'::text[],
  CONSTRAINT "GiftCardValidationpin_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_validation_status
  ON public."GiftCardValidationpin" USING btree (status);`}</pre>
                </div>
              </div>

              {/* Step 2: Environment Variables */}
              <div className="space-y-2">
                <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Set Supabase Credentials in Environment</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  In your Supabase project dashboard, navigate to <strong>Project Settings → API</strong>. Copy your Project URL and secret <strong>service_role</strong> key:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">SUPABASE_URL=</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">https://your-project-id.supabase.co</span>
                  </div>
                  <div>
                    <span className="text-slate-400">SUPABASE_SERVICE_ROLE_KEY=</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">your_supabase_service_role_secret_key</span>
                  </div>
                </div>
              </div>

              {/* Step 3: How it Works */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Real-Time Sync Workflow</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Every card verified by a customer or added in this admin table editor is stored safely in your application database and automatically pushed to your Supabase table in real time.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Bot Integration Modal */}
      <TelegramIntegrationModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
    </div>
  );
};

