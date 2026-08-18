import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  CreditCard,
  Layers,
  Sparkles,
  ShieldCheck,
  FileCode2,
  ExternalLink,
  ShoppingBag,
  Gamepad2,
  Film,
  Utensils,
  Plane,
  HelpCircle,
  Headphones,
  Info,
  CheckCircle2,
  User,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { GIFT_CARDS } from '../data/brands';
import { CATEGORIES } from '../data/categories';

interface SitemapLink {
  title: string;
  path: string;
  description: string;
  category: 'Core' | 'Categories' | 'Brands' | 'Account' | 'Legal' | 'Technical';
  badge?: string;
  icon?: any;
}

export const Sitemap: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Core navigation pages
  const coreLinks: SitemapLink[] = [
    {
      title: 'Home / Marketplace Frontpage',
      path: '/',
      description: 'Discover popular digital gift cards, instant delivery guarantees, and verification services.',
      category: 'Core',
      badge: 'Main',
      icon: CreditCard,
    },
    {
      title: 'Browse All Gift Cards',
      path: '/gift-cards',
      description: 'Explore the complete catalog with filters by category, currency, region, and denomination.',
      category: 'Core',
      badge: 'Catalog',
      icon: Layers,
    },
    {
      title: 'Validate & Check Card Balance',
      path: '/validate',
      description: 'Real-time card balance verification, card authenticity checks, and digital validation portal.',
      category: 'Core',
      badge: 'Utility',
      icon: ShieldCheck,
    },
    {
      title: 'How It Works',
      path: '/how-it-works',
      description: 'Step-by-step guide explaining digital delivery, checkout security, and card redemption.',
      category: 'Core',
      icon: Info,
    },
    {
      title: 'About AllCardVault',
      path: '/about',
      description: 'Our mission, marketplace infrastructure, security standards, and team.',
      category: 'Core',
      icon: Sparkles,
    },
    {
      title: 'Frequently Asked Questions (FAQ)',
      path: '/faq',
      description: 'Comprehensive answers regarding delivery times, payment methods, validation, and refunds.',
      category: 'Core',
      icon: HelpCircle,
    },
    {
      title: 'Contact & Customer Support',
      path: '/contact',
      description: 'Reach our 24/7 customer experience team, start a live chat, or submit an inquiry.',
      category: 'Core',
      icon: Headphones,
    },
  ];

  // Category links
  const categoryLinks: SitemapLink[] = CATEGORIES.filter((c) => c.id !== 'All').map((cat) => ({
    title: `${cat.label} Gift Cards`,
    path: `/gift-cards?category=${encodeURIComponent(cat.id)}`,
    description: cat.description,
    category: 'Categories',
    badge: `${cat.count} Brands`,
    icon:
      cat.id === 'Gaming'
        ? Gamepad2
        : cat.id === 'Shopping'
        ? ShoppingBag
        : cat.id === 'Entertainment'
        ? Film
        : cat.id === 'Food'
        ? Utensils
        : cat.id === 'Fashion'
        ? Sparkles
        : cat.id === 'Travel'
        ? Plane
        : Layers,
  }));

  // Brand links
  const brandLinks: SitemapLink[] = GIFT_CARDS.map((card) => ({
    title: `${card.name} Gift Card`,
    path: `/gift-cards/${card.slug}`,
    description: card.description || `Buy or redeem digital ${card.name} gift cards instantly with email delivery.`,
    category: 'Brands',
    badge: card.category,
    icon: CreditCard,
  }));

  // Account links
  const accountLinks: SitemapLink[] = [
    {
      title: 'Customer Sign In',
      path: '/signin',
      description: 'Access your customer account to view past orders, track deliveries, and manage favorites.',
      category: 'Account',
      icon: User,
    },
    {
      title: 'Create an Account (Sign Up)',
      path: '/signup',
      description: 'Register for instant checkout, gift recipient address book, and security alerts.',
      category: 'Account',
      icon: User,
    },
    {
      title: 'Customer Dashboard',
      path: '/dashboard',
      description: 'Manage profile information, saved recipients, payment preferences, and support tickets.',
      category: 'Account',
      badge: 'Auth Required',
      icon: User,
    },
  ];

  // Legal and compliance links
  const legalLinks: SitemapLink[] = [
    {
      title: 'Privacy Policy',
      path: '/privacy',
      description: 'Information on data collection, privacy protections, cookie policies, and customer rights.',
      category: 'Legal',
      icon: ShieldCheck,
    },
    {
      title: 'Terms of Service',
      path: '/terms',
      description: 'User agreement, gift card redemption conditions, transaction policies, and governing law.',
      category: 'Legal',
      icon: FileCode2,
    },
    {
      title: 'Security & Fraud Prevention',
      path: '/security',
      description: 'Overview of encryption protocols, tokenization, anti-tampering guards, and compliance.',
      category: 'Legal',
      badge: 'Protected',
      icon: ShieldCheck,
    },
    {
      title: 'HTML Visual Sitemap',
      path: '/sitemap',
      description: 'Human-navigable directory of all pages, categories, and gift card brands.',
      category: 'Legal',
      badge: 'Current Page',
      icon: MapPin,
    },
  ];

  // Technical & Machine-readable endpoints
  const technicalLinks: SitemapLink[] = [
    {
      title: 'XML Sitemap (sitemap.xml)',
      path: '/sitemap.xml',
      description: 'Search-engine standardized XML feed for Google, Bing, and web crawlers.',
      category: 'Technical',
      badge: 'XML 0.9',
      icon: FileCode2,
    },
    {
      title: 'Robots.txt Configuration',
      path: '/robots.txt',
      description: 'Crawler directives, index permissions, and sitemap reference point.',
      category: 'Technical',
      badge: 'Robots',
      icon: FileCode2,
    },
  ];

  const allLinks = useMemo(
    () => [...coreLinks, ...categoryLinks, ...brandLinks, ...accountLinks, ...legalLinks, ...technicalLinks],
    []
  );

  // Filtered links
  const filteredLinks = useMemo(() => {
    let result = allLinks;

    if (activeCategory !== 'All') {
      result = result.filter((l) => l.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.path.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          (l.badge && l.badge.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allLinks, activeCategory, searchQuery]);

  const handleCopyLink = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    setTimeout(() => {
      setCopiedPath(null);
    }, 2000);
  };

  const categoriesList = ['All', 'Core', 'Categories', 'Brands', 'Account', 'Legal', 'Technical'];

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 space-y-8 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Complete Directory & Index</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              AllCardVault Sitemap
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Browse the complete architectural map of our marketplace. Find gift card brand pages, category collections, balance validation tools, account services, and search engine indices.
            </p>

            {/* Quick Meta Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
              <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                📄 <strong>{allLinks.length}</strong> Total Indexed Routes
              </span>
              <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                💳 <strong>{brandLinks.length}</strong> Brand Storefronts
              </span>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl transition-colors font-semibold"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Raw XML Sitemap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any page, brand (e.g. Apple, Steam, Validate), or category..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing <strong>{filteredLinks.length}</strong> of <strong>{allLinks.length}</strong> pages
            </span>
            {searchQuery && (
              <span>
                Filtered by "<em>{searchQuery}</em>"
              </span>
            )}
          </div>
        </div>

        {/* Directory Grid */}
        {filteredLinks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No pages matched your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or switch category filters to find what you are looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 inline-block cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((link) => {
              const Icon = link.icon || CreditCard;
              const isExternal = link.path.endsWith('.xml') || link.path.endsWith('.txt');

              return (
                <div
                  key={link.path}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {link.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {link.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {link.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isExternal ? (
                        <a
                          href={link.path}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                        >
                          <span>{link.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ) : (
                        <Link
                          to={link.path}
                          className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                        >
                          <span>{link.title}</span>
                        </Link>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer link row */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-[170px]" title={link.path}>
                      {link.path}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link.path)}
                        title="Copy direct link"
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        {copiedPath === link.path ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isExternal ? (
                        <a
                          href={link.path}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          to={link.path}
                          className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search Engine & Technical Resource Callout */}
        <div className="bg-slate-100 dark:bg-slate-900/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Search Engine & Crawler Documentation
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            This sitemap is continually synchronized with our gift card directory and validation engines. Web crawlers and automated bots can fetch our structured XML feed directly at <a href="/sitemap.xml" className="text-indigo-600 dark:text-indigo-400 font-mono underline">/sitemap.xml</a> or inspect indexing permissions via <a href="/robots.txt" className="text-indigo-600 dark:text-indigo-400 font-mono underline">/robots.txt</a>.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Sitemap;
