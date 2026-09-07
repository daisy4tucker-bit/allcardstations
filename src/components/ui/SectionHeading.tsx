import React from 'react';

export interface SectionHeadingProps {
  tag?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  titleClassName?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  tag,
  title,
  subtitle,
  align = 'center',
  className = '',
  titleClassName = '',
  as = 'h2',
}) => {
  const alignmentStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  const HeadingTag = as;

  return (
    <div className={`flex flex-col ${alignmentStyles[align]} max-w-3xl mb-4 sm:mb-6 lg:mb-8 ${className}`}>
      {tag && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wide uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-2 sm:mb-2.5">
          {tag}
        </span>
      )}
      <HeadingTag className={`text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug ${titleClassName}`}>
        {title}
      </HeadingTag>
      {subtitle && (
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};
