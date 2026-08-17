import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '../../types/giftCard';

export interface AccordionProps {
  items: FAQItem[];
  defaultOpenIndex?: number;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenIndex = 0,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(items[defaultOpenIndex] ? [items[defaultOpenIndex].id] : [])
  );

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const headerId = `faq-header-${item.id}`;
        const panelId = `faq-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-all overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
          >
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(item.id)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-50/80 dark:focus:bg-slate-800/80 transition-colors"
            >
              <span className="text-base font-semibold leading-snug">{item.question}</span>
              <div
                className={`w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 animate-in fade-in duration-150"
              >
                <p>{item.answer}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
