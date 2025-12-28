// Simple in-memory cache for API routes
// Note: In serverless environments, cache is per-instance and short-lived

interface CacheEntry<T> {
  data: T | null;
  timestamp: number | null;
  ttl: number;
}

// Product cache (5 minutes)
export const productCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000
};

// Category cache (30 minutes)
export const categoryCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000
};

// Public category cache (30 minutes)
export const publicCategoryCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000
};

// Ribbon cache (1 hour)
export const ribbonCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 60 * 60 * 1000
};

// Check if cache is valid
export function isCacheValid<T>(cache: CacheEntry<T>): boolean {
  return cache.data !== null &&
         cache.timestamp !== null &&
         Date.now() - cache.timestamp < cache.ttl;
}

// Clear all caches
export function clearAllCaches(): void {
  productCache.data = null;
  productCache.timestamp = null;
  categoryCache.data = null;
  categoryCache.timestamp = null;
  publicCategoryCache.data = null;
  publicCategoryCache.timestamp = null;
  ribbonCache.data = null;
  ribbonCache.timestamp = null;
}
