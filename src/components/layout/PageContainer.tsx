import React from 'react';
import { Breadcrumb } from '../ui/Breadcrumb';
import { BreadcrumbItem } from '../../types/giftCard';

export interface PageContainerProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  containerClassName?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  breadcrumbs,
  className = '',
  containerClassName = '',
}) => {
  return (
    <main className={`flex-1 w-full py-6 sm:py-10 ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        {children}
      </div>
    </main>
  );
};
