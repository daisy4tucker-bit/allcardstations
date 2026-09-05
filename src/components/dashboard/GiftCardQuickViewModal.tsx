import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Download, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Tag, 
  ExternalLink,
  Sparkles,
  QrCode
} from 'lucide-react';
import { PurchaseTransaction } from '../../types/order';
import { formatAmount, printVoucher, downloadVoucherFile, generateBarcodeSvg } from '../../utils/voucherGenerator';
import { Button } from '../ui/Button';

interface GiftCardQuickViewModalProps {
  transaction: PurchaseTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GiftCardQuickViewModal: React.FC<GiftCardQuickViewModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  if (!isOpen || !transaction) return null;

  const displayCode = transaction.eCode || 'ACV-9842-7719-5501';
  const displayPin = transaction.pin || '8849';
  const isDelivered = transaction.status === 'DELIVERED' || transaction.status === 'COMPLETED';

  const handleCopy = (text: string, type: 'code' | 'pin' | 'order') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'pin') {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } else {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#86A98D] animate-pulse"></span>
            <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              Quick View eGift Certificate
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Card Visual Mock */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-slate-900 to-slate-800 p-6 flex flex-col justify-between text-white">
            {transaction.cardImage && (
              <img
                src={transaction.cardImage}
                alt={transaction.cardName}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                  {transaction.category || 'Digital eCard'}
                </span>
                <h4 className="text-xl font-extrabold mt-1 tracking-tight text-white drop-shadow-sm">
                  {transaction.cardName}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white drop-shadow-sm">
                  {formatAmount(transaction.amount, transaction.currency)}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between text-xs text-slate-300">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Order Reference</p>
                <p className="font-mono font-bold text-white">{transaction.id}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#86A98D]/20 text-[#86A98D] border border-[#86A98D]/30 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Active</span>
              </div>
            </div>
          </div>

          {/* eCode & PIN Access Box */}
          {isDelivered ? (
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Digital Redemption Code
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showCode ? 'Hide Code' : 'Reveal Code'}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
                  <span className="font-mono font-extrabold text-base tracking-widest text-slate-900 dark:text-white select-all">
                    {showCode ? displayCode : '•••• •••• •••• ••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(displayCode, 'code')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ml-2"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Security PIN Row */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Security PIN:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {showCode ? displayPin : '••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(displayPin, 'pin')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  {copiedPin ? 'Copied PIN!' : 'Copy PIN'}
                </button>
              </div>

              {/* Visual Barcode */}
              <div className="pt-2 text-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div 
                  dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(displayCode) }}
                  className="flex justify-center"
                />
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                Payment Verification in Progress
              </h5>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Your eCode and security PIN will unlock immediately once your {transaction.cryptoCurrency} transaction completes confirmation on the blockchain.
              </p>
            </div>
          )}

          {/* Detailed Transaction Summary */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-3.5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Order Number</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                <span>{transaction.id}</span>
                <button 
                  onClick={() => handleCopy(transaction.id, 'order')}
                  className="text-slate-400 hover:text-[#2563EB] cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? <Check className="w-3 h-3 text-[#86A98D]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Delivery Destination</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{transaction.customerEmail}</span>
            </div>

            <div className="p-3.5 flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Crypto Settlement</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {transaction.cryptoAmount} {transaction.cryptoCurrency}
              </span>
            </div>

            <div className="p-3.5 flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Created On</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{formattedDate}</span>
            </div>

            {transaction.txHash && (
              <div className="p-3.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">TX Hash</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                  {transaction.txHash}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="primary"
            className="flex-1 shadow-sm"
            onClick={() => downloadVoucherFile(transaction)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Voucher (PDF)
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => printVoucher(transaction)}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};
