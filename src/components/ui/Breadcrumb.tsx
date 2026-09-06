import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { BreadcrumbItem } from '../../types/giftCard';
import { SEO_CONFIG } from '../../config/seo';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeLabel?: string;
  homePath?: string;
  homeIcon?: React.ReactNode;
  separator?: React.ReactNode;
  className?: string;
  linkClassName?: string;
  activeClassName?: string;
  enableJsonLd?: boolean;
  collapsible?: boolean;
  maxMobileItems?: number;
}

/**
 * Generates valid Schema.org BreadcrumbList JSON-LD object
 */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
  options: {
    showHome?: boolean;
    homeLabel?: string;
    homePath?: string;
    currentPath?: string;
  } = {}
) {
  const showHome = options.showHome !== false;
  const homeLabel = options.homeLabel || 'Home';
  const homePath = options.homePath || '/';
  const baseUrl = SEO_CONFIG.baseUrl.replace(/\/+$/, '');

  const elements: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }> = [];

  let position = 1;

  if (showHome) {
    elements.push({
      '@type': 'ListItem',
      position: position++,
      name: homeLabel,
      item: `${baseUrl}${homePath.startsWith('/') ? homePath : `/${homePath}`}`,
    });
  }

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    let rawPath = item.path;

    if (!rawPath && isLast && options.currentPath) {
      rawPath = options.currentPath;
    }

    let absoluteUrl: string;
    if (rawPath) {
      absoluteUrl = rawPath.startsWith('http')
        ? rawPath
        : `${baseUrl}${rawPath.startsWith('/') ? rawPath : `/${rawPath}`}`;
    } else {
      absoluteUrl = `${baseUrl}/`;
    }

    elements.push({
      '@type': 'ListItem',
      position: position++,
      name: item.label,
      item: absoluteUrl,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: elements,
  };
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  homeLabel = 'Home',
  homePath = '/',
  homeIcon,
  separator,
  className = '',
  linkClassName = '',
  activeClassName = '',
  enableJsonLd = true,
  collapsible = true,
  maxMobileItems = 3,
}) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to resolve canonical absolute URL for microdata & crawlers
  const getAbsoluteUrl = (path?: string): string => {
    const baseUrl = SEO_CONFIG.baseUrl.replace(/\/+$/, '');
    if (!path) {
      const current = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/';
      return `${baseUrl}${current.startsWith('/') ? current : `/${current}`}`;
    }
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  };

  // 1. Dynamic JSON-LD Structured Data Injection for Crawlers
  useEffect(() => {
    if (!enableJsonLd || items.length === 0) return;

    const scriptId = 'allcardstatus-breadcrumb-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    const jsonLdData = buildBreadcrumbJsonLd(items, {
      showHome,
      homeLabel,
      homePath,
      currentPath: location.pathname + location.search,
    });

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };
  }, [items, showHome, homeLabel, homePath, enableJsonLd, location.pathname, location.search]);

  // Reset collapse state on navigation
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  const defaultSeparator = (
    <ChevronRight
      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 select-none"
      aria-hidden="true"
    />
  );

  const activeSeparator = separator !== undefined ? separator : defaultSeparator;
  const shouldCollapse = collapsible && items.length > maxMobileItems;

  return (
    <nav
      aria-label="Breadcrumb"
      role="navigation"
      className={`flex items-center text-xs sm:text-sm font-medium ${className}`}
    >
      <ol
        className="flex items-center flex-wrap gap-1 sm:gap-1.5 list-none p-0 m-0"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Root / Home Item */}
        {showHome && (
          <li
            className="inline-flex items-center gap-1 sm:gap-1.5"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              to={homePath}
              className={`group inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded-md hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${linkClassName}`}
              itemProp="item"
              title={homeLabel}
            >
              {homeIcon || (
                <Home
                  className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                  aria-hidden="true"
                />
              )}
              <span itemProp="name">{homeLabel}</span>
            </Link>
            <link itemProp="item" href={getAbsoluteUrl(homePath)} />
            <meta itemProp="position" content="1" />
            {items.length > 0 && (
              <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none" aria-hidden="true">
                {activeSeparator}
              </span>
            )}
          </li>
        )}

        {/* Dynamic Breadcrumb Trail */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast || item.active;
          const position = (showHome ? 2 : 1) + index;
          const itemAbsoluteUrl = getAbsoluteUrl(
            item.path || (isLast ? `${location.pathname}${location.search}` : '')
          );

          // Collapsing condition for deep paths on mobile view
          const isIntermediate = shouldCollapse && index > 0 && index < items.length - 1;
          const isHiddenOnMobile = isIntermediate && !isExpanded;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {/* Ellipsis toggle for collapsed intermediate trail on mobile */}
              {isIntermediate && index === 1 && !isExpanded && (
                <li className="inline-flex sm:hidden items-center gap-1" aria-hidden="true">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="inline-flex items-center justify-center px-1 py-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                    aria-label="Expand all breadcrumb links"
                    title="Expand path"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none">
                    {activeSeparator}
                  </span>
                </li>
              )}

              <li
                className={`items-center gap-1 sm:gap-1.5 max-w-full ${
                  isHiddenOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'
                }`}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {isCurrent || !item.path ? (
                  <span
                    className={`inline-flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[320px] md:max-w-[420px] px-1.5 py-0.5 ${activeClassName}`}
                    aria-current="page"
                    itemProp="name"
                    title={item.label}
                  >
                    {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className={`group inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[260px] px-1.5 py-0.5 rounded-md hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${linkClassName}`}
                    itemProp="item"
                    title={item.label}
                  >
                    {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
                    <span itemProp="name" className="truncate">{item.label}</span>
                  </Link>
                )}

                {/* Schema.org item URL link & position metadata for crawlers */}
                <link itemProp="item" href={itemAbsoluteUrl} />
                <meta itemProp="position" content={position.toString()} />

                {!isLast && (
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none" aria-hidden="true">
                    {activeSeparator}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

