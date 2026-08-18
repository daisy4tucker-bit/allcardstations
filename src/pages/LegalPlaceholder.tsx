import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, ArrowLeft, CheckCircle2, Server, Key, AlertTriangle } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';

export const LegalPlaceholder: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isSecurity = path === '/security';
  const title = isSecurity ? 'Security & Encryption Standards' : 'Terms of Service';
  const tag = isSecurity ? 'Cryptographic Protection' : 'Legal Terms';
  const icon = isSecurity ? Lock : FileText;
  const summary = isSecurity
    ? 'AllCardVault enforces 256-bit TLS 1.3 encryption, OpenSSL verified ciphers, and strict HSTS headers across all transactions.'
    : 'Review the comprehensive operational terms, code redemption protocols, and buyer protections governing AllCardVault.';

  const IconComp = icon;

  return (
    <PageContainer breadcrumbs={[{ label: title }]}>
      <div className="max-w-4xl mx-auto my-6 space-y-6">
        <SectionHeading tag={tag} title={title} subtitle={summary} align="left" className="mb-4" />

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200">
            <IconComp className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Operational Certification: </span>
              AllCardVault operates under verified 256-bit SSL certificate authority validation, automated threat monitoring, and full compliance with GDPR & CCPA digital asset regulations.
            </div>
          </div>

          {isSecurity ? (
            <>
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-500" />
                  <span>1. Enforced HTTPS & HTTP Strict Transport Security (HSTS)</span>
                </h3>
                <p>
                  Every request transmitted to AllCardVault is strictly encrypted over HTTPS. In accordance with modern security best practices, our reverse proxy and server middleware automatically upgrade unencrypted HTTP requests to secure HTTPS and inject the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">Strict-Transport-Security: max-age=63072000; includeSubDomains; preload</code> header.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  <span>2. OpenSSL 256-Bit Cryptographic Ciphers</span>
                </h3>
                <p>
                  We utilize modern TLS 1.3 protocol standards supported by OpenSSL cryptographic libraries. All digital claim codes and authorization tokens are encrypted at rest using AES-256 and protected in transit against man-in-the-middle (MitM) attacks.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>3. Anti-Fraud & Real-Time Card Validation Safeguards</span>
                </h3>
                <p>
                  Our validation engine features automated rate-limiting, honeypot spam traps, and scratch-off PIN masking to ensure sensitive gift card codes remain confidential and protected from brute-force scraping attempts.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Electronic Issuance & Digital Code Delivery</h3>
                <p>
                  Upon successful payment authorization, AllCardVault generates authentic digital gift card claim codes. Codes are dispatched electronically to the purchaser's verified delivery email and accessible in the authenticated account dashboard.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Non-Refundable Nature of Delivered Electronic Codes</h3>
                <p>
                  Because digital codes and claim vouchers are delivered instantly and represent active purchasing power, completed orders cannot be revoked, returned, or refunded once delivered. Please verify the brand denomination and destination currency prior to completing payment.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Authorized Merchant Redemption</h3>
                <p>
                  Gift cards purchased through AllCardVault are valid for direct balance redemption across the respective merchant's authorized digital and physical retail stores. AllCardVault guarantees 100% authenticity at the time of code issuance.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">4. User Account Security</h3>
                <p>
                  Users are responsible for maintaining the confidentiality of their account credentials and delivery inboxes. AllCardVault will never ask for your account password via email or telephone.
                </p>
              </section>
            </>
          )}

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/privacy">
                <Button variant="ghost" size="sm">
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="primary" size="sm">
                  Contact Support Desk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
