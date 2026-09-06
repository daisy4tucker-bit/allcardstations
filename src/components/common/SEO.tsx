import React, { useEffect } from 'react';
import { SEO_CONFIG, formatPageTitle, getCanonicalUrl } from '../../config/seo';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  keywords?: string | string[];
  noindex?: boolean;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = SEO_CONFIG.defaultDescription,
  canonicalPath,
  canonicalUrl,
  keywords,
  noindex = false,
  ogType = 'website',
  ogImage = SEO_CONFIG.defaultOgImage,
  twitterCard = 'summary_large_image',
  structuredData,
}) => {
  useEffect(() => {
    // 1. Page Title
    const formattedTitle = formatPageTitle(title);
    document.title = formattedTitle;

    // Helper to safely find or create a meta tag
    const setMetaTag = (
      selector: string,
      attributeName: string,
      attrVal: string,
      content: string
    ) => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Standard Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Meta Keywords
    const keywordsString = Array.isArray(keywords)
      ? keywords.join(', ')
      : keywords || SEO_CONFIG.secondaryKeywords.join(', ');
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywordsString);

    // 4. Robots Directives
    const robotsContent = noindex
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);
    setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', robotsContent);

    // 5. Canonical Link
    const targetCanonical = canonicalUrl || getCanonicalUrl(canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/'));
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', targetCanonical);

    // 6. Open Graph Meta Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', targetCanonical);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SEO_CONFIG.brandName);
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', ogImage);
    setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    setMetaTag(
      'meta[property="og:image:type"]',
      'property',
      'og:image:type',
      ogImage.endsWith('.jpg') || ogImage.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'
    );
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', formattedTitle);

    // 7. Twitter Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', SEO_CONFIG.twitterHandle);
    setMetaTag('meta[name="twitter:creator"]', 'name', 'twitter:creator', SEO_CONFIG.twitterHandle);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', formattedTitle);

    // 8. JSON-LD Structured Data Injection
    const scriptId = 'page-seo-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // 9. Google Search Console Verification Meta Tag (if configured)
    if (SEO_CONFIG.verification.googleSearchConsole) {
      setMetaTag(
        'meta[name="google-site-verification"]',
        'name',
        'google-site-verification',
        SEO_CONFIG.verification.googleSearchConsole
      );
    }
  }, [
    title,
    description,
    canonicalPath,
    canonicalUrl,
    keywords,
    noindex,
    ogType,
    ogImage,
    twitterCard,
    structuredData,
  ]);

  return null;
};

export default SEO;
