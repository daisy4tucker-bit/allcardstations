import React, { useEffect } from 'react';
import { WhereIsMyCodeData } from '../../data/cardValidationRequirements';

interface WhereIsMyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  guideData?: WhereIsMyCodeData;
  cardImage?: string;
}

export const WhereIsMyCodeModal: React.FC<WhereIsMyCodeModalProps> = ({
  isOpen,
  onClose,
  brandName,
  guideData,
  cardImage,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerText =
    guideData?.headerText ||
    `Scratch off the metallic security panel on the back of your ${brandName} card to reveal the secret redemption code.`;

  const sampleCode = guideData?.sampleCode || 'XXXX-XXXX-XXXX-XXXX';
  const scratchLabel = guideData?.scratchLabel || 'REDEMPTION CODE';
  const footerTip =
    guideData?.footerTip ||
    `Enter the exact digits as revealed on the card back without adding unnecessary spaces.`;

  const theme = guideData?.theme || 'generic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Dimmer Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center py-6 px-4 animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header Instruction */}
        <div className="text-white text-sm sm:text-base font-medium leading-relaxed max-w-md mb-6 px-2 text-center drop-shadow-sm">
          {headerText.includes('X after scratching') ? (
            <>
              Ensure you take the card out of the packaging and scratch the silver coated area.
              <br />
              You should see a code that begins with the letter <span className="text-red-400 font-bold">X</span> after scratching.
            </>
          ) : headerText.includes('teal area labeled PIN') ? (
            <>
              The wallet code is on the back of your Steam Gift Card.
              <br />
              Scratch the <span className="text-teal-400 font-semibold">teal area</span> labeled <span className="font-bold text-white">PIN</span> to reveal your 15-character code.
            </>
          ) : headerText.includes('16-digit number is on the front') ? (
            <>
              The <span className="font-bold text-white">16-digit number</span> is on the front of your card.
              <br />
              The <span className="font-bold text-white">3-digit CVV</span> is on the back in the signature strip.
            </>
          ) : headerText.includes('green area') ? (
            <>
              The PIN/Voucher Code is on the back of your Razer Gold card.
              <br />
              Scratch the <span className="text-emerald-400 font-semibold">green area</span> to reveal your 14-digit code.
            </>
          ) : headerText.includes('grey area to reveal') || headerText.includes('claim code is on the back') ? (
            <>
              Your claim code is on the back of the card or in your order email.
              <br />
              Scratch the grey area to reveal the 14-15 character code of letters and numbers.
            </>
          ) : (
            headerText.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <br />}
                {line}
              </React.Fragment>
            ))
          )}
        </div>

        {/* MOCKUP VISUALS ACCORDING TO THEME */}
        {theme === 'sephora' ? (
          /* SEPHORA PHYSICAL CARD BACK MOCKUP (Exact replica of user's uploaded image) */
          <div className="w-full max-w-[460px] bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-300 mb-6 text-left relative overflow-hidden flex flex-col justify-between">
            {/* Micro Terms & Conditions */}
            <div className="text-[7px] sm:text-[8px] text-slate-600 font-sans leading-[1.3] mb-3 text-justify select-none border-b border-slate-200/80 pb-2">
              at Sephora inside JCPenney stores. Not refundable or redeemable for cash except as required by law. The value of this card will not be replaced if the card is lost, stolen, altered or destroyed. Does not expire. If your purchase exceeds the balance, you must pay the difference. Card is issued by and is the obligation solely of LGCS Inc. You expressly release Sephora USA, Inc. and its affiliates other than LGCS Inc. for any and all liability with respect to this card. Complete terms and conditions are posted at www.sephora.com/giftcards. Purchase, use, or acceptance of this card constitutes acceptance of its terms and conditions, which may change. For store locations, orders, or card balance inquiries, please visit www.sephora.com or call 1-888-860-7897. 2016 LGCS Inc. All rights reserved.
            </div>

            {/* Middle Row: CARD#: 6130905127718355 and PIN: [Wavy Scratch Panel] */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-xs mb-3">
              {/* CARD NUMBER */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black text-slate-800 tracking-wider">CARD#:</span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-950 tracking-wider select-all">
                  {sampleCode || '6130905127718355'}
                </span>
              </div>

              {/* PIN WITH WAVY SCRATCH FOIL */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-black text-slate-800 tracking-wider">PIN:</span>
                <div className="relative group cursor-pointer" title="Scratch wavy foil to reveal 8-digit PIN">
                  {/* Silver Wavy Foil Texture */}
                  <div className="w-24 sm:w-28 h-7 rounded-sm bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border border-slate-400 flex items-center justify-center overflow-hidden shadow-inner relative">
                    <svg className="w-full h-full opacity-80" viewBox="0 0 100 28" preserveAspectRatio="none">
                      <pattern id="sephoraWavyLines" width="20" height="7" patternUnits="userSpaceOnUse">
                        <path d="M 0 3.5 Q 5 0 10 3.5 T 20 3.5" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                        <path d="M 0 7 Q 5 3.5 10 7 T 20 7" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                      </pattern>
                      <rect width="100" height="28" fill="url(#sephoraWavyLines)" />
                    </svg>
                    <div className="absolute inset-0 border-2 border-red-500/80 rounded-sm pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Barcode with Left Serial */}
            <div className="flex items-end gap-2 pt-1 border-t border-slate-200">
              <div className="text-[8px] font-mono font-bold text-slate-500 select-none pb-0.5">
                21214
              </div>
              <div className="flex-1 h-9 sm:h-11 flex items-end justify-between px-1 overflow-hidden select-none bg-white py-1 rounded">
                {[3, 1, 2, 4, 1, 3, 2, 1, 1, 4, 2, 3, 1, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 3, 1, 2, 1, 4, 2, 1, 3, 2, 4, 1].map((w, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{ width: `${w * 1.6}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : theme === 'visa-dual' ? (
          /* FRONT & BACK DUAL CARDS (Exact match to video & screenshot) */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 w-full max-w-md">
            {/* FRONT CARD */}
            <div className="flex flex-col items-center w-full sm:w-1/2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                FRONT
              </span>
              <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-3.5 flex flex-col justify-between shadow-2xl border border-slate-700/60 relative overflow-hidden text-left">
                {/* Brand / Chip */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">
                    VISA GIFT
                  </span>
                  <div className="w-5 h-4 rounded bg-amber-400/80 border border-amber-300/40" />
                </div>

                {/* 16-Digit Number with Red Underline */}
                <div>
                  <div className="font-mono text-white text-xs sm:text-sm font-bold tracking-widest">
                    •••• •••• •••• 1234
                  </div>
                  <div className="h-0.5 w-full bg-red-500 rounded mt-1 shadow-xs" />
                  <div className="text-[8px] text-slate-400 font-mono mt-1">
                    CARD EXPIRES <span className="text-white font-bold">02/31</span>
                  </div>
                </div>

                {/* Bottom Visa Emblem */}
                <div className="flex justify-end">
                  <div className="px-2 py-0.5 rounded bg-white text-blue-900 font-black italic text-[9px] tracking-tight">
                    DEBIT VISA
                  </div>
                </div>
              </div>
            </div>

            {/* BACK CARD */}
            <div className="flex flex-col items-center w-full sm:w-1/2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                BACK
              </span>
              <div className="w-full h-36 rounded-2xl bg-slate-100 p-0 flex flex-col justify-between shadow-2xl border border-slate-300 relative overflow-hidden text-left">
                {/* Black Magnetic Stripe */}
                <div className="w-full h-7 bg-slate-900 mt-2" />

                {/* Card Terms & CVV Box */}
                <div className="p-3 flex items-center justify-between">
                  <div className="text-[7px] text-slate-600 font-medium leading-tight">
                    VanillaGift.com<br />
                    Card funds never expire.
                  </div>

                  {/* Security Code Highlight Box */}
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-slate-500 uppercase">
                      SECURITY CODE
                    </div>
                    <div className="px-2.5 py-1 rounded bg-white border-2 border-red-500 text-slate-900 font-mono font-black text-xs inline-block tracking-widest shadow-xs">
                      ***
                    </div>
                  </div>
                </div>

                {/* Bottom Logo */}
                <div className="px-3 pb-2 flex justify-end">
                  <span className="text-[10px] font-black italic text-blue-800">VISA</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SINGLE CARD MOCKUP CONTAINER */
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/50 mb-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[170px]">
            
            {/* BRAND GRAPHIC / HEADER INSIDE CARD */}
            {theme === 'apple' ? (
              <div className="mb-3">
                <svg className="w-10 h-10 text-slate-900" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.43-5.6-8.56-9.94-18.42-13.03-29.58-3.09-11.17-4.64-22.18-4.64-33.04 0-16.14 4.21-29.47 12.62-40 8.41-10.53 18.79-15.86 31.13-15.99 4.35 0 9.38 1.15 15.11 3.44 5.72 2.29 9.87 3.51 12.44 3.65 2.12 0 6.53-1.34 13.23-4.02 6.7-2.67 12.18-3.8 16.44-3.39 12.74.87 22.84 5.73 30.3 14.58-11.09 6.74-16.53 16.08-16.32 28.02.21 9.4 3.83 17.27 10.86 23.6 7.03 6.33 15.42 9.94 25.17 10.83-2.34 7.28-5.32 14.92-8.94 22.91zM119.22 31.84c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 11.95-10.45 19.82-12.17 1.07 8.04-1.28 15.34-7.05 21.89-5.78 6.56-12.7 10.37-20.78 10.95z" />
                </svg>
              </div>
            ) : theme === 'steam' ? (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312l2.677-3.896c-.328-.535-.521-1.16-.521-1.831 0-1.862 1.515-3.377 3.377-3.377.34 0 .666.053.974.148l3.197-4.654A5.367 5.367 0 0 0 12 6.643c-2.96 0-5.357 2.398-5.357 5.357 0 .546.085 1.073.238 1.57L2.4 15.82A9.97 9.97 0 0 1 2 12C2 6.477 6.477 2 12 2z" />
                  </svg>
                </div>
                <div className="text-left leading-none">
                  <div className="text-xs font-black tracking-widest text-slate-900">STEAM®</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">POWERED</div>
                </div>
              </div>
            ) : theme === 'amazon' ? (
              <div className="flex items-center justify-center mb-2.5">
                <div className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <span>amazon</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5" />
                </div>
              </div>
            ) : theme === 'razer' ? (
              <div className="flex flex-col items-center justify-center mb-2.5">
                <span className="text-sm font-black tracking-widest text-emerald-500">RAZER</span>
                <span className="text-xs font-black tracking-wider text-amber-500 -mt-0.5">GOLD</span>
              </div>
            ) : theme === 'ebay' ? (
              <div className="flex items-center justify-center text-xl font-black tracking-tight mb-2.5">
                <span className="text-red-500">e</span>
                <span className="text-blue-600">b</span>
                <span className="text-amber-500">a</span>
                <span className="text-emerald-500">y</span>
              </div>
            ) : cardImage ? (
              <img
                src={cardImage}
                alt={brandName}
                className="h-10 object-contain rounded mb-3 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                {brandName}
              </div>
            )}

            {/* Scratch Label */}
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              {scratchLabel}
            </div>

            {/* Code Box with Brand Specific Accents */}
            <div
              className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center font-mono font-bold tracking-widest text-sm sm:text-base select-all relative overflow-hidden shadow-inner ${
                theme === 'apple'
                  ? 'bg-blue-600 text-white'
                  : theme === 'razer'
                  ? 'bg-emerald-950 text-emerald-100 border border-emerald-800/80'
                  : theme === 'steam'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {/* Red corner / left indicator highlight */}
              {theme === 'razer' ? (
                <div className="absolute left-0 top-0 w-8 h-2 bg-red-500 rounded-tl" />
              ) : theme === 'amazon' ? (
                <div className="absolute inset-0 border-2 border-red-500 rounded-xl pointer-events-none" />
              ) : (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l" />
              )}
              <span>{sampleCode}</span>
            </div>
          </div>
        )}

        {/* Footer Tip */}
        <div className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mb-6 px-2 text-center drop-shadow-sm">
          {footerTip.includes('format XXXXX-XXXXX-XXXXX') ? (
            <>
              Enter your code in the format <span className="font-bold text-white">XXXXX-XXXXX-XXXXX</span>.
              <br />
              Dashes are added automatically.
            </>
          ) : footerTip.includes('starts with X') ? (
            <>
              Your code starts with <span className="font-bold text-white">X</span>. Enter it exactly as shown in the field above.
            </>
          ) : footerTip.includes('16-digit number from the front') ? (
            <>
              Enter the <span className="font-bold text-white">16-digit number</span> from the front and the <span className="font-bold text-white">3-digit CVV</span> from the back.
            </>
          ) : footerTip.includes('14-digit code exactly as shown') ? (
            <>
              Enter your <span className="font-bold text-white">14-digit code</span> exactly as shown — no dashes or spaces needed.
            </>
          ) : footerTip.includes('14-15 character claim code') ? (
            <>
              Enter your 14-15 character claim code — dashes are added automatically.
            </>
          ) : (
            footerTip
          )}
        </div>

        {/* "Got it" Button */}
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-2.5 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-bold text-sm shadow-lg transition-all duration-150 cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
