'use client';

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useCart, useWishlist, useVerification, useAdmin } from '@/context';
import { OdooAPI, type Product, type Category } from '@/lib/api/odoo';
import { EditableImage } from '@/components/admin';

const PRODUCTS_PER_PAGE = 25;

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { countryConfig, formatPrice } = useLocale();
  const { isVerified } = useVerification();
  const inWishlist = isInWishlist(product.id);

  return (
    <Link href={`/product/${product.slug}`} className="product-card bg-white rounded-lg overflow-hidden shadow-sm border border-bella-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-white p-1">
        <Image
          src={product.thumbnail || product.image || '/placeholder.jpg'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain"
        />
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${inWishlist ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-bella-50'}`}
        >
          <svg className={`w-3 h-3 md:w-4 md:h-4 ${inWishlist ? 'text-red-500' : 'text-bella-400'}`} fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-2 md:p-3 border-t border-bella-50">
        <p className="text-bella-400 text-[9px] md:text-[10px] uppercase tracking-wide truncate">{product.category}</p>
        <h3 className="text-xs md:text-sm font-medium text-navy mt-0.5 line-clamp-2 leading-tight min-h-[2rem] md:min-h-[2.5rem]">{product.name}</h3>
        <div className="flex items-center justify-between mt-1.5 md:mt-2">
          {isVerified ? (
            <span className="text-sm md:text-base font-bold text-navy">{countryConfig.currencySymbol} {formatPrice(product.price)}</span>
          ) : (
            <span className="text-xs md:text-sm text-bella-500">Login to see price</span>
          )}
          {product.inStock !== false && isVerified && (
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}
              className="px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-medium bg-brand hover:bg-brand-dark text-white transition-colors"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  'Bathroom': 'from-blue-500 to-blue-700',
  'Collections': 'from-purple-500 to-purple-700',
  'Bath Essentials': 'from-teal-500 to-teal-700',
  'Washroom': 'from-cyan-500 to-cyan-700',
  'Wellness': 'from-green-500 to-green-700',
  'Washlet': 'from-indigo-500 to-indigo-700',
};

// Category icons (SVG paths)
const CATEGORY_ICONS: Record<string, JSX.Element> = {
  'Bathroom': (
    <svg className="w-12 h-12 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Collections': (
    <svg className="w-12 h-12 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  'default': (
    <svg className="w-12 h-12 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};

function CategoryCard({ category, categoryImage, onImageUpdate }: {
  category: Category;
  categoryImage?: string;
  onImageUpdate?: (categoryId: string, imageUrl: string) => void;
}) {
  const { isAdmin, editMode } = useAdmin();
  const colorClass = CATEGORY_COLORS[category.name] || 'from-bella-500 to-bella-700';
  const icon = CATEGORY_ICONS[category.name] || CATEGORY_ICONS['default'];
  const hasChildren = category.childIds && category.childIds.length > 0;

  // Parent categories go to category landing page, leaf categories go to shop
  const href = hasChildren ? `/category/${category.id}` : `/shop?category=${category.id}`;

  // Check if category has a custom image
  const hasCustomImage = !!categoryImage;

  return (
    <Link
      href={href}
      className={`group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all ${
        hasCustomImage ? '' : `bg-gradient-to-br ${colorClass}`
      }`}
    >
      {/* Custom Image Background */}
      {hasCustomImage && (
        <>
          {isAdmin && editMode ? (
            <EditableImage
              src={categoryImage}
              alt={category.name}
              configKey={`categoryImages.${category.id}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onUpdate={(newUrl) => onImageUpdate?.(category.id.toString(), newUrl)}
            />
          ) : (
            <Image
              src={categoryImage}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 pointer-events-none" />
        </>
      )}

      {/* Admin Edit Button for categories without custom image */}
      {!hasCustomImage && isAdmin && editMode && (
        <div className="absolute inset-0 z-10">
          <EditableImage
            src="/placeholder.jpg"
            alt={category.name}
            configKey={`categoryImages.${category.id}`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover opacity-0"
            onUpdate={(newUrl) => onImageUpdate?.(category.id.toString(), newUrl)}
          />
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
        {!hasCustomImage && icon}
        <h3 className="text-white font-semibold text-lg md:text-xl mt-3 text-center drop-shadow-lg">{category.name}</h3>
        <p className="text-white/80 text-sm mt-1 drop-shadow">{category.totalCount || 0} products</p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
    </Link>
  );
}

function CategoryPicker({ categories, categoryImages, onImageUpdate }: {
  categories: Category[];
  categoryImages: Record<string, string>;
  onImageUpdate?: (categoryId: string, imageUrl: string) => void;
}) {
  const { t } = useLocale();
  const rootCategories = categories.filter(c => c.parentId === null);

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-2">{t('shopByCategory')}</h2>
        <p className="text-bella-600">Select a category to browse products</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {rootCategories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            categoryImage={categoryImages[category.id.toString()]}
            onImageUpdate={onImageUpdate}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySidebar({ categories, selectedCategoryId, onSelectCategory }: {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}) {
  const { t } = useLocale();
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const rootCategories = categories.filter(c => c.parentId === null);

  // Auto-expand parent categories when a child is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCat = categories.find(c => c.id === selectedCategoryId);
      if (selectedCat?.parentId) {
        // Find all ancestors and expand them
        const ancestors: number[] = [];
        let current = selectedCat;
        while (current?.parentId) {
          ancestors.push(current.parentId);
          current = categories.find(c => c.id === current?.parentId);
        }
        setExpandedCategories(prev => {
          const newExpanded = [...prev];
          ancestors.forEach(id => {
            if (!newExpanded.includes(id)) {
              newExpanded.push(id);
            }
          });
          return newExpanded;
        });
      }
    }
  }, [selectedCategoryId, categories]);

  const toggleExpand = (catId: number) => {
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const renderCategory = (cat: Category, level = 0) => {
    const children = categories.filter(c => c.parentId === cat.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.includes(cat.id);
    const isSelected = selectedCategoryId === cat.id;

    // Handle click: parent categories expand/collapse, leaf categories navigate
    const handleCategoryClick = () => {
      if (hasChildren) {
        // Parent category: just toggle expand/collapse, don't navigate
        toggleExpand(cat.id);
      } else {
        // Leaf category: navigate to show products
        onSelectCategory(cat.id);
      }
    };

    return (
      <div key={cat.id} className={level > 0 ? 'ml-4' : ''}>
        <div className="flex items-center">
          {/* Always render a fixed-width container for the expand button to maintain alignment */}
          <div className="w-6 flex-shrink-0">
            {hasChildren && (
              <button onClick={() => toggleExpand(cat.id)} className="text-bella-500 hover:text-gold">
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleCategoryClick}
            className={`category-tree-item flex-1 text-left py-2 text-sm ${
              isSelected
                ? 'text-gold font-semibold'
                : hasChildren
                  ? 'text-navy font-medium hover:text-gold'
                  : 'text-bella-700 hover:text-gold'
            }`}
          >
            {cat.name}
            <span className="text-bella-400 text-xs ml-2">({cat.totalCount || 0})</span>
            {hasChildren && (
              <span className="text-bella-400 text-xs ml-1">
                <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            )}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-bella-100 ml-2 mt-1">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 sticky top-28">
      <h3 className="font-semibold text-navy mb-4">{t('categories')}</h3>
      <button
        onClick={() => onSelectCategory(null)}
        className={`w-full text-left py-2 text-sm mb-2 ${!selectedCategoryId ? 'text-gold font-semibold' : 'text-bella-700 hover:text-gold'}`}
      >
        {t('allProducts')}
      </button>
      <div className="space-y-1">
        {rootCategories.map(cat => renderCategory(cat))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <Image src="/bella-loading.gif" alt="Loading..." width={80} height={80} unoptimized />
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const { t, countryConfig } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(categoryParam ? parseInt(categoryParam) : null);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sync selectedCategoryId with URL param when it changes
  useEffect(() => {
    const newCategoryId = categoryParam ? parseInt(categoryParam) : null;
    setSelectedCategoryId(newCategoryId);
    // Reset product type, color filters, and displayed count when category changes
    setSelectedProductType(null);
    setSelectedColors([]);
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [categoryParam]);

  // Sync search query with URL param when it changes
  useEffect(() => {
    setSearchQuery(searchParam || '');
  }, [searchParam]);

  // Handle category selection from sidebar - updates URL
  const handleCategorySelect = (catId: number | null) => {
    if (catId === null) {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${catId}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [cats, catImages] = await Promise.all([
        OdooAPI.fetchPublicCategories(),
        OdooAPI.fetchCategoryImages()
      ]);
      setCategories(cats);
      setCategoryImages(catImages);

      // Only fetch products when a category is selected
      if (selectedCategoryId) {
        // Check if this is a parent category (has children)
        const selectedCat = cats.find(c => c.id === selectedCategoryId);
        if (selectedCat && selectedCat.childIds && selectedCat.childIds.length > 0) {
          // Redirect to category landing page for parent categories
          router.replace(`/category/${selectedCategoryId}`);
          return;
        }

        const prods = await OdooAPI.fetchProductsByPublicCategory(selectedCategoryId);
        setProducts(prods);
      } else {
        // No category selected - don't load products, show category picker instead
        setProducts([]);
      }
      setLoading(false);
    };
    loadData();
  }, [selectedCategoryId, router]);

  // Handle category image updates
  const handleCategoryImageUpdate = (categoryId: string, imageUrl: string) => {
    setCategoryImages(prev => ({ ...prev, [categoryId]: imageUrl }));
  };

  // Define color options with their display colors and search patterns
  const COLOR_OPTIONS = useMemo(() => [
    { name: 'Black', color: '#1a1a1a', patterns: ['black', 'db', 'matt black', 'matte black'] },
    { name: 'Chrome', color: '#c0c0c0', patterns: ['chrome', 'ch'] },
    { name: 'Gold', color: '#d4af37', patterns: ['gold', 'brushed gold', 'bg'] },
    { name: 'Rose Gold', color: '#b76e79', patterns: ['rose gold', 'rg'] },
    { name: 'Shiny Gold', color: '#ffd700', patterns: ['shiny gold', 'sg'] },
    { name: 'Gun Metal', color: '#536267', patterns: ['gun metal', 'gm', 'gunmetal'] },
    { name: 'White', color: '#ffffff', patterns: ['white', 'wh'] },
    { name: 'Bronze', color: '#cd7f32', patterns: ['bronze', 'brz'] },
    { name: 'Nickel', color: '#727472', patterns: ['nickel', 'brushed nickel', 'bn'] },
  ], []);

  // Extract colors available in current products
  const availableColors = useMemo(() => {
    const colorCounts = new Map<string, number>();

    products.forEach(p => {
      const productName = p.name.toLowerCase();
      COLOR_OPTIONS.forEach(colorOption => {
        const hasColor = colorOption.patterns.some(pattern =>
          productName.includes(pattern.toLowerCase())
        );
        if (hasColor) {
          colorCounts.set(colorOption.name, (colorCounts.get(colorOption.name) || 0) + 1);
        }
      });
    });

    return COLOR_OPTIONS.filter(c => colorCounts.has(c.name))
      .map(c => ({ ...c, count: colorCounts.get(c.name) || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [products, COLOR_OPTIONS]);

  // Extract unique product types (categories) from current products
  const productTypes = useMemo(() => {
    const types = new Map<string, number>();
    products.forEach(p => {
      if (p.category) {
        // Handle cases where category might be "FAUCETS / ANGLE VALVE" - extract the main type
        const mainCategory = p.category.split('/')[0].trim();
        types.set(mainCategory, (types.get(mainCategory) || 0) + 1);
      }
    });
    return Array.from(types.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Product type filter
    if (selectedProductType) {
      result = result.filter(p => {
        if (!p.category) return false;
        const mainCategory = p.category.split('/')[0].trim();
        return mainCategory === selectedProductType;
      });
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter(p => {
        const productName = p.name.toLowerCase();
        return selectedColors.some(colorName => {
          const colorOption = COLOR_OPTIONS.find(c => c.name === colorName);
          if (!colorOption) return false;
          return colorOption.patterns.some(pattern =>
            productName.includes(pattern.toLowerCase())
          );
        });
      });
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return result;
  }, [products, priceRange, sortBy, searchQuery, selectedProductType, selectedColors, COLOR_OPTIONS]);

  // Get products to display (paginated)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayedCount);
  }, [filteredProducts, displayedCount]);

  const hasMore = displayedCount < filteredProducts.length;

  // Load more products
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // Simulate slight delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, filteredProducts.length));
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore, filteredProducts.length]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [searchQuery, sortBy, priceRange, selectedProductType, selectedColors]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-bella-50">
      {/* Header */}
      <div className="bg-white border-b border-bella-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center text-sm text-bella-500 mb-3 flex-wrap">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-navy">Shop</Link>
            {selectedCategory && (() => {
              // Build full category path by walking up the parent chain
              const buildCategoryPath = (cat: typeof selectedCategory): typeof categories => {
                const path: typeof categories = [];
                let current: typeof selectedCategory | undefined = cat;

                while (current) {
                  path.unshift(current);
                  if (current.parentId) {
                    current = categories.find(c => c.id === current!.parentId);
                  } else {
                    break;
                  }
                }
                return path;
              };

              const categoryPath = buildCategoryPath(selectedCategory);

              return (
                <>
                  {categoryPath.map((cat, idx) => {
                    const isLast = idx === categoryPath.length - 1;
                    return (
                      <span key={cat.id} className="flex items-center">
                        <span className="mx-2">/</span>
                        {isLast ? (
                          <span className="text-navy font-medium">{cat.name}</span>
                        ) : (
                          <Link href={`/shop?category=${cat.id}`} className="hover:text-navy">{cat.name}</Link>
                        )}
                      </span>
                    );
                  })}
                </>
              );
            })()}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl md:text-3xl font-bold text-navy dark:text-white">
                {selectedCategory ? selectedCategory.name : t('shopByCategory')}
              </h1>
              {selectedCategoryId && (
                <p className="text-bella-600 dark:text-bella-300 text-sm mt-1">{filteredProducts.length} {t('productsFound')}</p>
              )}
            </div>
            {selectedCategoryId && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-bella-200 dark:border-bella-600 rounded-lg text-sm focus:outline-none focus:border-gold bg-white dark:bg-bella-800 dark:text-white"
              >
                <option value="featured">{t('featured')}</option>
                <option value="name">{t('nameAZ')}</option>
                <option value="price-low">{t('priceLowHigh')}</option>
                <option value="price-high">{t('priceHighLow')}</option>
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Only show when a category is selected */}
          {selectedCategoryId && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <CategorySidebar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleCategorySelect}
            />

            {/* Price Filter */}
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h3 className="font-semibold text-navy mb-4">{t('priceRange')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-bella-500 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value) || 0, priceRange[1]), priceRange[1]])}
                    className="w-full px-3 py-2 border border-bella-200 rounded-lg text-sm focus:outline-none focus:border-gold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-bella-500 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    min={priceRange[0]}
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value) || 0, priceRange[0])])}
                    className="w-full px-3 py-2 border border-bella-200 rounded-lg text-sm focus:outline-none focus:border-gold"
                    placeholder="10000"
                  />
                </div>
                <div className="flex justify-between text-sm text-bella-600">
                  <span>{countryConfig.currencySymbol} {priceRange[0]}</span>
                  <span>to</span>
                  <span>{countryConfig.currencySymbol} {priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-navy">Colors</h3>
                  {selectedColors.length > 0 && (
                    <button
                      onClick={() => setSelectedColors([])}
                      className="text-xs text-gold hover:text-gold-dark"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {availableColors.map(colorOption => {
                    const isSelected = selectedColors.includes(colorOption.name);
                    return (
                      <button
                        key={colorOption.name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedColors(selectedColors.filter(c => c !== colorOption.name));
                          } else {
                            setSelectedColors([...selectedColors, colorOption.name]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-gold/10 border border-gold'
                            : 'hover:bg-bella-50 border border-transparent'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                          style={{
                            backgroundColor: colorOption.color,
                            borderColor: colorOption.color === '#ffffff' ? '#e5e5e5' : colorOption.color
                          }}
                        />
                        <span className={`text-sm flex-1 text-left ${isSelected ? 'text-gold font-medium' : 'text-bella-700'}`}>
                          {colorOption.name}
                        </span>
                        <span className="text-xs text-bella-400">({colorOption.count})</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
          )}

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {/* Subcategory Quick Filter Bar - Only show when a category is selected */}
            {selectedCategoryId && (() => {
              // Get subcategories to display in the quick filter bar
              const getQuickFilterCategories = () => {
                // Show children of selected category
                const children = categories.filter(c => c.parentId === selectedCategoryId);
                if (children.length > 0) return children;
                // If no children, show siblings (same parent)
                const selectedCat = categories.find(c => c.id === selectedCategoryId);
                if (selectedCat?.parentId) {
                  return categories.filter(c => c.parentId === selectedCat.parentId);
                }
                return [];
              };

              const quickFilterCategories = getQuickFilterCategories();

              if (quickFilterCategories.length === 0) return null;

              return (
                <div className="mb-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
                  <div className="flex gap-3 pb-2">
                    {quickFilterCategories.map(cat => {
                      const isActive = selectedCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium whitespace-nowrap transition-all ${
                            isActive
                              ? 'bg-gold/10 border-gold text-gold'
                              : 'bg-white border-bella-200 text-bella-700 hover:border-gold hover:text-gold'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Product Type Filter - Shows when a category is selected and has multiple product types */}
            {selectedCategoryId && productTypes.length > 1 && (
              <div className="mb-6 bg-white rounded-xl p-4 border border-bella-100">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-bella-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm font-medium text-navy">Filter by Product Type:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedProductType(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !selectedProductType
                        ? 'bg-navy text-white'
                        : 'bg-bella-100 text-bella-700 hover:bg-bella-200'
                    }`}
                  >
                    All Types ({products.length})
                  </button>
                  {productTypes.map(type => (
                    <button
                      key={type.name}
                      onClick={() => setSelectedProductType(type.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedProductType === type.name
                          ? 'bg-navy text-white'
                          : 'bg-bella-100 text-bella-700 hover:bg-bella-200'
                      }`}
                    >
                      {type.name} ({type.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Image src="/bella-loading.gif" alt="Loading..." width={80} height={80} unoptimized />
              </div>
            ) : !selectedCategoryId ? (
              // Show category picker when no category is selected
              <CategoryPicker
                categories={categories}
                categoryImages={categoryImages}
                onImageUpdate={handleCategoryImageUpdate}
              />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-bella-600 mb-4">{t('noProductsFound')}</p>
                <button
                  onClick={() => { setSearchQuery(''); setPriceRange([0, 10000]); handleCategorySelect(null); setSelectedProductType(null); setSelectedColors([]); }}
                  className="text-gold hover:text-gold-dark"
                >
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More / Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-8 mt-4">
                    {loadingMore ? (
                      <div className="flex flex-col items-center gap-2 text-bella-500">
                        <Image src="/bella-loading.gif" alt="Loading..." width={48} height={48} unoptimized />
                        <span className="text-sm">Loading more products...</span>
                      </div>
                    ) : (
                      <button
                        onClick={loadMore}
                        className="px-6 py-2 text-sm font-medium text-bella-600 hover:text-navy border border-bella-200 rounded-lg hover:border-bella-300 transition-colors"
                      >
                        Load More ({filteredProducts.length - displayedCount} remaining)
                      </button>
                    )}
                  </div>
                )}

                {/* Products count info */}
                <div className="text-center text-sm text-bella-500 mt-4">
                  Showing {displayedProducts.length} of {filteredProducts.length} products
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
