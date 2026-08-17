import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const FavoritesSection: React.FC = () => {
  const { favorites, toggleFavorite } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Saved Gift Cards ({favorites.length})</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Quickly access and view denominations for your favorite digital gift cards and gaming vouchers.
            </p>
          </div>
          <Link to="/gift-cards">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore Catalog
            </Button>
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No saved gift cards yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Browse our catalog of over 40+ brands and tap the heart icon on any card to save it for quick access.
            </p>
            <Link to="/gift-cards">
              <Button variant="primary" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                Browse Gift Cards
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {favorites.map((fav) => {
              const card = fav.giftCard;
              if (!card) return null;

              return (
                <div
                  key={fav.id}
                  className="group relative bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Card Thumbnail / Header */}
                    <div className="w-full aspect-16/10 rounded-xl overflow-hidden mb-3.5 bg-slate-900 relative">
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-900 to-slate-900 text-white font-bold">
                          {card.name}
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(card.slug || card.id)}
                          title="Remove from favorites"
                          className="w-8 h-8 rounded-full bg-slate-900/80 text-rose-400 hover:text-rose-300 hover:bg-slate-900 flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[11px] font-mono font-medium text-slate-300 backdrop-blur-xs">
                        {card.category}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1">
                      {card.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">From</span>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        ${card.startingPrice} {card.currency}
                      </p>
                    </div>
                    <Link to={`/gift-cards/${card.slug}`}>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        View Card <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
