import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Smartphone,
  MessageCircle,
  Send,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  url,
  image,
}) => {
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'whatsapp' | 'imessage'>('whatsapp');

  if (!isOpen) return null;

  const currentUrl =
    url || (typeof window !== 'undefined' ? window.location.href : 'https://allcardstatus.com');
  const previewImage =
    image || (typeof window !== 'undefined' ? `${window.location.origin}/og-image.png` : 'https://allcardstatus.com/og-image.png');
  const domain =
    typeof window !== 'undefined'
      ? window.location.hostname
      : 'allcardstatus.com';

  const shareText = `${title}\n\n${description}\n\n${currentUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement('input');
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: currentUrl,
        });
        onClose();
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const shareWhatsApp = () => {
    const encoded = encodeURIComponent(`${title}\n${description}\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const shareTelegram = () => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(`${title} - ${description}`);
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  const shareSMS = () => {
    const encoded = encodeURIComponent(`${title}: ${description} ${currentUrl}`);
    window.location.href = `sms:?&body=${encoded}`;
  };

  const shareTwitter = () => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(`${title}\n${description}`);
    window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="modal-social-share"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share Link with Preview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generates image & description when sent on mobile
              </p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            aria-label="Close share dialog"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Selector Tabs */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            Mobile Recipient Preview
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPreviewTab('whatsapp')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                previewTab === 'whatsapp'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('imessage')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                previewTab === 'imessage'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              iMessage
            </button>
          </div>
        </div>

        {/* Realistic Mobile Preview Bubble */}
        {previewTab === 'whatsapp' ? (
          <div className="bg-[#EFEAE2] dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="max-w-[360px] bg-[#E7FFDB] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-xl rounded-tr-none p-2 shadow-sm border border-emerald-200/50 dark:border-emerald-700/30 space-y-2">
              {/* Card Image Banner */}
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-800 border border-black/10">
                <img
                  src={previewImage}
                  alt={title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1 right-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-mono text-white/90">
                  {domain}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 px-1">
                <div className="font-bold text-xs leading-snug line-clamp-1 text-slate-900 dark:text-white">
                  {title}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-200 line-clamp-2 leading-tight">
                  {description}
                </div>
                <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono underline truncate pt-0.5">
                  {currentUrl}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="max-w-[360px] bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
              {/* iMessage Rich Link Header */}
              <div className="relative w-full aspect-[16/9] bg-slate-800">
                <img
                  src={previewImage}
                  alt={title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {domain}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                  {description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Direct Social Channels */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-xs font-semibold gap-1.5"
          >
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={shareSMS}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-xs font-semibold gap-1.5"
          >
            <Smartphone className="w-5 h-5 text-blue-500" />
            <span>SMS / iMessage</span>
          </button>

          <button
            type="button"
            onClick={shareTelegram}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all text-xs font-semibold gap-1.5"
          >
            <Send className="w-5 h-5 text-sky-500" />
            <span>Telegram</span>
          </button>

          <button
            type="button"
            onClick={shareTwitter}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-semibold gap-1.5"
          >
            <ExternalLink className="w-5 h-5 text-indigo-500" />
            <span>X / Twitter</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none select-all"
          />
          <button
            id="btn-copy-share-link"
            type="button"
            onClick={handleCopyLink}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Native Mobile Share Sheet Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            id="btn-native-mobile-share"
            type="button"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Open Mobile Share Sheet</span>
          </button>
        )}

        {/* Informational reassurance */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Rich OpenGraph tags are pre-rendered for instant mobile link previews.</span>
        </div>
      </div>
    </div>
  );
};
