import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, Zap, Globe, Send, CheckCircle2, AlertCircle, Headphones } from 'lucide-react';
import { Button } from '../ui/Button';
import { openTawkChat } from '../common/TawkToChat';

export const Footer: React.FC = () => {
  const currentYear = 2026;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('success');
    setMessage('Successfully subscribed! Check your inbox for exclusive deals.');
    setEmail('');
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800 dark:border-slate-850 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800 dark:border-slate-850">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 inline-block">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-700/80 shadow-sm flex items-center justify-center p-0.5">
                <img src="/logo.svg" alt="AllCardVault Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                All<span className="text-indigo-400">Card</span>Vault
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A premium digital gift-card marketplace that makes discovering, purchasing, and sending digital gifts simple, fast, and secure.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/80 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/60 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/60 dark:border-slate-800">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant eDelivery</span>
              </div>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="pt-4 max-w-md">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                Subscribe to Flash Deals & Discounts
              </h5>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="bg-slate-800 dark:bg-slate-900 text-sm text-white placeholder-slate-400 px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                />
                <Button type="submit" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4">
                  Join
                </Button>
              </form>
              {status === 'success' && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Marketplace Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/gift-cards" className="text-slate-400 hover:text-white transition-colors">
                  Browse All Cards
                </Link>
              </li>
              <li>
                <Link to="/gift-cards?category=Gaming" className="text-slate-400 hover:text-white transition-colors">
                  Gaming Gift Cards
                </Link>
              </li>
              <li>
                <Link to="/gift-cards?category=Shopping" className="text-slate-400 hover:text-white transition-colors">
                  Shopping & Retail
                </Link>
              </li>
              <li>
                <Link to="/gift-cards?category=Entertainment" className="text-slate-400 hover:text-white transition-colors">
                  Streaming & Entertainment
                </Link>
              </li>
              <li>
                <Link to="/validate" className="text-slate-400 hover:text-white transition-colors">
                  Validate a Card
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-white transition-colors">
                  Frequently Asked
                </Link>
              </li>
              <li>
                <button
                  onClick={openTawkChat}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Headphones className="w-3.5 h-3.5 animate-pulse" />
                  <span>24/7 Live Chat (Tawk.to)</span>
                </button>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-slate-400 hover:text-white transition-colors">
                  Sitemap Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/legal" className="text-white font-semibold hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span>Legal & Compliance Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy (GDPR)
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=security" className="text-slate-400 hover:text-white transition-colors">
                  Security & Encryption
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=compliance" className="text-slate-400 hover:text-white transition-colors">
                  AML & Anti-Fraud
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} AllCardVault. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">Enterprise Digital Gift-Card Marketplace</span>
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>English (USD)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
