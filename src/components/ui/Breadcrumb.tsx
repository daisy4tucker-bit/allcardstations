import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types/giftCard';

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
}) => {
  const defaultSeparator = (
    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 select-none" aria-hidden="true" />
  );

  const activeSeparator = separator !== undefined ? separator : defaultSeparator;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs sm:text-sm font-medium ${className}`}
    >
      <ol
        className="flex items-center flex-wrap gap-1 sm:gap-1.5 list-none p-0 m-0"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Optional Root / Home Item */}
        {showHome && (
          <li
            className="inline-flex items-center gap-1 sm:gap-1.5"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              to={homePath}
              className={`inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded-md hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${linkClassName}`}
              itemProp="item"
            >
              {homeIcon || <Home className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />}
              <span itemProp="name">{homeLabel}</span>
            </Link>
            <meta itemProp="position" content="1" />
            {(items.length > 0) && activeSeparator}
          </li>
        )}

        {/* Dynamic Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast || item.active;
          const position = (showHome ? 2 : 1) + index;

          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-1 sm:gap-1.5 max-w-full"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isCurrent || !item.path ? (
                <span
                  className={`inline-flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[320px] px-1.5 py-0.5 ${activeClassName}`}
                  aria-current="page"
                  itemProp="name"
                  title={item.label}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={`inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[260px] px-1.5 py-0.5 rounded-md hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${linkClassName}`}
                  itemProp="item"
                  title={item.label}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span itemProp="name" className="truncate">{item.label}</span>
                </Link>
              )}

              <meta itemProp="position" content={position.toString()} />
              
              {!isLast && activeSeparator}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
