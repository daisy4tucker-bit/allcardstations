import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Heart,
  Users,
  Headphones,
  ShieldCheck,
  LogOut,
  Sparkles,
  Coins,
  ShieldAlert,
  CreditCard,
  ChevronRight,
  Loader2,
  Lock,
  Terminal,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/layout/PageContainer';
import { ProfileSection } from '../components/dashboard/ProfileSection';
import { FavoritesSection } from '../components/dashboard/FavoritesSection';
import { RecipientsSection } from '../components/dashboard/RecipientsSection';
import { SupportSection } from '../components/dashboard/SupportSection';
import { OrdersSection } from '../components/dashboard/OrdersSection';
import { Button } from '../components/ui/Button';

type DashboardTab = 'profile' | 'orders' | 'favorites' | 'recipients' | 'support' | 'security';


export const Dashboard: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading, logout, favorites } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') as DashboardTab) || 'profile';
  const [activeTab, setActiveTab] = useState<DashboardTab>(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="font-semibold text-sm">Loading your account dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <PageContainer
        breadcrumbs={[{ label: 'Dashboard' }]}
      >
        <div className="max-w-md mx-auto my-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You must be signed in to view your user profile, saved gift cards, recipients, and support conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signin">
              <Button variant="primary" className="w-full sm:w-auto">
                Sign In to Account
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User, count: null },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: null },
    { id: 'favorites', label: 'Saved Cards', icon: Heart, count: favorites.length },
    { id: 'recipients', label: 'Gift Recipients', icon: Users, count: null },
    { id: 'support', label: 'Customer Support', icon: Headphones, count: null },
    { id: 'security', label: 'Payments & Security', icon: ShieldCheck, count: null },
  ];

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Account Dashboard' },
        { label: tabs.find((t) => t.id === activeTab)?.label || 'Overview' },
      ]}
    >
      <div className="py-6 sm:py-8">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user.firstName} {user.lastName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    Active Account
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {user.email} • {profile?.country || 'Global Account'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="text-slate-600 dark:text-slate-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Layout: Sidebar Navigation + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as DashboardTab)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive
                            ? 'bg-indigo-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Strict Crypto Payment System Badge */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-900/50 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Coins className="w-4 h-4 text-indigo-400" />
                <span>Crypto Gateway Rule</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                AllCardStation uses direct cryptocurrency settlement for privacy and global delivery.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-indigo-200">
                <span>BTC • ETH • LTC • SOL</span>
                <span className="font-bold text-emerald-400">Phase 3</span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'orders' && <OrdersSection />}
            {activeTab === 'favorites' && <FavoritesSection />}
            {activeTab === 'recipients' && <RecipientsSection />}
            {activeTab === 'support' && <SupportSection />}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Security & Cryptocurrency Architecture</span>
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Information regarding platform security, privacy practices, and supported cryptocurrency payment methods.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Zero Traditional Gateways</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      AllCardStation does NOT integrate Stripe, PayPal, bank payment gateways, credit cards, Apple Pay, or Google Pay. We never store credit card numbers.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
                      <Coins className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Supported Cryptocurrencies</span>
                    </div>
                    <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                      Digital gift card checkouts in Phase 3 will exclusively settle via Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Solana (SOL), USDT, and USDC.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Account Authentication & Token Security
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your session is secured using industry-standard JSON Web Tokens (JWT) with hashed credentials (bcrypt). Sensitive profile details and saved recipient contacts are isolated to your authenticated user account.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  );
};
