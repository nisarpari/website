export function ProductCardSkeleton() {
  return (
    <div className="h-full bg-white dark:bg-navy-light rounded-xl overflow-hidden border border-bella-100 dark:border-white/10">
      {/* Image skeleton - matches 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] bg-bella-100 dark:bg-navy animate-pulse" />

      {/* Product info skeleton */}
      <div className="p-4">
        {/* Title skeleton - two lines */}
        <div className="space-y-2 min-h-[40px]">
          <div className="h-4 bg-bella-100 dark:bg-navy rounded w-full animate-pulse" />
          <div className="h-4 bg-bella-100 dark:bg-navy rounded w-3/4 animate-pulse" />
        </div>

        {/* Details link skeleton */}
        <div className="mt-2">
          <div className="h-3 bg-bella-100 dark:bg-navy rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

// Category card skeleton for VideoHeroSection
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
