export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-light rounded-lg overflow-hidden shadow-sm border border-bella-100 dark:border-bella-700">
      {/* Image skeleton - matches 4:5 aspect ratio with p-1 padding like actual card */}
      <div className="relative aspect-[4/5] bg-white dark:bg-navy-light p-1">
        <div className="w-full h-full bg-bella-100 dark:bg-navy animate-pulse rounded" />
      </div>

      {/* Product info skeleton - matches shop page card */}
      <div className="p-2 md:p-3 border-t border-bella-50 dark:border-bella-700">
        {/* Title skeleton - two lines matching text-xs md:text-sm */}
        <div className="space-y-1.5">
          <div className="h-3 md:h-3.5 bg-bella-100 dark:bg-navy rounded w-full animate-pulse" />
          <div className="h-3 md:h-3.5 bg-bella-100 dark:bg-navy rounded w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Product type filter skeleton for shop page
export function ProductTypeFilterSkeleton() {
  return (
    <div className="mb-6 bg-white dark:bg-navy-light rounded-xl p-4 border border-bella-100 dark:border-bella-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 bg-bella-100 dark:bg-navy rounded animate-pulse" />
        <div className="h-4 bg-bella-100 dark:bg-navy rounded w-36 animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 bg-bella-100 dark:bg-navy rounded-lg animate-pulse"
            style={{ width: `${60 + (i % 3) * 25}px` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, showProductTypeFilter = true }: { count?: number; showProductTypeFilter?: boolean }) {
  return (
    <div>
      {/* Product Type Filter Skeleton */}
      {showProductTypeFilter && <ProductTypeFilterSkeleton />}

      {/* Products Grid - matches shop page grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Compact skeleton for homepage carousel (desktop)
export function ProductCarouselCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[150px] lg:w-[180px]">
      <div className="h-full bg-white dark:bg-navy-light rounded-xl overflow-hidden border border-bella-100 dark:border-white/10">
        <div className="relative aspect-[4/5] bg-bella-100 dark:bg-navy animate-pulse" />
        <div className="p-3">
          <div className="space-y-2">
            <div className="h-3 bg-bella-100 dark:bg-navy rounded w-full animate-pulse" />
            <div className="h-3 bg-bella-100 dark:bg-navy rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Carousel skeleton for homepage (desktop)
export function ProductCarouselSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCarouselCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Mobile product card skeleton
export function MobileProductCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[120px]">
      <div className="w-[120px] bg-white dark:bg-navy-light rounded-xl overflow-hidden shadow-sm border border-bella-100 dark:border-white/10">
        <div className="w-[120px] h-[100px] bg-bella-100 dark:bg-navy animate-pulse" />
        <div className="p-1.5 h-[40px]">
          <div className="h-2 bg-bella-100 dark:bg-navy rounded w-full animate-pulse mb-1" />
          <div className="h-2 bg-bella-100 dark:bg-navy rounded w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Mobile carousel skeleton
export function MobileProductCarouselSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden px-4 pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <MobileProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Category card skeleton for VideoHeroSection (dark style)
export function CategoryCardSkeleton() {
  return (
    <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-navy-light animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
        <div className="h-5 md:h-7 bg-white/20 rounded w-2/3 mb-2 animate-pulse" />
        <div className="h-3 md:h-4 bg-white/10 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}

// Category grid skeleton for VideoHeroSection
export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Shop page category card skeleton (light style - matches AllCategoriesGrid)
export function ShopCategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl overflow-hidden shadow-sm border border-bella-100 dark:border-bella-700">
      {/* Image skeleton - matches 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] bg-bella-100 dark:bg-navy animate-pulse" />
      {/* Category info skeleton */}
      <div className="p-4">
        <div className="h-5 md:h-6 bg-bella-100 dark:bg-navy rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
}

// Shop page section header skeleton
function ShopSectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-1 h-8 bg-bella-200 dark:bg-bella-600 rounded-full animate-pulse" />
        <div>
          <div className="h-6 md:h-7 bg-bella-100 dark:bg-navy rounded w-32 md:w-40 animate-pulse mb-2" />
          <div className="h-4 bg-bella-100 dark:bg-navy rounded w-40 md:w-48 animate-pulse" />
        </div>
      </div>
      <div className="hidden md:block h-10 bg-bella-100 dark:bg-navy rounded-lg w-36 animate-pulse" />
    </div>
  );
}

// Product detail page skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-bella-50 dark:bg-navy pb-20 md:pb-0">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-navy-light sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b border-bella-100 dark:border-bella-700">
          <div className="w-5 h-5 bg-bella-100 dark:bg-navy rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bella-100 dark:bg-navy rounded animate-pulse" />
        </div>

        {/* Image skeleton - fixed to show visible animation */}
        <div className="relative aspect-[4/3] bg-white dark:bg-navy-light">
          <div className="absolute inset-4 bg-bella-100 dark:bg-navy rounded-lg animate-pulse" />
          {/* Wishlist button placeholder */}
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-bella-100 dark:bg-navy animate-pulse" />
        </div>

        {/* Thumbnails skeleton */}
        <div className="bg-white dark:bg-navy-light px-4 py-2 flex gap-2 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-14 h-14 flex-shrink-0 rounded-lg bg-bella-100 dark:bg-navy animate-pulse" />
          ))}
        </div>

        {/* Product info skeleton */}
        <div className="px-4 py-4 bg-white dark:bg-navy-light">
          {/* Title */}
          <div className="h-5 bg-bella-100 dark:bg-navy rounded w-4/5 mb-2 animate-pulse" />
          <div className="h-5 bg-bella-100 dark:bg-navy rounded w-3/5 mb-4 animate-pulse" />

          {/* Price and stock row */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 bg-bella-100 dark:bg-navy rounded w-28 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-bella-100 dark:bg-navy rounded-full animate-pulse" />
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-16 animate-pulse" />
            </div>
          </div>

          {/* Quantity selector skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-4 bg-bella-100 dark:bg-navy rounded w-16 animate-pulse" />
            <div className="h-9 bg-bella-100 dark:bg-navy rounded-lg w-28 animate-pulse" />
          </div>

          {/* Description skeleton */}
          <div className="border-t border-bella-100 pt-3">
            <div className="h-4 bg-bella-100 dark:bg-navy rounded w-24 mb-2 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3.5 bg-bella-100 dark:bg-navy rounded w-full animate-pulse" />
              <div className="h-3.5 bg-bella-100 dark:bg-navy rounded w-5/6 animate-pulse" />
              <div className="h-3.5 bg-bella-100 dark:bg-navy rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Related products skeleton for mobile */}
        <div className="bg-white dark:bg-navy-light mt-2 py-6">
          <div className="px-4 mb-4">
            <div className="h-5 bg-bella-100 dark:bg-navy rounded w-40 animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-hidden px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 bg-white dark:bg-navy-light rounded-lg overflow-hidden border border-bella-100 dark:border-bella-700">
                <div className="aspect-square bg-bella-100 dark:bg-navy animate-pulse" />
                <div className="p-2">
                  <div className="h-3 bg-bella-100 dark:bg-navy rounded w-full mb-1 animate-pulse" />
                  <div className="h-3 bg-bella-100 dark:bg-navy rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed bottom action bar skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy border-t border-bella-100 dark:border-bella-700 px-4 py-3 z-20">
          <div className="h-12 bg-bella-100 dark:bg-navy rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Breadcrumb skeleton */}
        <div className="bg-white dark:bg-navy-light border-b border-bella-100 dark:border-bella-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-12 animate-pulse" />
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-2 animate-pulse" />
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-12 animate-pulse" />
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-2 animate-pulse" />
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Product details skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Images skeleton */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-bella-100 dark:bg-navy-light mb-4 animate-pulse" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 flex-shrink-0 rounded-lg bg-bella-100 dark:bg-navy animate-pulse" />
                ))}
              </div>
            </div>

            {/* Info skeleton */}
            <div>
              <div className="h-4 bg-bella-100 dark:bg-navy rounded w-32 mb-3 animate-pulse" />
              <div className="h-8 bg-bella-100 dark:bg-navy rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-7 bg-bella-100 dark:bg-navy rounded w-1/2 mb-6 animate-pulse" />
              <div className="h-10 bg-bella-100 dark:bg-navy rounded w-32 mb-6 animate-pulse" />
              <div className="h-6 bg-bella-100 dark:bg-navy rounded w-24 mb-8 animate-pulse" />
              <div className="space-y-3 mb-8">
                <div className="h-4 bg-bella-100 dark:bg-navy rounded w-full animate-pulse" />
                <div className="h-4 bg-bella-100 dark:bg-navy rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-bella-100 dark:bg-navy rounded w-4/6 animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 bg-bella-100 dark:bg-navy rounded w-32 animate-pulse" />
              </div>
              <div className="h-14 bg-bella-100 dark:bg-navy rounded-full w-48 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="bg-white dark:bg-navy py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="h-6 bg-bella-100 dark:bg-navy rounded w-48 mb-4 animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 md:w-48 bg-white dark:bg-navy-light rounded-lg overflow-hidden border border-bella-100 dark:border-bella-700">
                  <div className="aspect-square bg-bella-100 dark:bg-navy animate-pulse" />
                  <div className="p-3">
                    <div className="h-4 bg-bella-100 dark:bg-navy rounded w-full mb-1 animate-pulse" />
                    <div className="h-4 bg-bella-100 dark:bg-navy rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shop page category grid skeleton (full layout with filter bar and sections)
export function ShopCategoryGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Sticky filter bar skeleton */}
      <div className="sticky top-20 z-30 bg-bella-50/95 dark:bg-navy/95 backdrop-blur-sm py-3 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3">
          {/* Search input skeleton */}
          <div className="w-32 md:w-40 h-8 bg-bella-100 dark:bg-navy rounded-full animate-pulse" />
          {/* Category pills skeleton */}
          <div className="flex items-center gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 bg-bella-100 dark:bg-navy rounded-full animate-pulse" style={{ width: `${60 + (i % 3) * 20}px` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Section 1 skeleton */}
      <div className="space-y-6">
        <ShopSectionHeaderSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ShopCategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Section 2 skeleton */}
      <div className="space-y-6">
        <ShopSectionHeaderSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShopCategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
