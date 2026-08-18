import React, { useEffect } from 'react';

export interface OpenGraphMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

export const OpenGraphMeta: React.FC<OpenGraphMetaProps> = ({
  title = 'AllCardVault - Digital Gift Card Marketplace & Instant Card Validation',
  description = 'Buy, redeem, and validate digital gift cards with instant email delivery and live balance checking across Apple, Amazon, Steam, Visa, Xbox, and top global brands.',
  image = 'https://images.unsplash.com/photo-1556742049-0a67d268a735?w=1200&h=630&fit=crop&q=80',
  url = typeof window !== 'undefined' ? window.location.href : 'https://allcardvault.onrender.com/',
  type = 'website',
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

    // Standard Description
    setMetaTag('meta[name="description"]', description);

    // Open Graph Tags
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[property="og:image"]', image);
    setMetaTag('meta[property="og:image:secure_url"]', image);
    setMetaTag('meta[property="og:url"]', url);
    setMetaTag('meta[property="og:type"]', type);
    setMetaTag('meta[property="og:site_name"]', 'AllCardVault');
    setMetaTag('meta[property="og:locale"]', 'en_US');

    // Twitter Tags
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', title);
    setMetaTag('meta[name="twitter:description"]', description);
    setMetaTag('meta[name="twitter:image"]', image);
  }, [title, description, image, url, type]);

  return null;
};

export default OpenGraphMeta;
