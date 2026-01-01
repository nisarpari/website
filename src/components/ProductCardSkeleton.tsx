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
