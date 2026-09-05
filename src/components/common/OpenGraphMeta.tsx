import React, { useEffect } from 'react';

export interface OpenGraphMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

export const OpenGraphMeta: React.FC<OpenGraphMetaProps> = ({
  title = 'AllCardStatus - Digital Gift Card Marketplace & Instant Card Validation',
  description = 'Buy, redeem, and validate digital gift cards with instant email delivery and live balance checking across Apple, Amazon, Steam, Visa, Xbox, and top global brands.',
  keywords = 'digital gift cards, buy gift cards online, instant gift card delivery, gift card validation, check gift card balance, crypto gift card marketplace, apple gift card, steam wallet, amazon gift card, visa prepaid card',
  image = 'https://images.unsplash.com/photo-1556742049-0a67d268a735?w=1200&h=630&fit=crop&q=80',
  url = typeof window !== 'undefined' ? window.location.href : 'https://allcardstatus.com/',
  type = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // Document Title
    if (title) {
      document.title = title;
    }

    const setMetaTag = (selector: string, value: string, attributeName: string = 'content') => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        if (selector.includes('property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) tag.setAttribute('property', prop);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attributeName, value);
    };

    // Standard SEO Tags
    setMetaTag('meta[name="description"]', description);
    if (keywords) {
      setMetaTag('meta[name="keywords"]', keywords);
    }
    setMetaTag('meta[name="robots"]', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Canonical link tag
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', url);

    // Open Graph Tags
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[property="og:image"]', image);
    setMetaTag('meta[property="og:image:secure_url"]', image);
    setMetaTag('meta[property="og:url"]', url);
    setMetaTag('meta[property="og:type"]', type);
    setMetaTag('meta[property="og:site_name"]', 'AllCardStatus');
    setMetaTag('meta[property="og:locale"]', 'en_US');

    // Twitter Tags
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', title);
    setMetaTag('meta[name="twitter:description"]', description);
    setMetaTag('meta[name="twitter:image"]', image);

    // Dynamic JSON-LD structured data injection
    if (jsonLd) {
      const scriptId = 'dynamic-page-jsonld';
      let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, keywords, image, url, type, jsonLd]);

  return null;
};

export default OpenGraphMeta;
