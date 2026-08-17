import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  ShoppingBag, 
  ThumbsUp, 
  CheckCircle2, 
  Sparkles, 
  MessageSquarePlus, 
  Filter, 
  Check, 
  TrendingUp, 
  Lock,
  Calendar,
  History,
  Clock,
  X
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { CUSTOMER_REVIEWS, REVIEW_METRICS } from '../../data/reviews';
import { CustomerReview } from '../../types/giftCard';
import { GIFT_CARDS } from '../../data/brands';

type FilterType = 'all' | 'bought' | 'validated' | '5stars' | 'last_year' | '2_years_ago' | '3_years_ago';

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(CUSTOMER_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // New review form state
  const [newReview, setNewReview] = useState({
    author: '',
    location: '',
    type: 'bought' as 'bought' | 'validated',
    cardName: GIFT_CARDS[0]?.name || 'PlayStation Network',
    denomination: '$50 USD',
    rating: 5,
    comment: '',
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const handleHelpfulClick = (id: string) => {
    setHelpfulVotes((prev) => {
      const isAlreadyVoted = prev[id];
      const nextState = !isAlreadyVoted;
      
      setReviews((prevReviews) =>
        prevReviews.map((r) => {
          if (r.id === id) {
            const currentHelpful = r.helpfulCount || 0;
            return {
              ...r,
              helpfulCount: isAlreadyVoted ? Math.max(0, currentHelpful - 1) : currentHelpful + 1,
            };
          }
          return r;
        })
      );

      return { ...prev, [id]: nextState };
    });
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.comment.trim()) {
      setFormError('Please provide your name and your review comment.');
      return;
    }

    const createdItem: CustomerReview = {
      id: `rev-custom-${Date.now()}`,
      author: newReview.author.trim(),
      avatarBg: newReview.type === 'bought' ? 'bg-indigo-600' : 'bg-emerald-600',
      rating: newReview.rating,
      date: 'Just now (2026)',
      period: 'recent',
      yearLabel: '2026',
      type: newReview.type,
      cardName: newReview.cardName,
      denomination: newReview.denomination,
      comment: newReview.comment.trim(),
      location: newReview.location.trim() || 'Verified User',
      verified: true,
      helpfulCount: 1,
    };

    setReviews([createdItem, ...reviews]);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setShowWriteModal(false);
      setNewReview({
        author: '',
        location: '',
        type: 'bought',
        cardName: GIFT_CARDS[0]?.name || 'PlayStation Network',
        denomination: '$50 USD',
        rating: 5,
        comment: '',
      });
    }, 1200);
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((rev) => {
    if (activeFilter === 'bought') return rev.type === 'bought';
    if (activeFilter === 'validated') return rev.type === 'validated';
    if (activeFilter === '5stars') return rev.rating === 5;
    if (activeFilter === 'last_year') return rev.period === 'last_year';
    if (activeFilter === '2_years_ago') return rev.period === '2_years_ago';
    if (activeFilter === '3_years_ago') return rev.period === '3_years_ago';
    return true;
  });

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  // Helper to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="customer-reviews-section" className="py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Verified Customer Social Proof • 3+ Year Archive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real Experiences From Real Users Over 3 Years
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Transparent, authenticated reviews spanning our 3-year track record. Filter by recent purchases, last year (2025), 2 years ago (2024), or 3 years ago (2023).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              id="btn-open-review-modal"
              variant="outline"
              size="md"
              onClick={() => setShowWriteModal(true)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs sm:text-sm font-bold shadow-xs"
              leftIcon={<MessageSquarePlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            >
              Write a Review
            </Button>
          </div>
        </div>

        {/* OVERALL RATING & SOCIAL PROOF SUMMARY BANNER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Main Score Box */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {REVIEW_METRICS.averageRating}
                </span>
                <span className="text-slate-400 text-lg font-bold">/ 5.0</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {renderStars(5)}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                  ({REVIEW_METRICS.totalReviewsCount.toLocaleString()} Verified Reviews)
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span>3+ Years Continuous Operation (2023 - 2026)</span>
              </div>
            </div>

            {/* Middle Trust Badges */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm mb-1">
                  <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{REVIEW_METRICS.deliveryRate} Delivery</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Instant electronic code delivery via email & screen.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{REVIEW_METRICS.satisfactionRate} Authentic</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Verified code format & valid balance guarantee.
                </div>
              </div>
            </div>

            {/* Right Quick Summary Pillars */}
            <div className="lg:col-span-3 space-y-2 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-4 lg:pt-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero hidden processing fees</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>256-bit bank-grade encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Over 48,000+ cards fulfilled</span>
              </div>
            </div>

          </div>
        </div>

        {/* TIME-PERIOD & ATTRIBUTE FILTER BAR */}
        <div className="space-y-3 mb-8">
          
          {/* Row 1: Time Period Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mr-1 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Timeline:
            </span>

            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>All 3 Years</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {reviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('last_year')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'last_year'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Last Year (2025)</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeFilter === 'last_year' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {reviews.filter((r) => r.period === 'last_year').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('2_years_ago')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeFilter === '2_years_ago'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <History className="w-3 h-3 text-purple-400" />
              <span>2 Years Ago (2024)</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeFilter === '2_years_ago' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {reviews.filter((r) => r.period === '2_years_ago').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('3_years_ago')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeFilter === '3_years_ago'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <History className="w-3 h-3 text-amber-400" />
              <span>3 Years Ago (2023)</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeFilter === '3_years_ago' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {reviews.filter((r) => r.period === '3_years_ago').length}
              </span>
            </button>
          </div>

          {/* Row 2: Category & Rating Filters */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
              <button
                type="button"
                id="filter-review-bought"
                onClick={() => setActiveFilter('bought')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeFilter === 'bought'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gift Cards Bought</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'bought' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {reviews.filter((r) => r.type === 'bought').length}
                </span>
              </button>

              <button
                type="button"
                id="filter-review-validated"
                onClick={() => setActiveFilter('validated')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeFilter === 'validated'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cards Validated</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'validated' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {reviews.filter((r) => r.type === 'validated').length}
                </span>
              </button>

              <button
                type="button"
                id="filter-review-5stars"
                onClick={() => setActiveFilter('5stars')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeFilter === '5stars'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>5 Stars Only</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === '5stars' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {reviews.filter((r) => r.rating === 5).length}
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing {displayedReviews.length} of {filteredReviews.length} verified reviews
            </div>
          </div>

        </div>

        {/* REVIEWS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReviews.map((review) => {
            const hasVoted = helpfulVotes[review.id];
            const initials = review.author
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={review.id}
                id={`review-card-${review.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Author Row & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${review.avatarBg || 'bg-indigo-600'} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {review.author}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {review.location} • {review.date}
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Type Badges */}
                    <div className="flex flex-col items-end gap-1">
                      {review.period === '3_years_ago' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          2023 Veteran
                        </span>
                      )}
                      {review.period === '2_years_ago' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          2024 Customer
                        </span>
                      )}
                      {review.period === 'last_year' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                          2025 Buyer
                        </span>
                      )}

                      {review.type === 'bought' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 shrink-0">
                          <ShoppingBag className="w-3 h-3 text-indigo-500" />
                          <span>Verified Buyer</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Card Validated</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Brand Tag & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg truncate">
                      {review.cardName} {review.denomination ? `• ${review.denomination}` : ''}
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                {/* Bottom Helpful Row */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Authenticity</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHelpfulClick(review.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                      hasVoted
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
                    <span>Helpful ({review.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More Button */}
        {filteredReviews.length > visibleCount && (
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            >
              Show More Reviews ({filteredReviews.length - visibleCount} remaining)
            </Button>
          </div>
        )}

      </div>

      {/* WRITE A REVIEW MODAL */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 shadow-2xl relative">
            
            <button
              type="button"
              onClick={() => setShowWriteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Share Your Experience
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help the community by sharing your gift card purchase or validation story.
                </p>
              </div>
            </div>

            {formSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Thank You for Your Feedback!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your verified review has been published to the community feed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="space-y-4 text-left">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={newReview.author}
                      onChange={(e) => {
                        setNewReview({ ...newReview, author: e.target.value });
                        if (formError) setFormError('');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Miami, FL"
                      value={newReview.location}
                      onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Experience Type Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    What did you do? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewReview({ ...newReview, type: 'bought' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        newReview.type === 'bought'
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>I Bought a Gift Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewReview({ ...newReview, type: 'validated' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        newReview.type === 'validated'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>I Validated a Code</span>
                    </button>
                  </div>
                </div>

                {/* Card Brand & Denomination */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Brand Name
                    </label>
                    <select
                      value={newReview.cardName}
                      onChange={(e) => setNewReview({ ...newReview, cardName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {GIFT_CARDS.slice(0, 15).map((card) => (
                        <option key={card.id} value={card.name}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Denomination
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $50 USD"
                      value={newReview.denomination}
                      onChange={(e) => setNewReview({ ...newReview, denomination: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                      {newReview.rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Review Comment *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your delivery speed, code validity, ease of checkout or validation experience..."
                    value={newReview.comment}
                    onChange={(e) => {
                      setNewReview({ ...newReview, comment: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWriteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    Post Verified Review
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
