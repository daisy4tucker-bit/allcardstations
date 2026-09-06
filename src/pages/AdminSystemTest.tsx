import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Database,
  Activity,
  Cpu,
  RefreshCw,
  Play,
  Clock,
  HardDrive,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  FileCheck,
  UserCheck,
  Zap,
  ArrowLeft,
  ChevronRight,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Camera,
  Maximize2,
  X,
  FolderTree,
  Table,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import * as adminService from '../services/adminService';
import {
  SafeSystemHealth,
  ProbeRunResult,
  AdminAccessLogEntry,
  GiftCardValidationRecord,
  AdminDataBrowserPayload,
} from '../services/adminService';
import { AdminDataBrowser } from '../components/admin/AdminDataBrowser';

export const AdminSystemTest: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, login, logout } = useAuth();
  const navigate = useNavigate();

  // Admin Password Gate State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setAdminPasswordError('Please enter your admin password.');
      return;
    }

    setIsVerifyingPassword(true);
    setAdminPasswordError(null);

    const password = adminPasswordInput.trim();
    let authenticated = false;

    // Verify password against system admin and executive accounts
    const adminEmails = [
      'admin@allcardstatus.com',
      'daisy4tucker@gmail.com',
      'admin@allcardvault.com',
      'admin@allcardstation.com',
    ];

    for (const email of adminEmails) {
      try {
        await login({ email, password });
        authenticated = true;
        break;
      } catch {
        // Continue checking other admin accounts
      }
    }

    if (!authenticated) {
      setAdminPasswordError('Invalid admin password. Access denied.');
      setIsVerifyingPassword(false);
    } else {
      setIsVerifyingPassword(false);
      setAdminPasswordInput('');
    }
  };

  const [activeMainTab, setActiveMainTab] = useState<'diagnostics' | 'data-browser'>('data-browser');
  const [diagnostics, setDiagnostics] = useState<SafeSystemHealth | null>(null);
  const [probeResults, setProbeResults] = useState<ProbeRunResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAccessLogEntry[]>([]);
  const [validationRequests, setValidationRequests] = useState<GiftCardValidationRecord[]>([]);
  const [browserData, setBrowserData] = useState<AdminDataBrowserPayload | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const loadDiagnostics = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const [diagData, valReqs, bData] = await Promise.all([
        adminService.getDiagnosticHealth().catch((e) => {
          console.error('Diagnostic health error:', e);
          return null;
        }),
        adminService.getValidationRequests().catch(() => []),
        adminService.getAdminDataBrowser().catch((e) => {
          console.error('Data browser load error:', e);
          return null;
        }),
      ]);

      if (diagData) {
        setDiagnostics(diagData);
        setAuditLogs(diagData.recentLogs || []);
      }
      setValidationRequests(valReqs);
      if (bData) {
        setBrowserData(bData);
      }
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to load system diagnostics:', err);
      setError(err.message || 'Unable to retrieve diagnostic telemetry.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const handleRunProbes = async () => {
    setIsProbing(true);
    try {
      const results = await adminService.runDiagnosticProbes();
      setProbeResults(results);
      // Reload logs to reflect the probe execution log
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Diagnostic probes failed:', err);
    } finally {
      setIsProbing(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAdmin) {
        loadDiagnostics();
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthLoading, isAdmin, loadDiagnostics]);

  // --- ACCESS CONTROL: BLOCKED FOR GUESTS & CUSTOMERS ---
  if (isAuthLoading || (isAdmin && isLoading && !diagnostics)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Admin Access...</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Checking cryptographic session signature and role authorization.
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <SEO
          title="Admin Sign In – AllCardStatus"
          description="Administrative portal restricted to authorized security personnel."
          canonicalPath="/admin/system-test"
          noindex={true}
        />
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 animate-in fade-in duration-200">
          {/* Header Icon + Title matching uploaded screenshot */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Admin sign in</h2>
          </div>

          {/* Password-only challenge form */}
          <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password-field"
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (adminPasswordError) setAdminPasswordError(null);
                  }}
                  placeholder="Enter your admin password"
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-500 transition-all text-sm font-medium pr-11 shadow-xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {adminPasswordError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{adminPasswordError}</span>
              </div>
            )}

            <button
              id="btn-admin-signin"
              type="submit"
              disabled={isVerifyingPassword}
              className="w-full py-3.5 px-4 rounded-xl bg-[#818cf8] hover:bg-[#6366f1] active:bg-[#4f46e5] text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isVerifyingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            {/* Note matching uploaded screenshot */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                CEO and coworker accounts use the same sign-in.
              </p>
            </div>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Admin System Console & Diagnostics – AllCardStatus"
        description="Internal administrative diagnostic interface for monitoring system health and gift card validations."
        canonicalPath="/admin/system-test"
        noindex={true}
      />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-bold">System Diagnostics</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN ACCESS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Header Title & Actions Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Admin System Console
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Read-only ledger auditing, system diagnostics, and real-time validation monitoring.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
              }}
              leftIcon={<Lock className="w-3.5 h-3.5 text-slate-500" />}
            >
              Lock Console
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDiagnostics}
              isLoading={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunProbes}
              isLoading={isProbing}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              {isProbing ? 'Running Diagnostics...' : 'Run Live Diagnostic Probes'}
            </Button>
          </div>
        </div>

        {/* PRIMARY VIEW NAVIGATION TABS */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setActiveMainTab('data-browser')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'data-browser'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Admin Data Browser</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Audit
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('diagnostics')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'diagnostics'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System Telemetry & Diagnostics</span>
          </button>
        </div>

        {/* ================= VIEW 1: DATA BROWSER TAB ================= */}
        {activeMainTab === 'data-browser' && (
          <div className="space-y-6">
            <AdminDataBrowser
              data={browserData}
              isLoading={isLoading}
              onRefresh={loadDiagnostics}
            />
          </div>
        )}

        {/* ================= VIEW 2: SYSTEM DIAGNOSTICS TAB ================= */}
        {activeMainTab === 'diagnostics' && (
          <div className="space-y-8">

        {/* Security & Credentials Masking Banner */}
        <div className="bg-gradient-to-r from-[#86A98D]/15 via-blue-500/10 to-transparent rounded-2xl border border-[#86A98D]/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#86A98D]/15 text-[#86A98D] flex items-center justify-center shrink-0 border border-[#86A98D]/30">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Zero Exposed Credentials Guarantee
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Database passwords, JWT private keys, and API tokens are strictly isolated on the backend. Only sanitized operational health telemetry is exposed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#86A98D]/15 text-[#86A98D] border border-[#86A98D]/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Credentials Protected
            </span>
          </div>
        </div>

        {/* Global Metric Cards Grid */}
        {diagnostics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Database Health Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Supabase Database
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#86A98D]/15 text-[#86A98D] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {diagnostics.database.connected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <span className="text-xs font-bold text-[#86A98D]">
                    {diagnostics.database.latencyMs >= 0 ? `${diagnostics.database.latencyMs}ms ping` : 'Error'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {diagnostics.database.provider}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Engine: {diagnostics.database.engine.split(' ')[0]}</span>
                <span>SSL: {diagnostics.database.sslEnabled ? 'Active' : 'Off'}</span>
              </div>
            </div>

            {/* Server Memory Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Server Memory
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {diagnostics.server.memory.heapUsedMb} MB
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    / {diagnostics.server.memory.heapTotalMb} MB
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(diagnostics.server.memory.heapUsedPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>RSS: {diagnostics.server.memory.rssMb} MB</span>
                <span>Heap: {diagnostics.server.memory.heapUsedPercent}% used</span>
              </div>
            </div>

            {/* Runtime & Uptime Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Runtime & Node
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {diagnostics.server.nodeVersion}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {diagnostics.server.platform}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Uptime: {diagnostics.server.uptimeFormatted}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Cores: {diagnostics.server.cpuCount}</span>
                <span>Arch: {diagnostics.server.arch}</span>
              </div>
            </div>

            {/* Zero Gateway & Security Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Payment Policy
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ZERO TRADITIONAL
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cards & Fiat Gateways Blocked
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Crypto Phase: Ready</span>
                <span className="text-[#86A98D] font-bold">Compliant</span>
              </div>
            </div>

          </div>
        )}

        {/* Live Diagnostic Probe Runner Results */}
        {probeResults && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  probeResults.overallPassed
                    ? 'bg-[#86A98D]/15 text-[#86A98D]'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}>
                  {probeResults.overallPassed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Diagnostic Test Suite Execution Results
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Executed {probeResults.probes.length} system verification probes in {probeResults.totalDurationMs}ms
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span>Timestamp: {new Date(probeResults.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              {probeResults.probes.map((probe) => (
                <div
                  key={probe.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    probe.passed
                      ? 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {probe.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#86A98D] shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{probe.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {probe.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{probe.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {probe.durationMs}ms
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        probe.passed
                          ? 'bg-[#86A98D]/15 text-[#86A98D]'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {probe.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Table Registry Grid */}
        {diagnostics && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Supabase PostgreSQL Table Registry
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
                Real-time record counts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {[
                { name: 'GiftCard', label: 'Gift Cards', count: diagnostics.database.tables.giftCards },
                { name: 'Category', label: 'Categories', count: diagnostics.database.tables.categories },
                { name: 'User', label: 'User Accounts', count: diagnostics.database.tables.users },
                { name: 'Profile', label: 'User Profiles', count: diagnostics.database.tables.profiles },
                { name: 'Favorite', label: 'Saved Cards', count: diagnostics.database.tables.favorites },
                { name: 'Recipient', label: 'Recipients', count: diagnostics.database.tables.recipients },
                { name: 'Conversation', label: 'Support Threads', count: diagnostics.database.tables.conversations },
                { name: 'Message', label: 'Chat Messages', count: diagnostics.database.tables.messages },
                { name: 'Order', label: 'Orders (Crypto)', count: diagnostics.database.tables.orders },
              ].map((tbl) => (
                <div
                  key={tbl.name}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 space-y-1.5"
                >
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{tbl.label}</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{tbl.count}</div>
                  <div className="font-mono text-[10px] text-slate-400">table: {tbl.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gift Card Validation Requests (Admin View) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Gift Card Validation Requests
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin-only support view of submitted card validation requests, customer info, and status.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Total: {validationRequests.length} requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Request ID</th>
                  <th className="pb-3 px-3">Brand</th>
                  <th className="pb-3 px-3">Code / Mode</th>
                  <th className="pb-3 px-3">CVV / Expiry</th>
                  <th className="pb-3 px-3">Photos (1–3)</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {validationRequests.length > 0 ? (
                  validationRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {req.id}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {req.brand}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs">
                        {req.cardNumberMasked?.startsWith('[Image Verification') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#86A98D]/15 text-[#86A98D] font-bold text-[11px]">
                            <Camera className="w-3 h-3 text-[#86A98D]" />
                            <span>Photo Verification</span>
                          </span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300 font-bold">{req.cardNumberMasked}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {req.cvv ? `CVV: ${req.cvv}` : ''}
                        {req.cvv && req.expiryDate ? ' • ' : ''}
                        {req.expiryDate ? `Exp: ${req.expiryDate}` : (!req.cvv ? '—' : '')}
                      </td>
                      <td className="py-3 px-3">
                        {req.images && req.images.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {req.images.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedPreviewImage(img)}
                                className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group shadow-2xs"
                                title={`View image ${i + 1}`}
                              >
                                <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                  <Maximize2 className="w-3 h-3" />
                                </div>
                              </button>
                            ))}
                            <span className="text-[10px] font-semibold text-slate-400">
                              ({req.images.length})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">No images</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#2563EB] dark:text-blue-400 font-bold">
                        {req.currency} {req.cardAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No validation requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Access Audit Log */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Admin Access Audit & Security Log
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every diagnostic page view and probe execution is logged with timestamp, identity, and status.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {auditLogs.length} recent events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">User / Identity</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {log.email || 'Anonymous Guest'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            log.role === 'ADMIN'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {log.role || 'GUEST'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {log.action}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            log.status === 'SUCCESS'
                              ? 'bg-[#86A98D]/15 text-[#86A98D]'
                              : log.status === 'FORBIDDEN'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {log.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {log.ip}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No access events recorded in current cycle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        </div>
        )}

      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {selectedPreviewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedPreviewImage(null)}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 max-w-2xl w-full bg-slate-900 rounded-3xl p-3 shadow-2xl border border-slate-800 overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-3 py-2 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Card Photo</span>
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full max-h-[75vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/40 p-2">
              <img
                src={selectedPreviewImage}
                alt="Card photo enlarged"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
