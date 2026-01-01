'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme, useCart, useWishlist, useLocale, countryConfigs } from '@/context';
import { OdooAPI, type Product, type Category } from '@/lib/api/odoo';

interface NavbarProps {
  categories?: Category[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, country, setCountry, t, countryConfig, formatPrice } = useLocale();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search dropdown and mobile menu on route change
  useEffect(() => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node) &&
          mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (countryMenuRef.current && !countryMenuRef.current.contains(e.target as Node)) {
        setShowCountryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-search after 3 characters
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setSearchLoading(true);
      const timer = setTimeout(async () => {
        try {
          const products = await OdooAPI.fetchProducts();
          const query = searchQuery.toLowerCase();
          const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query)
          ).slice(0, 6);
          setSearchResults(filtered);
        } catch {
          setSearchResults([]);
        }
        setSearchLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Categories to hide from main nav (Bath Essentials shows under Bathroom instead)
  const hiddenFromMainNav = ['collections', 'bath assist', 'bath essentials'];

  // Rename mappings for display (database name -> display name)
  const renameCategory = (name: string) => {
    const renames: Record<string, string> = {
      'washlet': 'Toilets',
      'faucets': 'Faucet',
    };
    return renames[name.toLowerCase()] || name;
  };

  // Dedicated pages mapping - categories with custom landing pages
  // Maps category slug to dedicated page URL
  const dedicatedPages: Record<string, string> = {
    'concealed-cisterns': '/concealed-cisterns',
    'wall-hung-toilets': '/wall-hung-toilets',
    'single-piece-toilets': '/siphonicwc',
    'bathtubs': '/bathtubs',
    'jacuzzi': '/jacuzzis',
    'steam-sauna': '/sauna-steam',
  };

  // Get the correct URL for a category - dedicated page or default
  const getCategoryUrl = (cat: Category, hasChildren: boolean) => {
    // Check if category has a dedicated page
    if (dedicatedPages[cat.slug]) {
      return dedicatedPages[cat.slug];
    }
    // Default: category landing page if has children, shop page otherwise
    return hasChildren ? `/${cat.slug}` : `/shop?category=${cat.id}`;
  };

  // Custom submenu order for specific categories (matching bellabathwares.com)
  // Order based on actual database category names from Odoo
  const customSubmenuOrder: Record<string, string[]> = {
    'washroom': [
      'Hygiene Pro',
      'Faucets',
      'Basin Mixer',
      'Basin Mixer Tall',
      'Concealed Basin Mixers',
      'Deck Mount Basin Mixer',
      'Floor Mounted Mixers',
      'Sensor Faucets',
      'Basins',
      'Art Basins',
      'Wall Hung Basins',
      'Pedestal Basin',
      'Stand Basins',
      'Artificial Stone Basins',
      'Stone Art Basins',
      'Stone Stand Basins',
      'Wudu Basin',
      'Cabinets',
      'Shattaf',
      'Shattaf Mixer'
    ],
    'bathroom': [
      'Concealed Shower',
      'Shower Mixer',
      'Shower Mixer Column',
      'Shower Panels',
      'Shower Accessories',
      'Rain Showers',
      'Hand Showers',
      'Shower Arms',
      'Bath Spouts',
      'Shower Rooms',
      'Shower Seats'
    ],
  };

  // Get root categories for nav (exclude hidden ones)
  const rootCategories = categories
    .filter(c => c.parentId === null && !hiddenFromMainNav.includes(c.name.toLowerCase()))
    .slice(0, 6);

  // Find Bath Essentials category to add under Bathroom
  const bathEssentialsCategory = categories.find(c =>
    c.parentId === null && c.name.toLowerCase() === 'bath essentials'
  );

  // Helper to get direct children only (not grandchildren)
  // When a category has children, clicking it opens a page showing those children
  // So we only need to show direct children in the dropdown
  const getDirectChildren = (cat: Category): Category[] => {
    if (!cat.childIds || cat.childIds.length === 0) return [];
    return categories.filter(c => cat.childIds?.includes(c.id));
  };

  // Helper to get ordered submenus for a category (direct children only)
  const getOrderedSubmenus = (cat: Category) => {
    // Get direct children only
    const children = getDirectChildren(cat);
    const customOrder = customSubmenuOrder[cat.name.toLowerCase()];

    if (!customOrder) return children;

    // Sort by custom order, items not in order go to end
    return [...children].sort((a, b) => {
      const aIndex = customOrder.findIndex(name => a.name.toLowerCase() === name.toLowerCase());
      const bIndex = customOrder.findIndex(name => b.name.toLowerCase() === name.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  return (
    <>
      {/* Top Bar */}
      <div className="text-sm py-2" style={{ backgroundColor: '#0d1318', color: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center relative">
          {/* Left side - Theme, Language, Country */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              style={{ color: '#ffffff' }}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef} onMouseLeave={() => setShowLangMenu(false)}>
              <button
                onClick={() => { setShowLangMenu(!showLangMenu); setShowCountryMenu(false); }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded transition-colors text-xs md:text-sm"
                style={{ color: '#ffffff' }}
              >
                <span className="font-medium">{language.toUpperCase()}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLangMenu && (
                <div className="absolute top-full left-0 mt-1 rounded-lg shadow-xl py-1 min-w-[120px] z-[100]" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e0d8' }}>
                  {[
                    { code: 'en', name: 'English', flag: '🇬🇧' },
                    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                      style={{ color: language === lang.code ? '#c9a962' : '#1a2332', backgroundColor: language === lang.code ? '#f5f3f0' : 'transparent' }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Country Selector */}
            <div className="relative" ref={countryMenuRef} onMouseLeave={() => setShowCountryMenu(false)}>
              <button
                onClick={() => { setShowCountryMenu(!showCountryMenu); setShowLangMenu(false); }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded transition-colors text-xs md:text-sm"
                style={{ color: '#ffffff' }}
              >
                <span className="text-base">{countryConfig.flag}</span>
                <span className="hidden md:inline">{countryConfig.name}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCountryMenu && (
                <div className="absolute top-full left-0 mt-1 rounded-lg shadow-xl py-1 min-w-[140px] z-[100]" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e0d8' }}>
                  {Object.entries(countryConfigs).map(([code, config]) => (
                    <button
                      key={code}
                      onClick={() => { setCountry(code); setShowCountryMenu(false); }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                      style={{ color: country === code ? '#c9a962' : '#1a2332', backgroundColor: country === code ? '#f5f3f0' : 'transparent' }}
                    >
                      <span>{config.flag}</span>
                      <span style={{ color: country === code ? '#c9a962' : '#1a2332' }}>{config.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center - Free Delivery message (desktop only) */}
          <span className="hidden sm:block absolute left-1/2 -translate-x-1/2" style={{ color: '#e8e4dd' }}>
            {t('freeDelivery')} {countryConfig.currencySymbol} {countryConfig.freeDeliveryThreshold.toLocaleString()}
          </span>

          {/* Right side - Wishlist & Cart (mobile), Track & Support (desktop) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Wishlist & Cart - extreme right */}
            <div className="flex lg:hidden items-center gap-2">
              <Link href="/wishlist" className="p-1.5 hover:bg-white/10 rounded-full transition-colors relative">
                <svg className={`w-5 h-5 ${wishlistCount > 0 ? 'text-red-400' : 'text-white'}`} fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{wishlistCount}</span>
                )}
              </Link>
              <Link href="/cart" className="p-1.5 hover:bg-white/10 rounded-full transition-colors relative">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop: Track & Support links */}
            <div className="hidden md:flex gap-4" style={{ color: '#e8e4dd' }}>
              <Link href="/track" className="hover:text-gold-light transition-colors">{t('trackOrder')}</Link>
              <Link href="/contact" className="hover:text-gold-light transition-colors">{t('support')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? (isDark ? 'bg-navy shadow-lg' : 'bg-white shadow-lg') : (isDark ? 'bg-navy/95 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md')}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop: Logo centered above nav */}
          <div className="hidden lg:flex justify-center py-4">
            <Link href="/" className="cursor-pointer">
              <Image
                src={isDark ? '/bella_logo_white.png' : '/bella_logo.png'}
                alt="Bella Bathwares"
                width={180}
                height={90}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center justify-between h-16 lg:h-12 lg:pb-3 relative">
            {/* Mobile Menu Button - Left side on mobile */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Search Input - Centered */}
            <div className="flex-1 mx-3 lg:hidden">
              <div className="relative" ref={mobileSearchContainerRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  placeholder={t('searchProducts')}
                  className="w-full px-4 py-2 text-sm border border-bella-200 rounded-full focus:outline-none focus:border-gold bg-bella-50"
                  autoComplete="off"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {/* Mobile Search Results Dropdown */}
                {showSearch && searchQuery.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-light rounded-xl shadow-2xl border border-bella-200 dark:border-white/10 overflow-hidden z-50">
                    {searchLoading && (
                      <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                    )}

                    {!searchLoading && searchQuery.length >= 3 && searchResults.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map(product => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 p-3 hover:bg-bella-50 cursor-pointer border-b border-bella-50 last:border-0"
                          >
                            <Image
                              src={product.thumbnail || product.image || '/placeholder.jpg'}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-navy truncate">{product.name}</p>
                              <p className="text-xs text-gold">{countryConfig.currencySymbol} {formatPrice(product.price)}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="block w-full p-3 text-sm text-center text-gold hover:bg-bella-50 font-medium"
                        >
                          View all results
                        </Link>
                      </div>
                    )}

                    {searchQuery.length < 3 && searchQuery.length > 0 && (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        Type {3 - searchQuery.length} more character{3 - searchQuery.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Logo - Right side */}
            <Link href="/" className="cursor-pointer lg:hidden">
              <Image
                src={isDark ? '/bella_logo_white.png' : '/bella_logo.png'}
                alt="Bella Bathwares"
                width={140}
                height={70}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation - Centered with icons on right */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center gap-1 xl:gap-2">
                <Link href="/" className="nav-link-anim px-3 xl:px-4 py-2 text-sm font-medium text-navy-light hover:text-gold transition-colors whitespace-nowrap">
                  {t('home')}
                </Link>
                <Link href="/shop" className="nav-link-anim px-3 xl:px-4 py-2 text-sm font-medium text-navy-light hover:text-gold transition-colors whitespace-nowrap">
                  {t('shop')}
                </Link>
                <Link href="/collections" className="nav-link-anim px-3 xl:px-4 py-2 text-sm font-medium text-navy-light hover:text-gold transition-colors whitespace-nowrap">
                  Collections
                </Link>
                <Link href="/smart-products" className="nav-link-anim px-3 xl:px-4 py-2 text-sm font-medium text-navy-light hover:text-gold transition-colors whitespace-nowrap">
                  Smart Products
                </Link>

                {rootCategories.map(cat => {
                  const isBathroom = cat.name.toLowerCase() === 'bathroom';
                  const hasChildren = !!(cat.childIds && cat.childIds.length > 0) || (isBathroom && !!bathEssentialsCategory);
                  const orderedChildCategories = getOrderedSubmenus(cat);

                  // For Bathroom, add Bath Essentials at the end of submenu
                  const displaySubmenus = isBathroom && bathEssentialsCategory
                    ? [...orderedChildCategories, bathEssentialsCategory]
                    : orderedChildCategories;

                  return (
                    <div key={cat.id} className={`nav-item relative group ${hasChildren ? 'nav-item-hover' : ''}`}>
                      <Link
                        href={getCategoryUrl(cat, hasChildren)}
                        className="nav-link-anim px-3 xl:px-4 py-2 text-sm font-medium text-navy-light hover:text-gold transition-colors whitespace-nowrap"
                      >
                        {renameCategory(cat.name)}
                      </Link>

                    {/* Dropdown for subcategories */}
                    {hasChildren && (
                      <div className="nav-dropdown absolute top-full left-0 bg-white shadow-xl rounded-lg py-4 min-w-[220px]">
                        {displaySubmenus.map(sub => {
                          const subHasChildren = !!(sub.childIds && sub.childIds.length > 0);
                          return (
                            <Link
                              key={sub.id}
                              href={getCategoryUrl(sub, subHasChildren)}
                              className="block w-full text-left px-5 py-2 text-sm text-navy-light hover:bg-bella-50 hover:text-gold transition-colors"
                            >
                              {renameCategory(sub.name)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Icons - Desktop only (mobile has these in top bar) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search */}
              <div className="relative" ref={searchContainerRef}>
                <button
                  onClick={() => { setShowSearch(!showSearch); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                  className="p-2 hover:bg-bella-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Search Dropdown */}
                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-navy-light rounded-xl shadow-2xl border border-bella-200 dark:border-white/10 overflow-hidden z-50 w-80">
                    <div className="p-3 border-b border-bella-100">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchProducts')}
                        className="w-full px-4 py-2 text-sm border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                        autoComplete="off"
                      />
                    </div>

                    {searchLoading && (
                      <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                    )}

                    {!searchLoading && searchQuery.length >= 3 && searchResults.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map(product => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 p-3 hover:bg-bella-50 cursor-pointer border-b border-bella-50 last:border-0"
                          >
                            <Image
                              src={product.thumbnail || product.image || '/placeholder.jpg'}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-navy truncate">{product.name}</p>
                              <p className="text-xs text-gold">{countryConfig.currencySymbol} {formatPrice(product.price)}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="block w-full p-3 text-sm text-center text-gold hover:bg-bella-50 font-medium"
                        >
                          View all results
                        </Link>
                      </div>
                    )}

                    {searchQuery.length < 3 && searchQuery.length > 0 && (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        Type {3 - searchQuery.length} more character{3 - searchQuery.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 hover:bg-bella-100 rounded-full transition-colors relative">
                <svg className={`w-5 h-5 ${wishlistCount > 0 ? 'text-red-500' : 'text-navy'}`} fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{wishlistCount}</span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="p-2 hover:bg-bella-100 rounded-full transition-colors relative">
                <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu fixed inset-0 z-40 bg-white lg:hidden ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="p-6 pt-24 h-full overflow-y-auto">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-4 text-lg font-medium text-navy border-b border-bella-100">
            {t('home')}
          </Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-4 text-lg font-medium text-navy border-b border-bella-100">
            {t('shop')}
          </Link>
          <Link href="/collections" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-4 text-lg font-medium text-navy border-b border-bella-100">
            Collections
          </Link>
          <Link href="/smart-products" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-4 text-lg font-medium text-navy border-b border-bella-100">
            Smart Products
          </Link>
          {rootCategories.map(cat => {
            const hasChildren = !!(cat.childIds && cat.childIds.length > 0);
            return (
              <Link
                key={cat.id}
                href={getCategoryUrl(cat, hasChildren)}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left py-4 text-lg font-medium text-navy border-b border-bella-100"
              >
                {renameCategory(cat.name)}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
