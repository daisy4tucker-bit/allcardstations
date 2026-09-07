import React from 'react';
import { Breadcrumb, BreadcrumbProps } from '../ui/Breadcrumb';
import { BreadcrumbItem } from '../../types/giftCard';

export interface PageContainerProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbProps?: Partial<BreadcrumbProps>;
  className?: string;
  containerClassName?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  breadcrumbs,
  breadcrumbProps,
  className = '',
  containerClassName = '',
}) => {
  return (
    <main className={`flex-1 w-full py-3 sm:py-6 ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <Breadcrumb items={breadcrumbs} {...breadcrumbProps} />
          </div>
        )}
        {children}
      </div>
    </main>
  );
};

