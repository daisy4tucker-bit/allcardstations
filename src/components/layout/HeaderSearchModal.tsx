import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { GIFT_CARDS } from '../../data/brands';
import { GiftCard } from '../../types/giftCard';

export interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['Apple', 'Steam', 'Amazon', 'PlayStation', 'Xbox', 'Netflix', 'Roblox', 'Razer'];

export const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter gift cards based on query
  const filteredCards = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Show top featured / popular cards as quick recommendations
      return GIFT_CARDS.filter(c => c.featured || c.popular).slice(0, 6);
    }
    return GIFT_CARDS.filter((card) => {
      const matchName = card.name.toLowerCase().includes(trimmed);
      const matchCategory = card.category.toLowerCase().includes(trimmed);
      const matchTagline = card.tagline?.toLowerCase().includes(trimmed);
      const matchDescription = card.description?.toLowerCase().includes(trimmed);
      const matchSymbol = card.symbol?.toLowerCase().includes(trimmed);
      return matchName || matchCategory || matchTagline || matchDescription || matchSymbol;
    }).slice(0, 8);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCards[selectedIndex]) {
          handleSelectCard(filteredCards[selectedIndex]);
        } else if (query.trim()) {
          handleSearchSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCards, selectedIndex, query]);

  const handleSelectCard = (card: GiftCard) => {
    onClose();
    navigate(`/gift-cards/${card.slug}`);
  };

  const handleSearchSubmit = () => {
    onClose();
    if (query.trim()) {
      navigate(`/gift-cards?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/gift-cards');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="header-search-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-16 sm:pt-24 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search Gift Cards"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-[#2563EB] shrink-0 mr-3" />
          <input
            ref={inputRef}
            id="header-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search Apple, Steam, Amazon, Xbox, PlayStation..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-medium focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Popular:
          </span>
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:border-blue-500 dark:hover:text-blue-400 font-medium transition-colors shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {query.trim() ? `Matching Brands (${filteredCards.length})` : 'Recommended Brands'}
          </div>

          {filteredCards.length > 0 ? (
            filteredCards.map((card, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={card.id}
                  id={`search-result-${card.slug}`}
                  onClick={() => handleSelectCard(card)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 p-1">
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {card.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {card.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {card.tagline || card.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        From ${card.startingPrice}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Instant Delivery
                      </span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#2563EB] translate-x-0.5' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center px-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No gift cards found matching "{query}"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try searching for a different brand, game, or shopping category.
              </p>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
              >
                <span>Browse All Gift Cards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="hidden sm:flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">ESC</kbd> Close</span>
          </div>
          <button
            type="button"
            id="view-all-search-results-btn"
            onClick={handleSearchSubmit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline py-1"
          >
            <span>View all in Gift Card Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
