import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { ShareModal } from './ShareModal';

export interface ShareButtonProps {
  id?: string;
  title: string;
  description: string;
  url?: string;
  image?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  id = 'btn-share-link',
  title,
  description,
  url,
  image,
  variant = 'outline',
  size = 'md',
  label = 'Share',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonStyles = () => {
    let base =
      'inline-flex items-center justify-center font-bold transition-all select-none rounded-xl ';

    // Sizes
    if (variant === 'icon') {
      if (size === 'sm') base += 'w-8 h-8 p-1.5 ';
      else if (size === 'lg') base += 'w-11 h-11 p-3 ';
      else base += 'w-9 h-9 p-2 ';
    } else {
      if (size === 'sm') base += 'px-3 py-1.5 text-xs gap-1.5 ';
      else if (size === 'lg') base += 'px-5 py-3 text-sm gap-2 ';
      else base += 'px-4 py-2 text-xs sm:text-sm gap-2 ';
    }

    // Variants
    if (variant === 'primary') {
      base += 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ';
    } else if (variant === 'secondary') {
      base +=
        'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white ';
    } else if (variant === 'outline') {
      base +=
        'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 ';
    } else if (variant === 'ghost' || variant === 'icon') {
      base +=
        'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 ';
    }

    return `${base} ${className}`.trim();
  };

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Share this link"
        className={getButtonStyles()}
      >
        <Share2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {variant !== 'icon' && <span>{label}</span>}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        url={url}
        image={image}
      />
    </>
  );
};
