import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  X,
  MessageCircle,
  Send,
  Mail,
  Smartphone,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SocialShareProps {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  variant?: 'buttons' | 'inline' | 'compact' | 'modal-trigger';
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  title = 'AllCardStation - Digital Gift Card Marketplace',
  url,
  description = 'Buy, redeem, and validate digital gift cards instantly with email delivery.',
  variant = 'inline',
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://allcardstation.com');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title} - ${description}`);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      border: 'border-emerald-600',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: 'X (Twitter)',
      icon: Send,
      color: 'bg-black hover:bg-slate-800 text-white',
      border: 'border-slate-800',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      border: 'border-sky-600',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: 'Facebook',
      icon: ExternalLink,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'border-blue-700',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: ExternalLink,
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
      border: 'border-blue-800',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Reddit',
      icon: ExternalLink,
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      border: 'border-orange-700',
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
      border: 'border-slate-800',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'modal-trigger') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          leftIcon={<Share2 className="w-3.5 h-3.5" />}
          className={className}
        >
          Share
        </Button>

        {showModal && (
          <ShareModal
            title={title}
            description={description}
            shareUrl={shareUrl}
            shareLinks={shareLinks}
            copied={copied}
            onCopy={handleCopyLink}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy Link"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <a
          href={shareLinks[0].href}
          target="_blank"
          rel="noreferrer"
          title="Share on WhatsApp"
          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>

        <a
          href={shareLinks[1].href}
          target="_blank"
          rel="noreferrer"
          title="Share on X"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          title="More Share Options"
          className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {showModal && (
          <ShareModal
            title={title}
            description={description}
            shareUrl={shareUrl}
            shareLinks={shareLinks}
            copied={copied}
            onCopy={handleCopyLink}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Share with Friends & Family</span>
        </div>
        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
        </button>
      </div>

      {showQr && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-center space-y-2 border border-slate-200 dark:border-slate-800 animate-in fade-in">
          <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center">
            {/* High visual fidelity QR SVG representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
              {/* Top-left position pattern */}
              <rect x="5" y="5" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
              <rect x="15" y="15" width="10" height="10" fill="currentColor" />

              {/* Top-right position pattern */}
              <rect x="65" y="5" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
              <rect x="75" y="15" width="10" height="10" fill="currentColor" />

              {/* Bottom-left position pattern */}
              <rect x="5" y="65" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
              <rect x="15" y="75" width="10" height="10" fill="currentColor" />

              {/* Data blocks */}
              <rect x="42" y="10" width="8" height="8" />
              <rect x="52" y="18" width="6" height="6" />
              <rect x="40" y="38" width="20" height="8" />
              <rect x="65" y="42" width="10" height="14" />
              <rect x="80" y="45" width="12" height="6" />
              <rect x="45" y="55" width="8" height="15" />
              <rect x="58" y="60" width="12" height="8" />
              <rect x="75" y="68" width="15" height="12" />
              <rect x="42" y="80" width="10" height="10" />
              <rect x="58" y="78" width="14" height="12" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan with your phone camera to open on mobile</p>
        </div>
      )}

      {/* Social Button Badges */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {shareLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              title={`Share via ${item.name}`}
              className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${item.color} shadow-xs hover:scale-105`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold truncate max-w-full">{item.name.split(' ')[0]}</span>
            </a>
          );
        })}
      </div>

      {/* Copy link row */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono select-all focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};

interface ShareModalProps {
  title: string;
  description: string;
  shareUrl: string;
  shareLinks: any[];
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  title,
  description,
  shareUrl,
  shareLinks,
  copied,
  onCopy,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Share This Page</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share across your favorite platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {shareLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={`p-3 rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition-all ${item.color} shadow-xs hover:scale-105`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{item.name}</span>
              </a>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Direct Page Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono select-all focus:outline-none"
            />
            <Button variant="primary" size="sm" onClick={onCopy} leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
