export interface CardFormatIssue {
  type: 'hidden_chars' | 'invalid_length' | 'letter_in_numeric' | 'missing_prefix' | 'regional_currency' | 'scratch_film' | 'pin_format';
  title: string;
  description: string;
  suggestion: string;
  badgeText: string;
}

export interface CardFormatAnalysis {
  hasFormatIssues: boolean;
  issues: CardFormatIssue[];
  cleanedCode: string;
  hasCleanedDifference: boolean;
  brandSpecificTip?: string;
  regionalTip?: string;
}

export function analyzeCardFormat(
  rawCode: string,
  rawPin: string = '',
  brandId: string = 'generic',
  currency: string = 'USD'
): CardFormatAnalysis {
  const issues: CardFormatIssue[] = [];
  const trimmed = rawCode.trim();

  // 1. Detect hidden characters, zero-width characters, extra whitespace, or odd symbols
  const hasZeroWidth = /[\u200B-\u200D\uFEFF\u00A0]/.test(rawCode);
  const hasTrailingOrLeadingSpaces = rawCode !== trimmed;
  const hasInnerDoubleSpaces = /\s{2,}/.test(rawCode);
  const hasInvalidPunctuation = /[^\w\s-]/.test(rawCode);

  let cleaned = rawCode
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '') // remove zero width & non-breaking spaces
    .replace(/[^\w-]/g, '') // remove odd punctuation
    .trim()
    .toUpperCase();

  // Smart prefix normalizations
  if (brandId === 'apple') {
    // If user forgot 'X' prefix but typed 15 chars, or typed lowercase 'x'
    const alphanumericOnly = cleaned.replace(/[-\s]/g, '');
    if (alphanumericOnly.length === 15 && !alphanumericOnly.startsWith('X')) {
      cleaned = 'X' + cleaned;
    }
  } else if (brandId === 'amazon') {
    // Clean trailing or misplaced labels
    cleaned = cleaned.replace(/^CLAIM\s*(CODE)?:?\s*/i, '');
  }

  // Numeric only brands
  const numericOnlyBrands = [
    'ebay',
    'visa-gift',
    'visa-vanilla',
    'mastercard',
    'american-express',
    'sephora',
    'nordstrom',
    'foot-locker',
    'target',
    'starbucks',
    'netflix',
    'spotify',
    'macys',
  ];

  const isNumericBrand = numericOnlyBrands.some((b) => brandId.toLowerCase().includes(b));

  // 2. Check for hidden or stray characters
  if (hasZeroWidth || hasTrailingOrLeadingSpaces || hasInnerDoubleSpaces || hasInvalidPunctuation) {
    issues.push({
      type: 'hidden_chars',
      title: 'Hidden or Extra Characters Detected',
      description: 'Your card code contains invisible formatting, trailing spaces, or invalid symbols copied from email or text.',
      suggestion: 'Remove spaces, dashes, or use our 1-click Auto-Clean tool.',
      badgeText: 'Whitespace / Formatting',
    });
  }

  // 3. Letter in numeric check & typo replacements (e.g. O -> 0, I/L -> 1, S -> 5)
  if (isNumericBrand) {
    const rawDigits = trimmed.replace(/\D/g, '');
    const containsLetters = /[A-Z]/i.test(trimmed);

    if (containsLetters) {
      // Check for common OCR / scratch typos
      const hasConfusableO = /[oO]/.test(trimmed);
      const hasConfusableI = /[iIlL]/.test(trimmed);
      const hasConfusableS = /[sS]/.test(trimmed);

      let confusableNote = '';
      if (hasConfusableO) confusableNote += ' Letter "O" might be number "0".';
      if (hasConfusableI) confusableNote += ' Letter "I" or "l" might be number "1".';
      if (hasConfusableS) confusableNote += ' Letter "S" might be number "5".';

      issues.push({
        type: 'letter_in_numeric',
        title: 'Letters in Number-Only Card',
        description: `This brand requires numerical digits only.${confusableNote || ' Look for letters mistyped in place of numbers.'}`,
        suggestion: 'Replace confusing letters with numbers (e.g., replace "O" with "0").',
        badgeText: 'Numeric Mismatch',
      });

      // Attempt auto-correct letters to numbers
      cleaned = cleaned
        .replace(/[O]/g, '0')
        .replace(/[IL]/g, '1')
        .replace(/[S]/g, '5')
        .replace(/[B]/g, '8')
        .replace(/[Z]/g, '2')
        .replace(/\D/g, '');
    }
  }

  // 4. Brand-specific length and prefix validation
  const cleanAlphanumeric = cleaned.replace(/[-\s]/g, '');
  const cleanLength = cleanAlphanumeric.length;

  if (brandId === 'apple') {
    if (!cleanAlphanumeric.startsWith('X') && cleanAlphanumeric.length > 0) {
      issues.push({
        type: 'missing_prefix',
        title: 'Missing "X" Prefix for Apple Card',
        description: 'Modern Apple unified gift card claim codes strictly start with the capital letter "X".',
        suggestion: 'Inspect the scratch panel — ensure the initial "X" is entered.',
        badgeText: 'Prefix Missing',
      });
    }
    if (cleanLength > 0 && cleanLength !== 16) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid Length (${cleanLength}/16 chars)`,
        description: 'Apple gift cards have exactly 16 characters.',
        suggestion: 'Check if any faded characters were missed beneath the silver coating.',
        badgeText: 'Length Check',
      });
    }
  } else if (brandId === 'american-express') {
    if (!cleanAlphanumeric.startsWith('34') && !cleanAlphanumeric.startsWith('37') && cleanAlphanumeric.length >= 2) {
      issues.push({
        type: 'missing_prefix',
        title: 'Invalid American Express Number',
        description: 'Amex gift cards start with 34 or 37 and contain exactly 15 digits.',
        suggestion: 'Verify the 15-digit number on the front of your card.',
        badgeText: 'Prefix Missing',
      });
    }
    if (cleanLength > 0 && cleanLength !== 15) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid Amex Length (${cleanLength}/15 digits)`,
        description: 'American Express gift cards strictly contain 15 digits (not 16).',
        suggestion: 'Make sure not to include space or extra numbers.',
        badgeText: 'Length Check',
      });
    }
  } else if (brandId === 'ebay') {
    if (cleanLength > 0 && cleanLength !== 13) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid eBay Length (${cleanLength}/13 digits)`,
        description: 'eBay redemption codes have exactly 13 numerical digits.',
        suggestion: 'Scratch gently to ensure all 13 digits are readable.',
        badgeText: 'Length Check',
      });
    }
  } else if (brandId === 'steam') {
    if (cleanLength > 0 && cleanLength !== 15) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid Steam Wallet Length (${cleanLength}/15 chars)`,
        description: 'Steam Wallet codes are 15 alphanumeric characters (usually formatted XXXXX-XXXXX-XXXXX).',
        suggestion: 'Ensure you did not mistake 0 (zero) for O, or 1 for I.',
        badgeText: 'Length Check',
      });
    }
  } else if (brandId === 'playstation') {
    if (cleanLength > 0 && cleanLength !== 12) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid PlayStation Code (${cleanLength}/12 chars)`,
        description: 'PlayStation Store voucher codes are exactly 12 alphanumeric characters.',
        suggestion: 'Voucher codes are 12 characters (formatted XXXX-XXXX-XXXX).',
        badgeText: 'Length Check',
      });
    }
  } else if (brandId === 'xbox') {
    if (cleanLength > 0 && cleanLength !== 25) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid Xbox Code Length (${cleanLength}/25 chars)`,
        description: 'Xbox digital codes have exactly 25 characters in 5x5 blocks (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX).',
        suggestion: 'Verify all 25 characters from your token or receipt.',
        badgeText: 'Length Check',
      });
    }
  } else if (['sephora', 'starbucks', 'nordstrom', 'foot-locker', 'visa-gift', 'visa-vanilla', 'mastercard', 'google-play'].includes(brandId)) {
    if (cleanLength > 0 && cleanLength !== 16) {
      issues.push({
        type: 'invalid_length',
        title: `Invalid Card Length (${cleanLength}/16 digits)`,
        description: 'This gift card requires a 16-character or 16-digit card number.',
        suggestion: 'Check for missed digits or scratch residue.',
        badgeText: 'Length Check',
      });
    }
  }

  // 5. Regional limitation tip
  let regionalTip: string | undefined = undefined;
  if (['apple', 'steam', 'google-play', 'playstation', 'xbox', 'amazon', 'sephora'].includes(brandId)) {
    regionalTip = `Regional limitation: ${brandId.toUpperCase()} cards are region-locked. Make sure your card was issued in ${currency} region.`;
  }

  // 6. Generic scratch check if too short
  if (cleanLength > 0 && cleanLength < 8 && !issues.some(i => i.type === 'invalid_length')) {
    issues.push({
      type: 'scratch_film',
      title: 'Code Appears Incomplete',
      description: 'The entered code is unusually short. Portions of the code may still be covered by the security film.',
      suggestion: 'Ensure the scratch-off area is completely uncovered.',
      badgeText: 'Incomplete Code',
    });
  }

  const hasCleanedDifference = cleaned !== rawCode && cleaned.replace(/[-\s]/g, '') !== rawCode.replace(/[-\s]/g, '');

  return {
    hasFormatIssues: issues.length > 0,
    issues,
    cleanedCode: cleaned,
    hasCleanedDifference,
    brandSpecificTip: getBrandSpecificProTip(brandId),
    regionalTip,
  };
}

