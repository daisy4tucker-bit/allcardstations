import React from 'react';
import { LayoutGrid, Gamepad2, ShoppingBag, Film, Utensils, Sparkles, Plane, Laptop, LucideIcon } from 'lucide-react';
import { CategoryType } from '../../types/giftCard';
import { CATEGORIES } from '../../data/categories';

const categoryIconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  Gamepad2,
  ShoppingBag,
  Film,
  Utensils,
  Sparkles,
  Plane,
  Laptop,
};

export interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 py-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = categoryIconMap[cat.iconName] || LayoutGrid;

          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-filter-${cat.id.toLowerCase()}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 select-none shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
