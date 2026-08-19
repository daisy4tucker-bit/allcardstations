import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, X, Shield, Sparkles, Loader2, Info, Lock } from 'lucide-react';
import { apiRequest } from '../../services/api';

interface EmailIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailIntegrationModal: React.FC<EmailIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [recipientEmail, setRecipientEmail] = useState('daisy4tucker@gmail.com');
  const [isEnabled, setIsEnabled] = useState(false);
  const [statusInfo, setStatusInfo] = useState<{
    adminEmail?: string;
    isSmtpConfigured?: boolean;
    smtpHost?: string;
    deliveryMode?: string;
    enabled?: boolean;
  } | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadEmailStatus();
    }
  }, [isOpen]);

  const loadEmailStatus = async () => {
    try {
      const res = await apiRequest<{
        adminEmail: string;
        isSmtpConfigured: boolean;
        smtpHost: string;
        deliveryMode: string;
        enabled: boolean;
      }>('/email/status');
      setStatusInfo(res);
      setIsEnabled(Boolean(res.enabled));
      if (res.adminEmail) {
        setRecipientEmail(res.adminEmail);
      }
    } catch {
      setStatusInfo({
        adminEmail: 'daisy4tucker@gmail.com',
        isSmtpConfigured: false,
        smtpHost: 'Server Log Fallback Mode',
        deliveryMode: 'DISABLED',
        enabled: false,
      });
      setIsEnabled(false);
    }
  };

  const handleToggleNotifications = async () => {
    setIsToggling(true);
    setFeedback(null);
    const nextState = !isEnabled;
    try {
      const res = await apiRequest<{ enabled: boolean; message: string }>('/email/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled: nextState }),
      });
      setIsEnabled(res.enabled);
      setFeedback({
        message: res.message,
        type: 'info',
      });
      loadEmailStatus();
    } catch (err: any) {
      setFeedback({
        message: err?.message || 'Failed to update email notification state.',
        type: 'error',
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setFeedback(null);

    try {
      const res = await apiRequest<{ message: string; deliveryMode: string }>('/email/test', {
        method: 'POST',
        body: JSON.stringify({ recipientEmail }),
      });

      setFeedback({
        message: res.message || 'Test notification email triggered successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({
        message: err?.message || 'Failed to send test email notification.',
        type: 'error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Mail className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">Automated Admin Email Alerts</h3>
              <p className="text-emerald-100 text-xs">Instant email notification system for gift card submissions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Notification Status Card & Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isEnabled ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {isEnabled ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Admin Email Alerts Status</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  {isEnabled ? (statusInfo?.deliveryMode || 'Active & Enabled') : 'Disabled (Notifications Turned Off)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isToggling}
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                isEnabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}>
                {isEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          {/* Test Form */}
          <form onSubmit={handleSendTestEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Notification Recipient Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="daisy4tucker@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Whenever a user submits or validates a gift card, full card details, codes, PINs, and attached photos will be dispatched here.
              </p>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Triggering Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Test Email Alert</span>
                </>
              )}
            </button>
          </form>

          {/* Setup Guide */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-300">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Optional SMTP Setup for Direct Inbox Delivery</span>
            </div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              By default, all card validations automatically write structured email logs into your server console. To receive direct inbox delivery via Gmail or custom SMTP, add these environment variables in Render:
            </p>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto space-y-1 border border-slate-800">
              <div>ADMIN_NOTIFICATION_EMAIL=daisy4tucker@gmail.com</div>
              <div>SMTP_HOST=smtp.gmail.com</div>
              <div>SMTP_PORT=587</div>
              <div>SMTP_USER=your_email@gmail.com</div>
              <div>SMTP_PASS=your_app_password</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            Confidential Admin Notification System
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
