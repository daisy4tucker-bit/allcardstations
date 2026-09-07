import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ShieldCheck, 
  ShoppingBag, 
  ThumbsUp, 
  CheckCircle2, 
  Sparkles, 
  MessageSquarePlus, 
  Check, 
  X,
  History,
  TrendingUp,
  Award,
  Zap,
  Filter
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CUSTOMER_REVIEWS, REVIEW_METRICS } from '../../data/reviews';
import { CustomerReview } from '../../types/giftCard';
import { GIFT_CARDS } from '../../data/brands';

type PeriodFilter = 'all' | 'recent' | 'last_year' | '2_years_ago' | '3_years_ago';
type TypeFilter = 'all' | 'bought' | 'validated' | '5stars';

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(CUSTOMER_REVIEWS);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

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
      avatarBg: newReview.type === 'bought' ? 'bg-[#2563EB]' : 'bg-[#86A98D]',
      rating: newReview.rating,
      date: 'Just now',
      period: 'recent',
      yearLabel: '2026',
      type: newReview.type,
      cardName: newReview.cardName,
      denomination: newReview.denomination,
      comment: newReview.comment.trim(),
      location: newReview.location.trim() || 'Verified Customer',
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

  // Filter logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Period filter
      if (periodFilter === 'recent' && rev.period !== 'recent') return false;
      if (periodFilter === 'last_year' && rev.period !== 'last_year') return false;
      if (periodFilter === '2_years_ago' && rev.period !== '2_years_ago') return false;
      if (periodFilter === '3_years_ago' && rev.period !== '3_years_ago') return false;

      // Type filter
      if (typeFilter === 'bought' && rev.type !== 'bought') return false;
      if (typeFilter === 'validated' && rev.type !== 'validated') return false;
      if (typeFilter === '5stars' && rev.rating !== 5) return false;

      // Brand filter
      if (selectedBrand !== 'all' && rev.cardName !== selectedBrand) return false;

      return true;
    });
  }, [reviews, periodFilter, typeFilter, selectedBrand]);

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  // Helper to render stars
  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const getNormalizedAvatarBg = (bg?: string) => {
    if (!bg) return 'bg-[#2563EB]';
    if (bg.includes('emerald') || bg.includes('green') || bg.includes('teal')) return 'bg-[#86A98D]';
    if (bg.includes('purple') || bg.includes('violet') || bg.includes('fuchsia') || bg.includes('indigo') || bg.includes('blue')) return 'bg-[#2563EB]';
    if (bg.includes('amber') || bg.includes('yellow') || bg.includes('orange')) return 'bg-amber-600';
    if (bg.includes('rose') || bg.includes('red') || bg.includes('pink')) return 'bg-[#1D4ED8]';
    return 'bg-[#2563EB]';
  };

  const starPercentMap = useMemo(() => {
    const map: Record<number, number> = { 5: 96, 4: 4, 3: 0, 2: 0, 1: 0 };
    if (REVIEW_METRICS?.starsDistribution) {
      REVIEW_METRICS.starsDistribution.forEach((s) => {
        map[s.stars] = s.percentage;
      });
    }
    return map;
  }, []);

  return (
    <section id="customer-reviews-section" className="py-12 sm:py-16 bg-[#F5F7FA] dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Write Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Verified Customer Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-white tracking-tight">
              Customer Reviews & Feedback History
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Transparent, authenticated reviews from customers who purchased or verified digital gift cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              id="btn-open-review-modal"
              size="sm"
              onClick={() => setShowWriteModal(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              leftIcon={<MessageSquarePlus className="w-4 h-4 text-white" />}
            >
              Write a Review
            </Button>
          </div>
        </div>

        {/* OVERALL RATING & SOCIAL PROOF SUMMARY BANNER */}
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Score Box */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {REVIEW_METRICS.averageRating}
                </span>
                <span className="text-slate-400 font-bold text-lg">/ 5.0</span>
              </div>

              <div className="my-2">
                {renderStars(5, 'w-5 h-5')}
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Based on {REVIEW_METRICS.totalReviewsCount.toLocaleString()} Verified Customer Reviews
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86A98D]/15 text-[#86A98D] text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3+ Years Continuous Operation</span>
              </div>
            </div>

            {/* Ratings Breakdown Progress Bars */}
            <div className="lg:col-span-5 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 dark:text-slate-300">5 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${starPercentMap[5]}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-slate-500 text-[11px]">{starPercentMap[5]}%</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 dark:text-slate-300">4 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400/80 rounded-full" style={{ width: `${starPercentMap[4]}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-slate-500 text-[11px]">{starPercentMap[4]}%</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 dark:text-slate-300">3 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400/50 rounded-full" style={{ width: `${starPercentMap[3]}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-slate-500 text-[11px]">{starPercentMap[3]}%</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 dark:text-slate-300">2 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-slate-300 dark:bg-slate-700 rounded-full" style={{ width: `${starPercentMap[2]}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-slate-500 text-[11px]">{starPercentMap[2]}%</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 dark:text-slate-300">1 Star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-slate-300 dark:bg-slate-700 rounded-full" style={{ width: `${starPercentMap[1]}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-slate-500 text-[11px]">{starPercentMap[1]}%</span>
              </div>
            </div>

            {/* Quick Pillars */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Instant Delivery SLA</div>
                  <div className="text-[11px] text-slate-500">Average code dispatch &lt; 30s</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#86A98D]/20 text-[#86A98D] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">99.98% Authentic Guarantee</div>
                  <div className="text-[11px] text-slate-500">Official issuer authorized codes</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">24/7 Dispute Support</div>
                  <div className="text-[11px] text-slate-500">Instant live chat & ticket resolution</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TIMELINE ARCHIVE TABS (3+ Years Archive) */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <History className="w-4 h-4 text-[#2563EB]" />
              <span>Timeline:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === 'all'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                All 3 Years
              </button>

              <button
                type="button"
                onClick={() => setPeriodFilter('recent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === 'recent'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                2026 (Live)
              </button>

              <button
                type="button"
                onClick={() => setPeriodFilter('last_year')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === 'last_year'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                2025 (Last Year)
              </button>

              <button
                type="button"
                onClick={() => setPeriodFilter('2_years_ago')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === '2_years_ago'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                2024 Archive
              </button>

              <button
                type="button"
                onClick={() => setPeriodFilter('3_years_ago')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodFilter === '3_years_ago'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                2023 Archive
              </button>
            </div>
          </div>

          {/* Type Filters & Brand Selector */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Actions
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('bought')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  typeFilter === 'bought'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Purchased Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('validated')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  typeFilter === 'validated'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Balance Checks</span>
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('5stars')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  typeFilter === '5stars'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>5 Stars</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Brands</option>
                {GIFT_CARDS.slice(0, 12).map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* REVIEWS GRID */}
        {displayedReviews.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No reviews found for this selection</div>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or selecting All 3 Years.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Author Row & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${getNormalizedAvatarBg(review.avatarBg)} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                            <span>{review.author}</span>
                            {review.yearLabel && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {review.yearLabel}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">
                            {review.location} • {review.date}
                          </div>
                        </div>
                      </div>

                      {review.type === 'bought' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Buyer</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#86A98D]/15 text-[#86A98D] border border-[#86A98D]/30 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#86A98D]" />
                          <span>Checked</span>
                        </span>
                      )}
                    </div>

                    {/* Card Brand Tag & Rating */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-0.5 rounded-lg truncate">
                        {review.cardName} {review.denomination ? `• ${review.denomination}` : ''}
                      </div>
                      {renderStars(review.rating)}
                    </div>

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Bottom Helpful Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-[#86A98D] font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Transaction</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(review.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                        hasVoted
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-[#2563EB] dark:fill-blue-400' : ''}`} />
                      <span>Helpful ({review.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More Button */}
        {filteredReviews.length > visibleCount && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold"
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
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-600/30">
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
                <div className="w-14 h-14 rounded-full bg-[#86A98D]/20 text-[#86A98D] flex items-center justify-center mx-auto">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-[#2563EB] text-[#2563EB] dark:text-blue-300'
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
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-[#2563EB] text-[#2563EB] dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>I Checked a Card</span>
                    </button>
                  </div>
                </div>

                {/* Brand Selection & Denomination */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Card Brand *
                    </label>
                    <select
                      value={newReview.cardName}
                      onChange={(e) => setNewReview({ ...newReview, cardName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      {GIFT_CARDS.map((card) => (
                        <option key={card.id} value={card.name}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Denomination / Amount
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $100 USD"
                      value={newReview.denomination}
                      onChange={(e) => setNewReview({ ...newReview, denomination: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1.5 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2 font-mono">
                      {newReview.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment Text Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your purchase or validation experience..."
                    value={newReview.comment}
                    onChange={(e) => {
                      setNewReview({ ...newReview, comment: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWriteModal(false)}
                    className="border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold cursor-pointer"
                  >
                    Publish Review
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
