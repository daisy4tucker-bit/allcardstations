import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Bot, Shield, ExternalLink, Copy, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface TelegramIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramIntegrationModal: React.FC<TelegramIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch live status from backend
    setStatusLoading(true);
    fetch('/api/telegram/status')
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(Boolean(data.isConfigured));
      })
      .catch(() => {
        setIsConfigured(false);
      })
      .finally(() => setStatusLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim() || undefined,
          chatId: chatId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setFeedback({
          type: 'success',
          message: data.message || 'Test message successfully sent to Telegram!',
        });
        setIsConfigured(true);
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Failed to send test message to Telegram.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Network error connecting to Telegram backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleEnvText = `TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"\nTELEGRAM_CHAT_ID="-100123456789"`;

  const copyEnvSample = () => {
    navigator.clipboard.writeText(sampleEnvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Bot className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Telegram Bot Instant Alerts</h3>
              <p className="text-xs text-sky-100">Receive real-time gift card validation & upload alerts directly in Telegram</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Status Badge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">Backend Environment Status</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {statusLoading ? 'Checking Render & Server environment variables...' : isConfigured ? 'Connected & Active (Server environment variables found)' : 'Not configured in environment variables'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isConfigured ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'}`}>
              {isConfigured ? 'Active' : 'Action Required'}
            </span>
          </div>

          {/* Setup Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Step-by-Step Setup Guide</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
              <li>Open Telegram and search for <strong className="text-sky-600 dark:text-sky-400">@BotFather</strong>.</li>
              <li>Send <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-500 font-mono">/newbot</code> to create your bot and copy your <strong>Bot API Token</strong>.</li>
              <li>Add your new bot to your Telegram group or channel, or message it directly.</li>
              <li>Get your Chat ID (or send a message to <strong className="text-sky-600 dark:text-sky-400">@userinfobot</strong> to see your numeric Chat ID).</li>
              <li>Add <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-500 font-mono">TELEGRAM_BOT_TOKEN</code> and <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-500 font-mono">TELEGRAM_CHAT_ID</code> to your <strong>Render Environment Variables</strong>.</li>
            </ol>
          </div>

          {/* Test Form */}
          <form onSubmit={handleTestNotification} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Test Telegram Bot Connection</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz (Optional if set in Render)"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Telegram Chat ID or Channel ID
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="e.g. 987654321 or -100123456789 (Optional if set in Render)"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 dark:text-white font-mono"
                />
              </div>
            </div>

            {feedback && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'}`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={copyEnvSample}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy .env Variable Sample'}</span>
              </button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Test Notification</span>
              </Button>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <a
            href="https://core.telegram.org/bots"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Official Telegram Bot API Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

      </div>
    </div>
  );
};

export default TelegramIntegrationModal;
