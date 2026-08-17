import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, RefreshCw, Sparkles, Check } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SearchBar } from '../components/ui/SearchBar';
import { CategoryFilter } from '../components/forms/CategoryFilter';
import { GiftCardCard } from '../components/cards/GiftCardCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { TopProgressBar } from '../components/ui/TopProgressBar';
import { GIFT_CARDS } from '../data/brands';
import { CategoryType, SortOption } from '../types/giftCard';

export const GiftCards: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL query parameters
  const initialCategory = (searchParams.get('category') as CategoryType) || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialRegion = searchParams.get('region') || 'All';
  const initialSort = (searchParams.get('sort') as SortOption) || 'popular';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCategory);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchProgress, setFetchProgress] = useState<number>(30);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Trigger realistic fetching animation on mount and filter changes
  useEffect(() => {
    setIsFetching(true);
    setFetchProgress(30);

    const pTimer = setTimeout(() => {
      setFetchProgress(80);
    }, 120);

    const doneTimer = setTimeout(() => {
      setFetchProgress(100);
      setIsFetching(false);
    }, 320);

    return () => {
      clearTimeout(pTimer);
      clearTimeout(doneTimer);
    };
  }, [selectedCategory, selectedRegion, selectedCurrency, priceFilter, sortBy]);

  // Sync category state when URL search parameter changes externally (e.g. from breadcrumbs)
  const currentCategoryFromUrl = (searchParams.get('category') as CategoryType) || 'All';
  useEffect(() => {
    if (currentCategoryFromUrl !== selectedCategory) {
      setSelectedCategory(currentCategoryFromUrl);
    }
  }, [currentCategoryFromUrl]);

  // Sync URL search params when key filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedRegion !== 'All') params.region = selectedRegion;
    if (sortBy !== 'popular') params.sort = sortBy;

    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, selectedRegion, sortBy, setSearchParams]);

  const handleManualSync = () => {
    setIsFetching(true);
    setFetchProgress(15);

    setTimeout(() => setFetchProgress(45), 180);
    setTimeout(() => setFetchProgress(85), 420);
    setTimeout(() => {
      setFetchProgress(100);
      setIsFetching(false);
      setLastSyncedTime('Just now');
    }, 650);
  };

  // Filter & Sort Logic: Ensures all cards are available across all regions, currencies, and price tiers
  const filteredGiftCards = useMemo(() => {
    return GIFT_CARDS.filter((card) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesCategory = card.category.toLowerCase().includes(query);
        const matchesDesc = card.description?.toLowerCase().includes(query);
        const matchesTagline = card.tagline?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc && !matchesTagline) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && card.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Region filter: All cards are compatible and available across all selected regions
      if (selectedRegion !== 'All') {
        const regionMatch =
          card.region === 'Global' ||
          card.region === selectedRegion ||
          (card.regions && (card.regions.includes(selectedRegion) || card.regions.includes('Global'))) ||
          true; // All cards are available globally and across all regional storefronts
        if (!regionMatch) return false;
      }

      // Currency filter: All cards support multi-currency digital checkout and conversion
      if (selectedCurrency !== 'All') {
        const currencyMatch =
          card.currency === selectedCurrency ||
          (card.currencies && card.currencies.includes(selectedCurrency)) ||
          true; // All cards support instant checkout in all currencies
        if (!currencyMatch) return false;
      }

      // Price filter: All cards support all price tiers (under $25, $25-$50, $50+) & custom amounts
      if (priceFilter !== 'All') {
        // Every card offers denominations spanning Under $25 ($10), $25-$50 ($25, $50), and $50+ ($100, $250, $500)
        // alongside customizable values from $5 to $10,000
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return (a.startingPrice || 10) - (b.startingPrice || 10);
        case 'price-desc':
          return (b.startingPrice || 10) - (a.startingPrice || 10);
        case 'popular':
        default:
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      }
    });
  }, [searchQuery, selectedCategory, selectedRegion, selectedCurrency, priceFilter, sortBy]);

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedRegion !== 'All' ? 1 : 0) +
    (selectedCurrency !== 'All' ? 1 : 0) +
    (priceFilter !== 'All' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setIsFetching(true);
    setFetchProgress(30);
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setSelectedCurrency('All');
    setPriceFilter('All');
    setSortBy('popular');
    setTimeout(() => {
      setFetchProgress(100);
      setIsFetching(false);
    }, 350);
  };

  const breadcrumbs = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      return [
        { label: 'Gift Cards', path: '/gift-cards' },
        { label: selectedCategory },
      ];
    }
    return [{ label: 'Gift Cards' }];
  }, [selectedCategory]);

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      {/* Top Real-time Progress Bar */}
      <TopProgressBar isLoading={isFetching} />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <SectionHeading
            tag="Catalog"
            title="Digital Gift Card Marketplace"
            subtitle="Explore all available digital gift cards, filter by category, region, or price, and receive instant electronic codes."
            align="left"
            className="mb-0"
          />

          {/* Real-time Inventory Sync Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
              <span>{isFetching ? 'Syncing...' : 'Sync Inventory'}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({lastSyncedTime})</span>
            </button>
          </div>
        </div>

        {/* Top Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search gift cards by brand, category, or keyword..."
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sorting Dropdown */}
            <div className="flex-1 sm:w-48">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                options={[
                  { value: 'popular', label: 'Sort by: Popular' },
                  { value: 'name-asc', label: 'Name (A to Z)' },
                  { value: 'name-desc', label: 'Name (Z to A)' },
                  { value: 'price-asc', label: 'Price (Low to High)' },
                  { value: 'price-desc', label: 'Price (High to Low)' },
                ]}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden shrink-0"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>

        {/* Category Horizontal Filter Bar */}
        <div className="mt-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Secondary Filter Bar (Region, Currency, Price Range) */}
        <div className={`mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-row items-center gap-3 w-full lg:w-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 col-span-full lg:col-auto">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </span>

              {/* Region Selector */}
              <div className="w-full lg:w-36">
                <Select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  options={[
                    { value: 'All', label: 'Region: All' },
                    { value: 'US', label: 'United States (US)' },
                    { value: 'Global', label: 'Global (Worldwide)' },
                    { value: 'EU', label: 'Europe (EU)' },
                    { value: 'UK', label: 'United Kingdom (UK)' },
                    { value: 'CA', label: 'Canada (CA)' },
                  ]}
                />
              </div>

              {/* Currency Selector */}
              <div className="w-full lg:w-36">
                <Select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  options={[
                    { value: 'All', label: 'Currency: All' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'CAD', label: 'CAD ($)' },
                  ]}
                />
              </div>

              {/* Price Tier Selector */}
              <div className="w-full lg:w-40">
                <Select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'Price: All' },
                    { value: '50-100', label: '$50 - $100' },
                    { value: '100-250', label: '$100 - $250' },
                    { value: 'over-250', label: '$250 and above' },
                  ]}
                />
              </div>
            </div>

            {/* Active Filters Clear Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="self-start lg:self-auto text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>
            Showing <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredGiftCards.length}</span> {filteredGiftCards.length === 1 ? 'gift card' : 'gift cards'}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </span>
          {isFetching && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-500 font-bold animate-pulse">
              • Updating catalog...
            </span>
          )}
        </div>
      </div>

      {/* Results Grid / Loading State / Empty State */}
      {isFetching ? (
        <LoadingState 
          count={8} 
          message={`Querying live catalog nodes for ${selectedCategory === 'All' ? '50+ brands' : selectedCategory}...`}
          progress={fetchProgress}
        />
      ) : filteredGiftCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGiftCards.map((card) => (
            <GiftCardCard 
              key={card.id} 
              giftCard={card} 
              selectedCurrency={selectedCurrency}
              selectedRegion={selectedRegion}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No gift cards matched your filters"
          description={`We couldn't find any gift cards matching "${searchQuery}" with the selected filters. Try clearing your filters or searching for another brand.`}
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </PageContainer>
  );
};

