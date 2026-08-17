import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface BitcoinQRCodeProps {
  size?: number;
  address?: string;
  currency?: string;
  amount?: number | string;
  className?: string;
}

export const BitcoinQRCode: React.FC<BitcoinQRCodeProps> = ({ 
  size = 220, 
  address = 'ltc1qa9flfw3e06028jqlwe0r8cw5vv7fwq762dgsk8',
  currency = 'LTC',
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const rawAddress = (address || '').trim();
    if (!rawAddress) return;

    // We encode the pure raw address directly so that EVERY wallet, camera,
    // scanner, exchange app, and mobile OS recognizes and scans it with 100% reliability
    // without protocol prefix incompatibility or logo occlusion.
    QRCode.toDataURL(rawAddress, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: Math.max(size * 2, 400),
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate crypto QR code:', err);
      });
  }, [address, currency, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`relative bg-white p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Click to copy ${address}`}
      onClick={handleCopy}
    >
      {dataUrl ? (
        <div className="relative w-full h-full flex items-center justify-center cursor-pointer">
          {/* 100% Clean, unobstructed, high-contrast QR Matrix */}
          <img 
            src={dataUrl} 
            alt={`${currency} QR Code for ${address}`} 
            className="w-full h-full object-contain select-none block"
            style={{ imageRendering: 'crisp-edges' }}
          />

          {/* Feedback indicator on hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded shadow">
              {copied ? 'Copied Address!' : 'Click to Copy'}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center">
          <span className="text-xs text-slate-400 font-mono">Generating QR...</span>
        </div>
      )}
    </div>
  );
};