export function getBrandSpecificProTip(brandId: string): string {
  switch (brandId) {
    case 'apple':
      return 'Apple gift codes are 16 alphanumeric characters always beginning with "X". Do not confuse with the 8-digit card serial number.';
    case 'steam':
      return 'Steam codes do not use vowels A, E, I, O, U in some regions to avoid offensive words. Check for numbers 0, 1, 5, 8 instead.';
    case 'ebay':
      return 'eBay codes are always 13 numerical digits. If you see letters, double check the scratch strip for the actual claim PIN.';
    case 'american-express':
      return 'American Express gift cards use a 15-digit card number on the front, plus a 4-digit CID/PIN and 3-digit CVV on the back.';
    case 'visa-gift':
    case 'visa-vanilla':
    case 'mastercard':
      return 'Prepaid Visa & Mastercard vouchers require the 16-digit card number, 3-digit CVV, and expiration date.';
    case 'playstation':
      return 'PlayStation discount and wallet codes are 12 characters. PSN codes are strictly region-locked to your account country.';
    case 'xbox':
      return 'Xbox tokens are 25 characters. Characters like 0, 1, I, O, L, S, Z are not used in 25-digit codes to prevent redemption confusion.';
    case 'amazon':
      return 'Amazon claim codes are 14 or 15 characters (e.g. AQ28-XXXXXX-XXXXX). Do not enter the 16-digit serial number.';
    default:
      return 'Ensure the card was activated at the retail checkout counter before attempting balance verification.';
  }
}
