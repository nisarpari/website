export function ProductCardSkeleton() {
  return (
    <div className="h-full bg-white dark:bg-navy-light rounded-lg overflow-hidden shadow-sm border border-bella-100 dark:border-bella-700">
      {/* Image skeleton - matches 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] bg-bella-100 dark:bg-navy animate-pulse" />

      {/* Product info skeleton - matches shop page card */}
      <div className="p-2 md:p-3 border-t border-bella-50 dark:border-bella-700">
        {/* Title skeleton - two lines */}
        <div className="space-y-1.5">
          <div className="h-2.5 md:h-3 bg-bella-100 dark:bg-navy rounded w-full animate-pulse" />
          <div className="h-2.5 md:h-3 bg-bella-100 dark:bg-navy rounded w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
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
