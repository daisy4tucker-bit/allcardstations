import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Printer, 
  Share2, 
  ArrowRight,
  Database,
  Globe,
  UserCheck,
  Server
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { SocialShare } from '../components/common/SocialShare';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: '1. Introduction & Overview' },
    { id: 'data-collected', title: '2. Information We Collect' },
    { id: 'how-we-use', title: '3. How We Use Your Data' },
    { id: 'legal-basis', title: '4. Legal Bases (GDPR & CCPA)' },
    { id: 'no-sale', title: '5. Zero Sale of Personal Data' },
    { id: 'security-tls', title: '6. Security & TLS/SSL Encryption' },
    { id: 'cookies', title: '7. Cookies & Local Storage' },
    { id: 'user-rights', title: '8. Your Rights & Data Choices' },
    { id: 'retention', title: '9. Data Retention Policy' },
    { id: 'contact-dpo', title: '10. Contacting Our Privacy Officer' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Legal Center', path: '/privacy' },
        { label: 'Privacy Policy' }
      ]}
    >
      <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <SectionHeading
              tag="Data Protection & Privacy"
              title="AllCardStation Privacy Policy"
              subtitle="Last Updated: August 17, 2026 | Effective for all global users & cardholders."
              align="left"
            />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Policy
            </Button>
            <SocialShare
              variant="modal-trigger"
              title="AllCardStation Privacy Policy"
              description="Read how AllCardStation protects user privacy and complies with GDPR/CCPA standards."
            />
          </div>
        </div>

        {/* Quick Highlights Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">No Data Selling</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We strictly never sell, rent, or monetize your personal or payment information to advertisers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">TLS 1.3 & OpenSSL</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All communications and digital gift card redemption requests are protected by 256-bit SSL transport encryption.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">GDPR & CCPA Compliant</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You maintain full rights to access, update, export, or permanently erase your profile and records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dedicated DPO</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our Data Protection Officer and compliance team review inquiries with rapid response guarantees.
            </p>
          </div>
        </div>

        {/* Content Layout with Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Table of Contents */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Contents
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    activeSection === sec.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {sec.title}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/contact">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                  Contact Privacy Team
                </Button>
              </Link>
            </div>
          </div>

          {/* Legal Text Body */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            
            {/* Section 1 */}
            <section id="intro" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">1</span>
                <span>Introduction & Scope</span>
              </h2>
              <p>
                Welcome to AllCardStation ("AllCardStation", "we", "our", or "us"). This Privacy Policy explains our practices regarding the collection, storage, processing, transfer, and safeguarding of information gathered from individuals who access our marketplace website (allcardstation.com), mobile interfaces, gift card validation utilities, or customer support communication channels.
              </p>
              <p>
                By accessing or purchasing digital gift card products through AllCardStation, you acknowledge that you have read, understood, and agree to the data handling terms outlined in this statement.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collected" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
                <span>Information We Collect</span>
              </h2>
              <p>We only collect information strictly required to deliver digital gift cards, protect accounts against fraud, and comply with international anti-money laundering (AML) protocols:</p>
              
              <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm pl-2">
                <li><strong className="text-slate-900 dark:text-white">Account & Contact Identifiers:</strong> Name, verified email address, phone number (optional), and encrypted password hashes.</li>
                <li><strong className="text-slate-900 dark:text-white">Transaction Records:</strong> Brand selected, denomination amount, timestamp, payment method token, recipient delivery email, and unique claim transaction identifiers.</li>
                <li><strong className="text-slate-900 dark:text-white">Card Validation Query Logs:</strong> Card brand name, serial digits, and verification status for dispute resolution and balance queries.</li>
                <li><strong className="text-slate-900 dark:text-white">Device & Technical Telemetry:</strong> IP address, browser user-agent, operating system, and session security cookies.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="how-we-use" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">3</span>
                <span>How We Use Your Information</span>
              </h2>
              <p>Your data is utilized strictly for lawful purposes, including:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Order Fulfillment</div>
                  <p className="text-slate-500 dark:text-slate-400">Issuing authentic digital card codes directly to the recipient's secure inbox.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Fraud Prevention</div>
                  <p className="text-slate-500 dark:text-slate-400">Detecting chargeback abuse, duplicate code scraping, and bot interference.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Customer Support</div>
                  <p className="text-slate-500 dark:text-slate-400">Investigating delivery inquiries and resolving balance validation questions.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Regulatory Compliance</div>
                  <p className="text-slate-500 dark:text-slate-400">Maintaining required financial records and tax audit transparency.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="legal-basis" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">4</span>
                <span>Legal Bases for Processing (GDPR Article 6)</span>
              </h2>
              <p>We process personal data based on explicit legal grounds:</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm pl-2">
                <li><strong>Contractual Performance:</strong> Processing necessary to fulfill your gift card purchase order.</li>
                <li><strong>Legal Obligation:</strong> Maintaining accounting and anti-fraud documentation as required by global commerce statutes.</li>
                <li><strong>Legitimate Interests:</strong> Protecting platform integrity, investigating malicious behavior, and ensuring server uptime.</li>
                <li><strong>Explicit Consent:</strong> Where you opt in to receive optional promotional updates or balance drop notifications.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="no-sale" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">5</span>
                <span>Zero Sale of Personal Data Guarantee</span>
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Unconditional Non-Disclosure Commitment</span>
                </div>
                <p>
                  AllCardStation has never sold, traded, rented, or leased customer identities or contact records to third-party brokers, and will never do so under any circumstances.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="security-tls" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">6</span>
                <span>Security & TLS/SSL Encryption Architecture</span>
              </h2>
              <p>
                Our infrastructure enforces comprehensive HTTPS with HSTS headers (HTTP Strict Transport Security) and 256-bit TLS 1.3 protocol standards.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-500" />
                  <span>Cryptographic Safeguards:</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                  <li><strong>In-Transit Protection:</strong> Modern TLS 1.3 / OpenSSL cipher suites ensuring end-to-end transport confidentiality.</li>
                  <li><strong>At-Rest Encryption:</strong> Encrypted volume storage for transactional records and PIN vouchers.</li>
                  <li><strong>Credential Security:</strong> Multi-round Argon2 / bcrypt password hashing with unique salts.</li>
                  <li><strong>Automated Threat Defense:</strong> Real-time DDoS mitigation, rate-limiting, and honeypot traps.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="cookies" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">7</span>
                <span>Cookies & Local Storage</span>
              </h2>
              <p>
                We use strictly essential cookies and browser local storage to maintain your theme preference (Light/Dark mode), selected currency rates, and active session tokens. We do not place invasive cross-site tracking cookies.
              </p>
            </section>

            {/* Section 8 */}
            <section id="user-rights" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">8</span>
                <span>Your Rights & Privacy Choices</span>
              </h2>
              <p>Under GDPR, CCPA/CPRA, and international data laws, you have the following guaranteed rights:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <strong>Right to Access:</strong> Request a complete machine-readable copy of your stored records.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <strong>Right to Rectification:</strong> Update inaccurate contact or recipient details anytime.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <strong>Right to Erasure ("Right to be Forgotten"):</strong> Request full deletion of your account.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <strong>Right to Opt-Out:</strong> Unsubscribe from non-transactional announcements with one click.
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="retention" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">9</span>
                <span>Data Retention Policy</span>
              </h2>
              <p>
                Transactional records are retained for the statutory period required under electronic commerce tax and fraud-prevention laws (typically 7 years). Temporary customer support logs and chat transcripts are archived and purged automatically after 180 days.
              </p>
            </section>

            {/* Section 10 */}
            <section id="contact-dpo" className="space-y-3 scroll-mt-24 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">10</span>
                <span>Contacting Our Data Protection Officer</span>
              </h2>
              <p>
                If you have questions regarding this Privacy Policy, wish to exercise any of your data rights, or need assistance from our compliance team, please contact us:
              </p>
              
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs">
                <div className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">AllCardStation Privacy Operations</div>
                <div><strong>Email:</strong> privacy@allcardstation.com / support@allcardstation.com</div>
                <div><strong>Response Guarantee:</strong> Written response within 14 business days</div>
                <div><strong>Physical Jurisdiction:</strong> Digital Asset Compliance Division</div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Link to="/contact">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Submit Data Request via Support Desk
                  </Button>
                </Link>
                <Link to="/terms">
                  <Button variant="ghost" size="sm">
                    View Terms of Service
                  </Button>
                </Link>
              </div>
            </section>

          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default PrivacyPolicy;
