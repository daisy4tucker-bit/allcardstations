/**
 * Centralized Site-Wide SEO Configuration
 * AllCardStatus - Digital Gift Card Marketplace & Validation Platform
 */

export interface SEOConfig {
  brandName: string;
  legalName: string;
  domain: string;
  baseUrl: string;
  tagline: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  targetAudience: string;
  marketLocation: string;
  businessDescription: string;
  contactEmail: string;
  defaultOgImage: string;
  twitterHandle: string;
  verification: {
    googleSearchConsole: string;
    googleAnalyticsId: string;
  };
  socialLinks: {
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
  };
  organizationSchema: {
    '@context': string;
    '@type': string;
    name: string;
    legalName: string;
    url: string;
    logo: string;
    description: string;
    foundingDate: string;
    sameAs: string[];
    contactPoint: {
      '@type': string;
      contactType: string;
      email: string;
      availableLanguage: string[];
    };
  };
}

export const SEO_CONFIG: SEOConfig = {
  brandName: 'AllCardStatus',
  legalName: 'AllCardStatus Global Digital Exchange Ltd.',
  domain: 'allcardstatus.com',
  baseUrl: 'https://allcardstatus.com',
  tagline: 'Digital Gift Card Marketplace & Instant Card Validation',
  defaultTitle: 'AllCardStatus – Digital Gift Card Marketplace & Instant Validation',
  titleTemplate: '%s | AllCardStatus',
  defaultDescription:
    'Buy, send, and check your gift card status or balance for Apple, Steam, Amazon, PlayStation, Xbox, and top global brands with instant email delivery and secure checkout.',
  mainKeyword: 'Digital Gift Card Marketplace & Validation',
  secondaryKeywords: [
    'safe gift card validation',
    'instant gift card delivery',
    'digital gift card exchange',
    'check gift card balance online',
    'verify gift card pin authenticity',
    'crypto gift card marketplace',
    'no KYC gift card checkout',
    'buy apple gift cards online',
    'buy steam wallet codes with crypto',
    'instant prepaid visa card delivery',
  ],
  targetAudience:
    'Global consumers, gamers, digital shoppers, and businesses seeking fast, private, and secure electronic gift card purchases and real-time authenticity validation.',
  marketLocation: 'Global / International (US, UK, EU, CA, AU, Worldwide)',
  businessDescription:
    'AllCardStatus is an authorized digital gift card marketplace and multi-brand validation portal delivering authenticated electronic codes with bank-grade encryption, instant email fulfillment, and responsive customer support.',
  contactEmail: 'support@allcardstatus.com',
  defaultOgImage: 'https://allcardstatus.com/og-image.png',
  twitterHandle: '@allcardstatus',
  verification: {
    // Easily configure via .env (VITE_GOOGLE_SITE_VERIFICATION & VITE_GA_MEASUREMENT_ID)
    googleSearchConsole: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SITE_VERIFICATION) || '',
    googleAnalyticsId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || '',
  },
  socialLinks: {
    twitter: 'https://twitter.com/allcardstatus',
  },
  organizationSchema: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AllCardStatus',
    legalName: 'AllCardStatus Global Digital Exchange Ltd.',
    url: 'https://allcardstatus.com',
    logo: 'https://allcardstatus.com/logo.svg',
    description:
      'Authorized digital gift card marketplace and card validation platform delivering authenticated electronic codes with bank-grade encryption.',
    foundingDate: '2024',
    sameAs: ['https://twitter.com/allcardstatus'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@allcardstatus.com',
      availableLanguage: ['English', 'Spanish', 'French', 'German'],
    },
  },
};

/**
 * Helper to build clean canonical URLs
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slashes (except root) and query parameters from canonicals
  if (cleanPath === '/') return SEO_CONFIG.baseUrl;
  const noParams = cleanPath.split('?')[0].split('#')[0];
  const trimmed = noParams.replace(/\/+$/, '');
  return `${SEO_CONFIG.baseUrl}${trimmed}`;
}

/**
 * Helper to build clean page titles
 */
export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle || pageTitle === SEO_CONFIG.defaultTitle) {
    return SEO_CONFIG.defaultTitle;
  }
  if (pageTitle.includes('AllCardStatus')) {
    return pageTitle;
  }
  return `${pageTitle} | ${SEO_CONFIG.brandName}`;
}
