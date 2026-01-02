'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useCart, useWishlist, useVerification } from '@/context';
import { OdooAPI, type Product, type Category, type RelatedProduct } from '@/lib/api/odoo';
import { ProductImage } from '@/components/ProductImage';
import { ProductDetailSkeleton } from '@/components/ProductCardSkeleton';

// Related Product Card Component
function RelatedProductCard({ product }: {
  product: RelatedProduct;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      scroll={true}
      className="product-card flex-shrink-0 w-40 md:w-48 bg-white dark:bg-navy-light rounded-lg overflow-hidden shadow-sm border border-bella-100 dark:border-bella-700 hover:shadow-md transition-shadow"
      onMouseEnter={() => OdooAPI.prefetchProduct(product.slug)}
      onTouchStart={() => OdooAPI.prefetchProduct(product.slug)}
    >
      <div className="relative aspect-square bg-white">
        <ProductImage
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 160px, 192px"
          className="object-contain p-2"
        />
      </div>
      <div className="p-3">
        <h4 className="font-product text-sm font-medium text-navy dark:text-white line-clamp-2 overflow-hidden">{product.name}</h4>
      </div>
    </Link>
  );
}

// ============================================
// NAVIGATION OPTION 2: Browse by Type Filter Chips
// Similar to shop page filters, contextual to product
// ============================================
function BrowseByTypeChips({
  product,
  categories
}: {
  product: Product;
  categories: Category[]
}) {
  // Get product's parent category to find sibling product types
  const primaryCategoryId = product.publicCategoryIds?.[0] || product.categoryId;
  const primaryCategory = categories.find(c => c.id === primaryCategoryId);

  // Get parent category
  const parentCategory = primaryCategory?.parentId
    ? categories.find(c => c.id === primaryCategory.parentId)
    : null;

  // Get all subcategories (types) under the parent
  const productTypes = parentCategory
    ? categories.filter(c => c.parentId === parentCategory.id)
    : categories.filter(c => c.parentId === primaryCategoryId);

  // If no sub-types, show sibling categories
  let displayCategories = productTypes.length > 0
    ? productTypes
    : categories.filter(c => c.parentId === primaryCategory?.parentId);

  // Fallback: show top-level categories if nothing else found
  if (displayCategories.length < 2) {
    displayCategories = categories
      .filter(c => !c.parentId)
      .slice(0, 8);
  }

  if (displayCategories.length < 2) return null;

  const contextName = parentCategory?.name || primaryCategory?.name || 'Products';

  return (
    <div className="bg-white dark:bg-navy py-6 md:py-8 border-t border-bella-100 dark:border-bella-700">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-navy dark:text-white">Browse {contextName}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* All types button */}
          {parentCategory && (
            <Link
              href={parentCategory.childIds && parentCategory.childIds.length > 0
                ? `/shop?category=${parentCategory.id}&showAll=true`
                : `/shop?category=${parentCategory.id}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-bella-100 dark:bg-bella-700 text-bella-700 dark:text-bella-200 hover:bg-gold hover:text-white transition-all"
            >
              All {parentCategory.name} ({parentCategory.totalCount})
            </Link>
          )}
          {displayCategories.map(cat => {
            const hasChildren = cat.childIds && cat.childIds.length > 0;
            const href = hasChildren
              ? `/shop?category=${cat.id}&showAll=true`
              : `/shop?category=${cat.id}`;
            return (
              <Link
                key={cat.id}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cat.id === primaryCategoryId
                    ? 'bg-gold text-white'
                    : 'bg-bella-100 dark:bg-bella-700 text-bella-700 dark:text-bella-200 hover:bg-gold hover:text-white'
                }`}
              >
                {cat.name} ({cat.totalCount})
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// NAVIGATION OPTION 4: Enhanced You Might Also Like with Category Links
// Products + category shortcuts combined
// ============================================
function EnhancedYouMightAlsoLike({
  title,
  products,
  categories,
  currentProduct
}: {
  title: string;
  products: RelatedProduct[];
  categories: Category[];
  currentProduct: Product;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Get contextual categories
  const primaryCategoryId = currentProduct.publicCategoryIds?.[0] || currentProduct.categoryId;
  const primaryCategory = categories.find(c => c.id === primaryCategoryId);
  const parentCategory = primaryCategory?.parentId
    ? categories.find(c => c.id === primaryCategory.parentId)
    : null;

  // Quick category links - siblings and parent
  const quickLinks = [
    ...(parentCategory ? [parentCategory] : []),
    ...categories.filter(c => c.parentId === primaryCategory?.parentId && c.id !== primaryCategoryId).slice(0, 3)
  ];

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollButtons);
      return () => el.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-white to-bella-50 dark:from-navy dark:to-navy-dark py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header with title and category shortcuts */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg md:text-xl font-semibold text-navy dark:text-white">{title}</h3>
          </div>

          {/* Quick category shortcuts - Enhanced UI */}
          {quickLinks.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide bg-navy/5 dark:bg-white/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-navy dark:text-white">
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-medium whitespace-nowrap">Explore:</span>
              </div>
              {quickLinks.map(cat => {
                // Add showAll=true for categories with children
                const hasChildren = cat.childIds && cat.childIds.length > 0;
                const href = hasChildren
                  ? `/shop?category=${cat.id}&showAll=true`
                  : `/shop?category=${cat.id}`;
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-navy-light border border-bella-200 dark:border-bella-600 text-navy dark:text-white hover:bg-gold hover:border-gold hover:text-white transition-all whitespace-nowrap shadow-sm"
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Scroll arrows */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className={`p-2 rounded-full border border-bella-200 dark:border-bella-600 transition-colors ${showLeftArrow ? 'hover:bg-bella-50 dark:hover:bg-bella-700 text-navy dark:text-white' : 'opacity-30 cursor-default'}`}
              disabled={!showLeftArrow}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className={`p-2 rounded-full border border-bella-200 dark:border-bella-600 transition-colors ${showRightArrow ? 'hover:bg-bella-50 dark:hover:bg-bella-700 text-navy dark:text-white' : 'opacity-30 cursor-default'}`}
              disabled={!showRightArrow}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map(p => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              scroll={true}
              className="product-card flex-shrink-0 w-40 md:w-48 bg-white dark:bg-navy-light rounded-lg overflow-hidden shadow-sm border border-bella-100 dark:border-bella-700 hover:shadow-md transition-shadow"
              onMouseEnter={() => OdooAPI.prefetchProduct(p.slug)}
              onTouchStart={() => OdooAPI.prefetchProduct(p.slug)}
            >
              <div className="relative aspect-square bg-white">
                <ProductImage
                  src={p.thumbnail || '/placeholder.jpg'}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 160px, 192px"
                  className="object-contain p-2"
                />
              </div>
              <div className="p-3">
                <h4 className="font-product text-sm font-medium text-navy dark:text-white line-clamp-2 overflow-hidden">{p.name}</h4>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom: Browse more link */}
        {primaryCategory && (
          <div className="mt-4 text-center">
            {(() => {
              const targetCat = parentCategory || primaryCategory;
              const hasChildren = targetCat.childIds && targetCat.childIds.length > 0;
              const href = hasChildren
                ? `/shop?category=${targetCat.id}&showAll=true`
                : `/shop?category=${targetCat.id}`;
              return (
                <Link
                  href={href}
                  className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark font-medium transition-colors"
                >
                  Browse all {targetCat.name}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// Horizontal Scroll Container with Arrows
function HorizontalScrollSection({ title, children }: { title: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollButtons);
      return () => el.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-navy py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-navy dark:text-white">{title}</h3>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className={`p-2 rounded-full border border-bella-200 dark:border-bella-600 transition-colors ${showLeftArrow ? 'hover:bg-bella-50 dark:hover:bg-bella-700 text-navy dark:text-white' : 'opacity-30 cursor-default'}`}
              disabled={!showLeftArrow}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className={`p-2 rounded-full border border-bella-200 dark:border-bella-600 transition-colors ${showRightArrow ? 'hover:bg-bella-50 dark:hover:bg-bella-700 text-navy dark:text-white' : 'opacity-30 cursor-default'}`}
              disabled={!showRightArrow}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { countryConfig, formatPrice, t } = useLocale();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isVerified, requestVerification } = useVerification();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false); // For smooth navigation between products
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [fallbackProducts, setFallbackProducts] = useState<RelatedProduct[]>([]);

  // Scroll to top when slug changes (navigating to a new product)
  // Using useLayoutEffect to scroll before paint for smoother UX
  useLayoutEffect(() => {
    // Force scroll to top immediately when product changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Fallback for browsers that don't support 'instant'
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);

  useEffect(() => {
    const loadData = async () => {
      // Only show full skeleton on initial load (no product yet)
      // For subsequent navigations, show a subtle transition
      if (!product) {
        setLoading(true);
      } else {
        setIsTransitioning(true);
      }

      setSelectedImage(0);
      setQuantity(1); // Reset quantity for new product
      setFallbackProducts([]); // Clear old fallback products

      const [prod, cats] = await Promise.all([
        OdooAPI.fetchProductBySlug(slug),
        OdooAPI.fetchPublicCategories()
      ]);
      setProduct(prod);
      setCategories(cats);

      // If no alternative products, fetch random from same category
      if (prod && (!prod.alternativeProducts || prod.alternativeProducts.length === 0)) {
        const categoryId = prod.publicCategoryIds?.[0] || prod.categoryId;
        if (categoryId) {
          const randoms = await OdooAPI.fetchRandomFromCategory(categoryId, prod.id, 8);
          setFallbackProducts(randoms as RelatedProduct[]);
        }
      }

      setLoading(false);
      setIsTransitioning(false);
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.inStock === false) return;
    if (!isVerified) {
      requestVerification();
      return;
    }
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Product not found</h1>
          <Link href="/shop" className="text-gold hover:text-gold-dark">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  // Build image gallery: main image + additional images from Odoo
  const buildImageGallery = (): string[] => {
    const gallery: string[] = [];

    // Add main image
    if (product.image) {
      gallery.push(product.image);
    } else if (product.thumbnail) {
      gallery.push(product.thumbnail);
    }

    // Add additional images from Odoo
    if (product.additionalImages && product.additionalImages.length > 0) {
      product.additionalImages.forEach(img => {
        if (img.url && !gallery.includes(img.url)) {
          gallery.push(img.url);
        }
      });
    }

    // Fallback to images array if available
    if (gallery.length === 0 && product.images && product.images.length > 0) {
      return product.images;
    }

    return gallery.length > 0 ? gallery : ['/placeholder.jpg'];
  };

  const images = buildImageGallery();

  // Get alternative products (or fallback)
  const alternativeProducts = (product.alternativeProducts && product.alternativeProducts.length > 0)
    ? product.alternativeProducts
    : fallbackProducts;

  // Build category breadcrumb path by walking up the parent chain
  const renderCategoryBreadcrumb = () => {
    const buildCategoryPath = (cat: Category): Category[] => {
      const path: Category[] = [];
      let current: Category | undefined = cat;

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

    const publicCatId = product.publicCategoryIds?.[0];
    let productCategory = publicCatId
      ? categories.find(c => c.id === publicCatId)
      : null;

    if (!productCategory && product.categoryId) {
      productCategory = categories.find(c => c.id === product.categoryId);
    }

    if (productCategory) {
      const categoryPath = buildCategoryPath(productCategory);

      // Check if the root category is Washroom or Washlet - if so, show "Basin & WC" instead
      const isUnderBasinsWc = categoryPath.length > 0 &&
        (categoryPath[0].name.toLowerCase() === 'washroom' || categoryPath[0].name.toLowerCase() === 'washlet');

      // Get the root category ID for Basin & WC link
      const basinsWcCategoryId = categoryPath.length > 0 ? categoryPath[0].id : null;

      return (
        <>
          {/* Show Basin & WC as virtual parent for Washroom/Washlet categories */}
          {isUnderBasinsWc && basinsWcCategoryId && (
            <span className="flex items-center">
              <Link
                href={`/shop?category=${basinsWcCategoryId}`}
                className="hover:text-navy dark:hover:text-white"
              >
                Basin & WC
              </Link>
              <span className="mx-2">/</span>
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
                {/* Add separator only if not first visible item (after Basin & WC or at start) */}
                {(idx > 0 || !isUnderBasinsWc) && idx > 0 && <span className="mx-2">/</span>}
                <Link
                  href={`/shop?category=${cat.id}`}
                  className={isLast ? "text-navy dark:text-white hover:text-gold" : "hover:text-navy dark:hover:text-white"}
                >
                  {cat.name}
                </Link>
              </span>
            );
          })}
        </>
      );
    }

    if (!product.category) {
      return <span className="text-navy dark:text-white">Product</span>;
    }

    const categoryParts = product.category.split(' / ').map(s => s.trim()).filter(Boolean);

    if (categoryParts.length === 0) {
      return <span className="text-navy dark:text-white">{product.category}</span>;
    }

    return (
      <>
        {categoryParts.map((part, idx) => {
          let matchingCat = categories.find(c => c.name === part);
          if (!matchingCat) {
            matchingCat = categories.find(c => c.name.toLowerCase() === part.toLowerCase());
          }

          const isLast = idx === categoryParts.length - 1;

          return (
            <span key={idx} className="flex items-center">
              {idx > 0 && <span className="mx-2">/</span>}
              {matchingCat ? (
                <Link
                  href={`/shop?category=${matchingCat.id}`}
                  className={isLast ? "text-navy dark:text-white hover:text-gold" : "hover:text-navy dark:hover:text-white"}
                >
                  {part}
                </Link>
              ) : (
                <span className={isLast ? "text-navy dark:text-white" : ""}>{part}</span>
              )}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className={`min-h-screen bg-bella-50 pb-20 md:pb-0 ${isTransitioning ? 'opacity-90' : ''} transition-opacity duration-150`}>
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Compact Header with Back Button */}
        <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b border-bella-100">
          <Link href="/shop" className="p-1 flex-shrink-0">
            <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-xs text-bella-500 truncate flex items-center overflow-x-auto scrollbar-hide">
            {renderCategoryBreadcrumb()}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative aspect-[4/3] bg-white">
          <ProductImage
            src={images[selectedImage] || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="100vw"
            className="object-contain p-4"
          />
          {/* Wishlist Button on Image */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${inWishlist ? 'bg-red-50' : 'bg-white'}`}
          >
            <svg className={`w-5 h-5 ${inWishlist ? 'text-red-500' : 'text-bella-400'}`} fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${selectedImage === i ? 'bg-gold' : 'bg-bella-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Image Thumbnails (Mobile) */}
        {images.length > 1 && (
          <div className="bg-white px-4 py-2 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-gold' : 'border-bella-200'}`}
              >
                <ProductImage src={img || '/placeholder.jpg'} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Product Info - Compact */}
        <div className="px-4 py-4 bg-white">
          <h1 className="font-product font-semibold text-lg text-navy leading-tight mb-2">{product.name}</h1>

          <div className="flex items-center justify-between mb-3">
            {/* Price */}
            {isVerified ? (
              <span className="text-xl font-bold text-navy">{countryConfig.currencySymbol} {formatPrice(product.price)}</span>
            ) : (
              <button onClick={requestVerification} className="text-gold text-sm font-medium">
                Verify to see price
              </button>
            )}
            {/* Stock */}
            {product.inStock !== false ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 text-sm">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {t('inStock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600 text-sm">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {t('outOfStock')}
              </span>
            )}
          </div>

          {/* Quantity Selector - Inline */}
          {product.inStock !== false && isVerified && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-bella-600">{t('quantity')}:</span>
              <div className="flex items-center border border-bella-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-bella-600 hover:bg-bella-50"
                >
                  -
                </button>
                <span className="px-3 py-1.5 border-x border-bella-200 min-w-[40px] text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-bella-600 hover:bg-bella-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Description - Collapsible */}
          {product.description && (
            <details className="border-t border-bella-100 pt-3">
              <summary className="font-medium text-navy text-sm cursor-pointer">{t('description')}</summary>
              <p className="text-bella-600 text-sm leading-relaxed mt-2">{product.description}</p>
            </details>
          )}

          {/* Documents Section (Mobile) */}
          {product.documents && product.documents.length > 0 && (
            <details className="border-t border-bella-100 pt-3 mt-3">
              <summary className="font-medium text-navy text-sm cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents ({product.documents.length})
              </summary>
              <div className="mt-3 space-y-2">
                {product.documents.map(doc => (
                  doc.url && (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-bella-600 hover:text-navy py-2 px-3 bg-bella-50 rounded-lg"
                    >
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                      </svg>
                      <span className="truncate">{doc.name}</span>
                      <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Accessory Products (Mobile) */}
        {product.accessoryProducts && product.accessoryProducts.length > 0 && (
          <HorizontalScrollSection title="Accessories">
            {product.accessoryProducts.map(p => (
              <RelatedProductCard
                key={p.id}
                product={p}
              />
            ))}
          </HorizontalScrollSection>
        )}

        {/* Alternative/Related Products (Mobile) - OPTION 4: Enhanced version */}
        {alternativeProducts.length > 0 && (
          <EnhancedYouMightAlsoLike
            title={product.alternativeProducts?.length ? "Alternative Products" : "You May Also Like"}
            products={alternativeProducts}
            categories={categories}
            currentProduct={product}
          />
        )}

        {/* NAVIGATION OPTION 2: Browse by Type Chips (Mobile) */}
        <BrowseByTypeChips product={product} categories={categories} />

        {/* Fixed Bottom Action Bar */}
        {product.inStock !== false && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy border-t border-bella-100 dark:border-bella-700 px-4 py-3 z-20">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-white shadow-md"
              style={{ backgroundColor: addedToCart ? '#22c55e' : '#1a8a9c' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {addedToCart ? t('addedToCart') : t('addToCart')}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-navy border-b border-bella-100 dark:border-bella-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center text-sm text-bella-500 dark:text-bella-300">
              <Link href="/" className="hover:text-navy dark:hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/shop" className="hover:text-navy dark:hover:text-white">Shop</Link>
              <span className="mx-2">/</span>
              {renderCategoryBreadcrumb()}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4 product-detail-image">
                <ProductImage
                  src={images[selectedImage] || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-6"
                />
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${inWishlist ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/50' : 'bg-white hover:bg-bella-50 dark:bg-bella-700 dark:hover:bg-bella-600'}`}
                >
                  <svg className={`w-6 h-6 ${inWishlist ? 'text-red-500' : 'text-bella-600 dark:text-bella-300'}`} fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-gold' : 'border-transparent hover:border-bella-300'}`}
                    >
                      <ProductImage src={img || '/placeholder.jpg'} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-bella-500 dark:text-bella-400 text-sm uppercase tracking-wide mb-2">{product.category}</p>
              <h1 className="font-product text-2xl md:text-3xl font-semibold text-navy dark:text-white mb-4">{product.name}</h1>

              {/* Price */}
              <div className="mb-6">
                {isVerified ? (
                  <span className="text-3xl font-bold text-navy dark:text-white">{countryConfig.currencySymbol} {formatPrice(product.price)}</span>
                ) : (
                  <button
                    onClick={requestVerification}
                    className="text-gold hover:text-gold-dark font-medium"
                  >
                    Verify to see price
                  </button>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                {product.inStock !== false ? (
                  <span className="inline-flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t('inStock')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {t('outOfStock')}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="font-semibold text-navy dark:text-white mb-2">{t('description')}</h3>
                  <p className="text-bella-600 dark:text-bella-300 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Documents Section (Desktop) */}
              {product.documents && product.documents.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-navy dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Product Documents
                  </h3>
                  <div className="grid gap-2">
                    {product.documents.map(doc => (
                      doc.url && (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-bella-600 hover:text-navy dark:text-bella-300 dark:hover:text-white py-3 px-4 bg-bella-50 dark:bg-bella-800 rounded-lg transition-colors group"
                        >
                          <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                          </svg>
                          <span className="flex-1">{doc.name}</span>
                          <span className="text-xs text-bella-400 group-hover:text-bella-500">Download</span>
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              {product.inStock !== false && (
                <div className="space-y-4">
                  {isVerified && (
                    <div className="flex items-center gap-4">
                      <span className="text-navy dark:text-white font-medium">{t('quantity')}:</span>
                      <div className="flex items-center border border-bella-200 dark:border-bella-600 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-bella-50 dark:hover:bg-bella-700 dark:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 border-x border-bella-200 dark:border-bella-600 dark:text-white min-w-[60px] text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 hover:bg-bella-50 dark:hover:bg-bella-700 dark:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    className="py-4 px-12 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-md text-white hover:shadow-lg"
                    style={{ backgroundColor: addedToCart ? '#22c55e' : '#1a8a9c' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {addedToCart ? t('addedToCart') : t('addToCart')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accessory Products Section (Desktop) */}
        {product.accessoryProducts && product.accessoryProducts.length > 0 && (
          <HorizontalScrollSection title="Accessories">
            {product.accessoryProducts.map(p => (
              <RelatedProductCard
                key={p.id}
                product={p}
              />
            ))}
          </HorizontalScrollSection>
        )}

        {/* Alternative/Related Products Section (Desktop) - OPTION 4: Enhanced version */}
        {alternativeProducts.length > 0 && (
          <EnhancedYouMightAlsoLike
            title={product.alternativeProducts?.length ? "Alternative Products" : "You May Also Like"}
            products={alternativeProducts}
            categories={categories}
            currentProduct={product}
          />
        )}

        {/* NAVIGATION OPTION 2: Browse by Type Chips (Desktop) */}
        <BrowseByTypeChips product={product} categories={categories} />
      </div>
    </div>
  );
}
