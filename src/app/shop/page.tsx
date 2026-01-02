'use client';

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useWishlist, useAdmin } from '@/context';
import { OdooAPI, type Product, type Category } from '@/lib/api/odoo';
import { EditableImage } from '@/components/admin';
import { ProductImage } from '@/components/ProductImage';
import { ProductGridSkeleton, ShopCategoryGridSkeleton } from '@/components/ProductCardSkeleton';

// Custom hook for scroll animation using Intersection Observer
function useScrollAnimation(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element); // Only animate once
        }
      },
      { threshold: 0.1, rootMargin: '50px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

const PRODUCTS_PER_PAGE = 25;

function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <Link href={`/product/${product.slug}`} className="product-card bg-white dark:bg-navy-light rounded-lg overflow-hidden shadow-sm border border-bella-100 dark:border-bella-700 hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/5] bg-white p-1">
        <ProductImage
          src={product.thumbnail || product.image || '/placeholder.jpg'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain"
        />
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${inWishlist ? 'bg-red-50 hover:bg-red-100' : 'bg-white dark:bg-bella-700 hover:bg-bella-50 dark:hover:bg-bella-600'}`}
        >
          <svg className={`w-3 h-3 md:w-4 md:h-4 ${inWishlist ? 'text-red-500' : 'text-bella-400 dark:text-bella-300'}`} fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-2 md:p-3 border-t border-bella-50 dark:border-bella-700">
        <h3 className="font-product text-xs md:text-sm font-medium text-navy dark:text-white line-clamp-2 leading-tight overflow-hidden">{product.name}</h3>
      </div>
    </Link>
  );
}



// Category Card Component with scroll animation
function CategoryCard({ category, categoryImage, isAdmin, editMode, onImageUpdate, index = 0 }: {
  category: Category;
  categoryImage: string | undefined;
  isAdmin: boolean;
  editMode: boolean;
  onImageUpdate?: (categoryId: string, imageUrl: string) => void;
  index?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  const hasImage = !!categoryImage;

  // Staggered animation delay based on index (max 5 items per row)
  const staggerDelay = (index % 5) * 0.1;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: isVisible ? `${staggerDelay}s` : '0s' }}
    >
      <Link
        href={`/shop?category=${category.id}`}
        scroll={true}
        className="category-card group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-bella-100 hover:border-gold/30 block"
      >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-white">
        {hasImage ? (
          isAdmin && editMode ? (
            <EditableImage
              src={categoryImage}
              alt={category.name}
              configKey={`categoryImages.${category.id}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onUpdate={(newUrl) => onImageUpdate?.(category.id.toString(), newUrl)}
            />
          ) : (
            <Image
              src={categoryImage}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {isAdmin && editMode ? (
              <EditableImage
                src="/placeholder.jpg"
                alt={category.name}
                configKey={`categoryImages.${category.id}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-30"
                onUpdate={(newUrl) => onImageUpdate?.(category.id.toString(), newUrl)}
              />
            ) : (
              <svg className="w-16 h-16 text-bella-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Category Info */}
      <div className="p-4">
        <h3 className="font-display font-bold text-navy dark:text-white text-base md:text-lg group-hover:text-gold transition-colors line-clamp-1">
          {category.name}
        </h3>
      </div>
      </Link>
    </div>
  );
}

// All Categories Grid - Shows all categories with improved UI/UX
function AllCategoriesGrid({ categories, categoryImages, onImageUpdate, searchQuery, setSearchQuery }: {
  categories: Category[];
  categoryImages: Record<string, string>;
  onImageUpdate?: (categoryId: string, imageUrl: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const { isAdmin, editMode } = useAdmin();
  const [productFallbackImages, setProductFallbackImages] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Categories to hide from the grid
  const hiddenCategories = ['collections'];

  // Rename mappings for display (matching navbar)
  const renameCategory = (name: string) => {
    const renames: Record<string, string> = {
      'bathroom': 'Showers',
      'washlet': 'Toilets',
    };
    return renames[name.toLowerCase()] || name;
  };

  // Custom order for root categories (matching navbar structure)
  const rootCategoryOrder = [
    'bathroom',      // Showers in nav
    'washroom',      // Basins & Faucets
    'washlet',       // Toilets
    'wellness',
    'bath accessories',
    'bath essentials',
    'bath assist',
    'kitchen',
    'switches & sockets',
    'water heaters'
  ];

  // Group categories by their root parent for organized display
  const rootCategories = categories
    .filter(c => c.parentId === null && !hiddenCategories.includes(c.name.toLowerCase()))
    .sort((a, b) => {
      const aIndex = rootCategoryOrder.indexOf(a.name.toLowerCase());
      const bIndex = rootCategoryOrder.indexOf(b.name.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  // Get all leaf categories (no children) - these link directly to products
  const getLeafCategories = (parentId: number | null): Category[] => {
    const children = categories.filter(c => c.parentId === parentId);
    const leaves: Category[] = [];

    children.forEach(child => {
      if (!child.childIds || child.childIds.length === 0) {
        leaves.push(child);
      } else {
        leaves.push(...getLeafCategories(child.id));
      }
    });

    return leaves;
  };

  // Get all categories organized by root parent
  const categoriesByRoot = rootCategories.map(root => {
    const leafCategories = root.childIds && root.childIds.length > 0
      ? getLeafCategories(root.id)
      : [root];

    return {
      root,
      categories: leafCategories
    };
  }).filter(group => group.categories.length > 0);

  // Filter categories based on search
  const filteredCategoriesByRoot = useMemo(() => {
    if (!searchQuery.trim()) return categoriesByRoot;

    const query = searchQuery.toLowerCase();
    return categoriesByRoot.map(group => ({
      ...group,
      categories: group.categories.filter(cat =>
        cat.name.toLowerCase().includes(query)
      )
    })).filter(group => group.categories.length > 0);
  }, [categoriesByRoot, searchQuery]);

  // Get displayed categories based on active tab
  const displayedGroups = useMemo(() => {
    if (!activeTab) return filteredCategoriesByRoot;
    return filteredCategoriesByRoot.filter(group => group.root.id.toString() === activeTab);
  }, [filteredCategoriesByRoot, activeTab]);

  // Get all leaf category IDs as a stable dependency
  const leafCategoryIds = useMemo(() =>
    categoriesByRoot.flatMap(group => group.categories).map(cat => cat.id).sort().join(','),
    [categoriesByRoot]
  );

  // Fetch product images as fallback for categories without custom images
  useEffect(() => {
    const fetchFallbackImages = async () => {
      const allLeafCategories = categoriesByRoot.flatMap(group => group.categories);
      const categoriesNeedingImages = allLeafCategories.filter(
        cat => !categoryImages[cat.id.toString()] && !productFallbackImages[cat.id.toString()]
      );

      if (categoriesNeedingImages.length === 0) return;

      const imagePromises = categoriesNeedingImages.map(async (cat) => {
        try {
          const products = await OdooAPI.fetchProductsByPublicCategory(cat.id, 1);
          const imageUrl = products[0]?.thumbnail || products[0]?.image;
          if (imageUrl) {
            return { categoryId: cat.id.toString(), imageUrl };
          }
        } catch (error) {
          console.error(`Failed to fetch fallback image for category ${cat.id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(imagePromises);
      const newFallbackImages: Record<string, string> = {};
      results.forEach(result => {
        if (result) {
          newFallbackImages[result.categoryId] = result.imageUrl;
        }
      });

      if (Object.keys(newFallbackImages).length > 0) {
        setProductFallbackImages(prev => ({ ...prev, ...newFallbackImages }));
      }
    };

    fetchFallbackImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafCategoryIds, categoryImages]);

  return (
    <div className="space-y-6">
      {/* Category Pills - Wrapped Grid */}
      <div className="sticky top-20 z-30 bg-bella-50/95 dark:bg-navy/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !activeTab
                ? 'bg-navy dark:bg-gold text-white shadow-md'
                : 'bg-white dark:bg-bella-800 text-bella-600 dark:text-bella-300 hover:bg-bella-100 dark:hover:bg-bella-700 border border-bella-200 dark:border-bella-600'
            }`}
          >
            All Categories
          </button>
          {rootCategories.map(root => (
            <button
              key={root.id}
              onClick={() => setActiveTab(activeTab === root.id.toString() ? null : root.id.toString())}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === root.id.toString()
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-white dark:bg-bella-800 text-bella-600 dark:text-bella-300 hover:bg-bella-100 dark:hover:bg-bella-700 border border-bella-200 dark:border-bella-600'
              }`}
            >
              {renameCategory(root.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Category Sections */}
      {displayedGroups.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-bella-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-navy mb-2">No categories found</h3>
          <p className="text-bella-500">Try a different search term</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-gold hover:text-gold-dark font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        displayedGroups.map(group => {
          const displayName = renameCategory(group.root.name);
          return (
            <div key={group.root.id} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-gold rounded-full" />
                  <div>
                    <h2 className="font-display text-xl md:text-2xl font-bold text-navy">{displayName}</h2>
                    <p className="text-bella-500 text-sm">{group.categories.length} categories • {group.root.totalCount || 0} products</p>
                  </div>
                </div>
                <Link
                  href={`/shop?category=${group.root.id}`}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-navy/5 hover:bg-navy/10 rounded-lg text-navy font-medium text-sm transition-colors"
                >
                  View All {displayName}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {group.categories.map((category, idx) => {
                  const customImage = categoryImages[category.id.toString()];
                  const fallbackImage = productFallbackImages[category.id.toString()];
                  const categoryImage = customImage || fallbackImage;

                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      categoryImage={categoryImage}
                      isAdmin={isAdmin}
                      editMode={editMode}
                      onImageUpdate={onImageUpdate}
                      index={idx}
                    />
                  );
                })}
              </div>

              {/* Mobile View All Link */}
              <div className="md:hidden">
                <Link
                  href={`/shop?category=${group.root.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-navy/5 hover:bg-navy/10 rounded-xl text-navy font-medium text-sm transition-colors"
                >
                  View All {displayName}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })
      )}

      {/* Quick Links Banner */}
      {!searchQuery && !activeTab && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link
            href="/collections"
            className="group flex items-center gap-4 p-6 bg-gradient-to-r from-gold/10 to-gold/5 rounded-2xl border border-gold/20 hover:border-gold/40 transition-all"
          >
            <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-navy group-hover:text-gold transition-colors">Collections</h3>
              <p className="text-sm text-bella-500">Curated bathroom sets</p>
            </div>
          </Link>

          <Link
            href="/smart-products"
            className="group flex items-center gap-4 p-6 bg-gradient-to-r from-navy/10 to-navy/5 rounded-2xl border border-navy/20 hover:border-navy/40 transition-all"
          >
            <div className="w-12 h-12 bg-navy/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-navy group-hover:text-gold transition-colors">Smart Products</h3>
              <p className="text-sm text-bella-500">Tech-enabled solutions</p>
            </div>
          </Link>

          <Link
            href="/wellness"
            className="group flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-navy group-hover:text-gold transition-colors">Wellness</h3>
              <p className="text-sm text-bella-500">Jacuzzis, Saunas & more</p>
            </div>
          </Link>
        </div>
      )}
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

  // Custom submenu order for specific categories (matching navbar)
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
    'washlet': [
      'Concealed Cisterns',
      'Exposed Cisterns',
      'Flush Plates',
      'Wall Hung Toilets',
      'Tankless WC',
      'Single Piece Toilet',
      'Urinals'
    ],
  };

  // Get ordered children for a category
  const getOrderedChildren = (cat: Category) => {
    const children = categories.filter(c => c.parentId === cat.id);
    const customOrder = customSubmenuOrder[cat.name.toLowerCase()];

    if (!customOrder) return children;

    return [...children].sort((a, b) => {
      const aIndex = customOrder.findIndex(name => a.name.toLowerCase() === name.toLowerCase());
      const bIndex = customOrder.findIndex(name => b.name.toLowerCase() === name.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  // Find specific categories matching navbar structure
  const bathroomCategory = categories.find(c => c.parentId === null && c.name.toLowerCase() === 'bathroom');
  const washroomCategory = categories.find(c => c.parentId === null && c.name.toLowerCase() === 'washroom');
  const washletCategory = categories.find(c => c.parentId === null && c.name.toLowerCase() === 'washlet');
  const wellnessCategory = categories.find(c => c.parentId === null && c.name.toLowerCase() === 'wellness');
  const switchesCategory = categories.find(c => c.parentId === null && c.name.toLowerCase() === 'switches & sockets');
  const bathAccessoriesCategory = categories.find(c => c.parentId === null && c.name.toLowerCase() === 'bath accessories');

  // Auto-expand parent categories when a child is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCat = categories.find(c => c.id === selectedCategoryId);
      if (selectedCat?.parentId) {
        const ancestors: number[] = [];
        let current: Category | undefined = selectedCat;
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
          // Also expand virtual "Basins & WC" if washroom or washlet child is selected
          if (washroomCategory && ancestors.includes(washroomCategory.id)) {
            if (!newExpanded.includes(-1)) newExpanded.push(-1);
          }
          if (washletCategory && ancestors.includes(washletCategory.id)) {
            if (!newExpanded.includes(-1)) newExpanded.push(-1);
          }
          return newExpanded;
        });
      }
    }
  }, [selectedCategoryId, categories, washroomCategory, washletCategory]);

  const toggleExpand = (catId: number) => {
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Render a subcategory item
  const renderSubcategory = (cat: Category) => {
    const children = getOrderedChildren(cat);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.includes(cat.id);
    const isSelected = selectedCategoryId === cat.id;

    const handleClick = () => {
      if (hasChildren) {
        toggleExpand(cat.id);
      } else {
        onSelectCategory(cat.id);
      }
    };

    return (
      <div key={cat.id}>
        <div className="flex items-center">
          <div className="w-5 flex-shrink-0">
            {hasChildren && (
              <button onClick={() => toggleExpand(cat.id)} className="text-bella-500 hover:text-gold">
                <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleClick}
            className={`flex-1 text-left py-1.5 text-sm ${
              isSelected ? 'text-gold font-semibold' : 'text-bella-700 hover:text-gold'
            }`}
          >
            {cat.name}
            <span className="text-bella-400 text-xs ml-1">({cat.totalCount || 0})</span>
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-5 border-l border-bella-100 pl-2">
            {children.map(child => renderSubcategory(child))}
          </div>
        )}
      </div>
    );
  };

  // Check if any child of a category is selected
  const isCategoryOrChildSelected = (cat: Category): boolean => {
    if (selectedCategoryId === cat.id) return true;
    const children = categories.filter(c => c.parentId === cat.id);
    return children.some(child => isCategoryOrChildSelected(child));
  };

  // Check if Basins & WC (washroom or washlet) has selected child
  const isBasinsWcSelected = (washroomCategory && isCategoryOrChildSelected(washroomCategory)) ||
    (washletCategory && isCategoryOrChildSelected(washletCategory));

  const isBasinsWcExpanded = expandedCategories.includes(-1);
  const isShowersExpanded = bathroomCategory && expandedCategories.includes(bathroomCategory.id);
  const isWellnessExpanded = wellnessCategory && expandedCategories.includes(wellnessCategory.id);
  const isSwitchesExpanded = switchesCategory && expandedCategories.includes(switchesCategory.id);

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
        {/* 1. Showers (bathroom) */}
        {bathroomCategory && (
          <div>
            <div className="flex items-center">
              <div className="w-6 flex-shrink-0">
                <button onClick={() => toggleExpand(bathroomCategory.id)} className="text-bella-500 hover:text-gold">
                  <svg className={`w-4 h-4 transition-transform ${isShowersExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => toggleExpand(bathroomCategory.id)}
                className={`flex-1 text-left py-2 text-sm font-medium ${
                  isCategoryOrChildSelected(bathroomCategory) ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
              >
                Showers
                <span className="text-bella-400 text-xs ml-2">({bathroomCategory.totalCount || 0})</span>
              </button>
            </div>
            {isShowersExpanded && (
              <div className="ml-6 border-l-2 border-bella-100 pl-2 mt-1">
                {getOrderedChildren(bathroomCategory).map(sub => renderSubcategory(sub))}
                {/* Add Bath Accessories under Showers */}
                {bathAccessoriesCategory && (
                  <div className="border-t border-bella-100 mt-2 pt-2">
                    {renderSubcategory(bathAccessoriesCategory)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Basins & WC (merged washroom + washlet) */}
        {(washroomCategory || washletCategory) && (
          <div>
            <div className="flex items-center">
              <div className="w-6 flex-shrink-0">
                <button onClick={() => toggleExpand(-1)} className="text-bella-500 hover:text-gold">
                  <svg className={`w-4 h-4 transition-transform ${isBasinsWcExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => toggleExpand(-1)}
                className={`flex-1 text-left py-2 text-sm font-medium ${
                  isBasinsWcSelected ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
              >
                Basins & WC
                <span className="text-bella-400 text-xs ml-2">
                  ({(washroomCategory?.totalCount || 0) + (washletCategory?.totalCount || 0)})
                </span>
              </button>
            </div>
            {isBasinsWcExpanded && (
              <div className="ml-6 border-l-2 border-bella-100 pl-2 mt-1">
                {/* Washroom (Basins & Faucets) section */}
                {washroomCategory && (
                  <>
                    <div className="text-xs font-semibold text-bella-400 uppercase tracking-wider py-1">
                      Basins & Faucets
                    </div>
                    {getOrderedChildren(washroomCategory).map(sub => renderSubcategory(sub))}
                  </>
                )}
                {/* Washlet (Toilets & Cisterns) section */}
                {washletCategory && (
                  <>
                    <div className="text-xs font-semibold text-bella-400 uppercase tracking-wider py-1 mt-2 border-t border-bella-100 pt-2">
                      Toilets & Cisterns
                    </div>
                    {getOrderedChildren(washletCategory).map(sub => renderSubcategory(sub))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Wellness */}
        {wellnessCategory && (
          <div>
            <div className="flex items-center">
              <div className="w-6 flex-shrink-0">
                {wellnessCategory.childIds && wellnessCategory.childIds.length > 0 && (
                  <button onClick={() => toggleExpand(wellnessCategory.id)} className="text-bella-500 hover:text-gold">
                    <svg className={`w-4 h-4 transition-transform ${isWellnessExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => wellnessCategory.childIds && wellnessCategory.childIds.length > 0
                  ? toggleExpand(wellnessCategory.id)
                  : onSelectCategory(wellnessCategory.id)}
                className={`flex-1 text-left py-2 text-sm font-medium ${
                  isCategoryOrChildSelected(wellnessCategory) ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
              >
                Wellness
                <span className="text-bella-400 text-xs ml-2">({wellnessCategory.totalCount || 0})</span>
              </button>
            </div>
            {isWellnessExpanded && wellnessCategory.childIds && wellnessCategory.childIds.length > 0 && (
              <div className="ml-6 border-l-2 border-bella-100 pl-2 mt-1">
                {getOrderedChildren(wellnessCategory).map(sub => renderSubcategory(sub))}
              </div>
            )}
          </div>
        )}

        {/* 4. Switches & Sockets */}
        {switchesCategory && (
          <div>
            <div className="flex items-center">
              <div className="w-6 flex-shrink-0">
                {switchesCategory.childIds && switchesCategory.childIds.length > 0 && (
                  <button onClick={() => toggleExpand(switchesCategory.id)} className="text-bella-500 hover:text-gold">
                    <svg className={`w-4 h-4 transition-transform ${isSwitchesExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => switchesCategory.childIds && switchesCategory.childIds.length > 0
                  ? toggleExpand(switchesCategory.id)
                  : onSelectCategory(switchesCategory.id)}
                className={`flex-1 text-left py-2 text-sm font-medium ${
                  isCategoryOrChildSelected(switchesCategory) ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
              >
                Switches & Sockets
                <span className="text-bella-400 text-xs ml-2">({switchesCategory.totalCount || 0})</span>
              </button>
            </div>
            {isSwitchesExpanded && switchesCategory.childIds && switchesCategory.childIds.length > 0 && (
              <div className="ml-6 border-l-2 border-bella-100 pl-2 mt-1">
                {getOrderedChildren(switchesCategory).map(sub => renderSubcategory(sub))}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-bella-200 my-3"></div>

        {/* Other Categories (not in navbar) */}
        {(() => {
          // Categories already shown in navbar structure
          const navbarCategoryNames = ['bathroom', 'washroom', 'washlet', 'wellness', 'switches & sockets', 'bath accessories'];

          // Get remaining root categories
          const otherCategories = categories.filter(c =>
            c.parentId === null &&
            !navbarCategoryNames.includes(c.name.toLowerCase())
          );

          if (otherCategories.length === 0) return null;

          return otherCategories.map(cat => {
            const isExpanded = expandedCategories.includes(cat.id);
            const hasChildren = cat.childIds && cat.childIds.length > 0;

            return (
              <div key={cat.id}>
                <div className="flex items-center">
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
                    onClick={() => hasChildren ? toggleExpand(cat.id) : onSelectCategory(cat.id)}
                    className={`flex-1 text-left py-2 text-sm font-medium ${
                      isCategoryOrChildSelected(cat) ? 'text-gold' : 'text-navy hover:text-gold'
                    }`}
                  >
                    {cat.name}
                    <span className="text-bella-400 text-xs ml-2">({cat.totalCount || 0})</span>
                  </button>
                </div>
                {isExpanded && hasChildren && (
                  <div className="ml-6 border-l-2 border-bella-100 pl-2 mt-1">
                    {getOrderedChildren(cat).map(sub => renderSubcategory(sub))}
                  </div>
                )}
              </div>
            );
          });
        })()}
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
  const showAllParam = searchParams.get('showAll') === 'true';

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
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevCategoryRef = useRef<string | null>(null);

  // Scroll to top when category changes - this is the main scroll handler
  useEffect(() => {
    // Only scroll if category actually changed (not on initial mount with same category)
    if (prevCategoryRef.current !== categoryParam) {
      // Force scroll to top immediately using 'instant' behavior
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Fallback for browsers that don't support 'instant'
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Update the ref
      prevCategoryRef.current = categoryParam;
    }
  }, [categoryParam]);

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
    // Scroll to top immediately before navigation using 'instant' behavior
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (catId === null) {
      router.push('/shop', { scroll: true });
    } else {
      router.push(`/shop?category=${catId}`, { scroll: true });
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
          // Always stay on shop page for parent categories to keep users in the shopping flow
          // This shows subcategories as filter chips and loads all products from children
          const allCategoryIds = [selectedCategoryId, ...selectedCat.childIds];
          const productPromises = allCategoryIds.map(catId =>
            OdooAPI.fetchProductsByPublicCategory(catId)
          );
          const productArrays = await Promise.all(productPromises);
          // Flatten and dedupe by product id
          const allProducts = productArrays.flat();
          const uniqueProducts = Array.from(
            new Map(allProducts.map(p => [p.id, p])).values()
          );
          setProducts(uniqueProducts);
          setLoading(false);
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
  }, [selectedCategoryId, showAllParam, router]);

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

              // Check if the root category is Washroom or Washlet - if so, replace with "Basin & WC"
              const isUnderBasinsWc = categoryPath.length > 0 &&
                (categoryPath[0].name.toLowerCase() === 'washroom' || categoryPath[0].name.toLowerCase() === 'washlet');

              // Get the root category ID for Basin & WC link (use washroom as default)
              const basinsWcCategoryId = categoryPath.length > 0 ? categoryPath[0].id : null;

              return (
                <>
                  {isUnderBasinsWc && basinsWcCategoryId && (
                    <span className="flex items-center">
                      <span className="mx-2">/</span>
                      <Link href={`/shop?category=${basinsWcCategoryId}`} scroll={true} className="hover:text-navy">Basin & WC</Link>
                    </span>
                  )}
                  {categoryPath.map((cat, idx) => {
                    const isLast = idx === categoryPath.length - 1;
                    // Skip the root Washroom/Washlet category since we replaced it with Basin & WC
                    if (idx === 0 && isUnderBasinsWc) {
                      return null;
                    }
                    return (
                      <span key={cat.id} className="flex items-center">
                        <span className="mx-2">/</span>
                        {isLast ? (
                          <span className="text-navy font-medium">{cat.name}</span>
                        ) : (
                          <Link href={`/shop?category=${cat.id}`} scroll={true} className="hover:text-navy">{cat.name}</Link>
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
            {/* Search input for category grid (when no category selected) */}
            {!selectedCategoryId && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-40 md:w-56 px-4 py-2 pl-10 bg-white border border-bella-200 rounded-full text-sm text-navy placeholder-bella-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold shadow-sm"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bella-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-bella-400 hover:text-navy"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {/* Sort dropdown (when category is selected) */}
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
              selectedCategoryId ? <ProductGridSkeleton count={8} /> : <ShopCategoryGridSkeleton count={10} />
            ) : !selectedCategoryId ? (
              // Show all categories grid when no category is selected
              <AllCategoriesGrid
                categories={categories}
                categoryImages={categoryImages}
                onImageUpdate={handleCategoryImageUpdate}
                searchQuery={categorySearchQuery}
                setSearchQuery={setCategorySearchQuery}
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
