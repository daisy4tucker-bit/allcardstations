import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Printer, 
  Mail, 
  Server, 
  Key, 
  Globe, 
  UserCheck, 
  AlertTriangle,
  ChevronRight,
  Search,
  BookOpen
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';

type LegalTab = 'privacy' | 'terms' | 'security' | 'compliance';

export const LegalCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = (searchParams.get('tab') as LegalTab) || 'privacy';
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTabParam);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as LegalTab;
    if (tabFromUrl && ['privacy', 'terms', 'security', 'compliance'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, badge: 'GDPR & CCPA' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, badge: 'Code Redemption' },
    { id: 'security', label: 'Security & Encryption', icon: Lock, badge: 'TLS 1.3 & AES-256' },
    { id: 'compliance', label: 'Compliance & Anti-Fraud', icon: Scale, badge: 'AML & KYC' },
  ];

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Legal Center', path: '/legal' },
        { label: tabs.find(t => t.id === activeTab)?.label || 'Legal & Compliance' }
      ]}
    >
      <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <SectionHeading
              tag="Legal & Compliance Hub"
              title="AllCardVault Legal & Security Center"
              subtitle="Unified operational protocols, cryptographic standards, data privacy rights, and code redemption terms."
              align="left"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Document
            </Button>
            <Link to="/contact">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Contact Legal
              </Button>
            </Link>
          </div>
        </div>

        {/* Unified Tab Navigation Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as LegalTab)}
                className={`flex flex-col p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {tab.badge}
                  </span>
                </div>
                <span className="text-sm font-bold truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Zero Sale of Data</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We strictly never monetize, sell, or rent your personal information to third-party ad networks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">AES-256 Transport</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  All requests and digital gift card verifications pass over encrypted TLS 1.3 tunnels.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">GDPR & CCPA Rights</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cardholders maintain full rights to export, correct, or permanently remove saved profile data.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Data Protection Officer</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Direct compliance inquiries receive dedicated review within 24 business hours.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Information Collection & Usage Overview</h3>
                <p>
                  AllCardVault collects minimal necessary personal details required to issue and verify authentic digital eGift cards. Collected information includes your account email, order history, recipient dispatch details, and technical session metadata (IP address, browser user-agent, timestamp) used solely for automated fraud protection and rate-limiting.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">2. Legal Bases for Processing (GDPR Article 6)</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Contractual Necessity:</strong> Processing email addresses and crypto transaction hashes to deliver purchased gift card PINs and maintain order records.</li>
                  <li><strong>Legal Obligation:</strong> Retaining mandatory accounting, tax, and anti-money laundering records as required by global regulatory statutes.</li>
                  <li><strong>Legitimate Interests:</strong> Operating real-time algorithmic fraud detection to protect gift card balances against brute-force redemption attempts.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">3. Data Retention & Privacy Choices</h3>
                <p>
                  Account credentials and transaction records remain securely stored while your account is active. Users may request full account deletion or a copy of stored personal records at any time by contacting <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">privacy@allcardvault.com</code>.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Terms of Service */}
        {activeTab === 'terms' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Terms of Usage & Guarantee: </span>
                  All digital cards issued by AllCardVault are guaranteed 100% authentic and valid for instant balance balance redemption at authorized merchant outlets.
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Electronic Issuance & Digital Code Delivery</h3>
                <p>
                  Upon payment authorization on the blockchain or payment network, AllCardVault generates authentic digital gift card claim codes. Codes are dispatched electronically to your delivery email and instantly accessible in your secure Account Dashboard.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">2. Finality & Non-Refundable Nature of Electronic Codes</h3>
                <p>
                  Because electronic gift codes represent immediate purchasing power and cannot be restocked once revealed, completed orders are final and non-refundable once dispatched. Please verify the brand, region, and target currency before confirming payment.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">3. Merchant Balance Redemption</h3>
                <p>
                  eGift cards purchased through AllCardVault carry standard merchant terms and expiration dates as mandated by the issuing retailer (e.g. Apple, Amazon, Steam, Visa). AllCardVault guarantees full initial balance validity upon code issuance.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Encryption */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200">
                <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Cryptographic Shield: </span>
                  All communications enforce TLS 1.3 OpenSSL ciphers, strict HSTS headers, and salt-hashed access tokens.
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" />
                  <span>1. Enforced HTTPS & HSTS Security Headers</span>
                </h3>
                <p>
                  Every request transmitted across AllCardVault is encrypted. Unencrypted requests are automatically upgraded via <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">Strict-Transport-Security: max-age=63072000; includeSubDomains; preload</code> headers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  <span>2. AES-256 PIN Code Decryption Safeguards</span>
                </h3>
                <p>
                  Digital claim codes and authorization tokens are encrypted at rest using AES-256 ciphers. Scratch-off PIN masks protect codes from unauthorized screen scraping until explicitly revealed by the verified card owner.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Tab 4: Compliance & Anti-Fraud */}
        {activeTab === 'compliance' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200">
                <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Regulatory Compliance: </span>
                  AllCardVault adheres strictly to global Anti-Money Laundering (AML) directives and algorithmic transaction risk monitoring.
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Anti-Money Laundering (AML) Thresholds</h3>
                <p>
                  To prevent fraudulent usage and financial abuse, transaction velocity limits and verification thresholds are enforced automatically across all crypto and local currency checkouts. High-volume purchases may require basic identity verification.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">2. Automated Pattern Validation Engine</h3>
                <p>
                  Every card verification request undergoes real-time regex pattern testing against official merchant parameters (e.g. 16-digit card numbers, 4-digit PINs, and prefix checks) to block invalid or compromised serial numbers before processing.
                </p>
              </section>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default LegalCenter;
