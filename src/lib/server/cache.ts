// Redis caching utility for Odoo API responses
import { Redis } from '@upstash/redis';

// Cache durations in seconds
export const CACHE_TTL = {
  PRODUCTS: 7 * 24 * 60 * 60,        // 7 days
  PRODUCT_BY_SLUG: 7 * 24 * 60 * 60, // 7 days
  CATEGORIES: 7 * 24 * 60 * 60,      // 7 days
  RIBBONS: 30 * 24 * 60 * 60,        // 30 days
  BESTSELLERS: 7 * 24 * 60 * 60,     // 7 days
  NEW_ARRIVALS: 7 * 24 * 60 * 60,    // 7 days
  SEARCH: 7 * 24 * 60 * 60,          // 7 days (based on cached products)
  PRODUCTS_BY_CATEGORY: 7 * 24 * 60 * 60, // 7 days
};

// Cache key prefixes
export const CACHE_KEYS = {
  ALL_PRODUCTS: 'odoo:products:all',
  PRODUCT_BY_SLUG: 'odoo:product:slug:',
  PRODUCT_BY_ID: 'odoo:product:id:',
  CATEGORIES: 'odoo:categories',
  PUBLIC_CATEGORIES: 'odoo:categories:public',
  RIBBONS: 'odoo:ribbons',
  BESTSELLERS: 'odoo:products:bestsellers',
  NEW_ARRIVALS: 'odoo:products:new-arrivals',
  PRODUCTS_BY_CATEGORY: 'odoo:products:category:',
  PRODUCTS_BY_PUBLIC_CATEGORY: 'odoo:products:public-category:',
  SEARCH: 'odoo:search:',
};

// Initialize Redis client
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Get cached data from Redis
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    return data;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set data in Redis cache with TTL
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    await client.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Delete a specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    await client.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
}

/**
 * Delete all cache keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  const client = getRedis();
  if (!client) return 0;

  try {
    // Scan for keys matching pattern
    let cursor = '0';
    let deletedCount = 0;

    do {
      const result = await client.scan(cursor, { match: pattern, count: 100 });
      cursor = String(result[0]);
      const keys = result[1] as string[];

      if (keys.length > 0) {
        await client.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');

    return deletedCount;
  } catch (error) {
    console.error(`Cache pattern delete error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Clear all Odoo-related caches
 */
export async function clearAllOdooCache(): Promise<{ success: boolean; deletedKeys: number }> {
  const client = getRedis();
  if (!client) {
    return { success: false, deletedKeys: 0 };
  }

  try {
    const deletedCount = await deleteCachePattern('odoo:*');
    return { success: true, deletedKeys: deletedCount };
  } catch (error) {
    console.error('Error clearing all Odoo cache:', error);
    return { success: false, deletedKeys: 0 };
  }
}

/**
 * Clear specific cache types
 */
export async function clearProductsCache(): Promise<number> {
  let count = 0;
  count += await deleteCachePattern('odoo:products:*');
  count += await deleteCachePattern('odoo:product:*');
  count += await deleteCachePattern('odoo:search:*');
  return count;
}

export async function clearCategoriesCache(): Promise<number> {
  let count = 0;
  await deleteCache(CACHE_KEYS.CATEGORIES);
  await deleteCache(CACHE_KEYS.PUBLIC_CATEGORIES);
  count += 2;
  return count;
}

export async function clearRibbonsCache(): Promise<void> {
  await deleteCache(CACHE_KEYS.RIBBONS);
}

/**
 * Get cache stats
 */
export async function getCacheStats(): Promise<{
  hasProducts: boolean;
  hasCategories: boolean;
  hasPublicCategories: boolean;
  hasRibbons: boolean;
  hasBestsellers: boolean;
  hasNewArrivals: boolean;
}> {
  const client = getRedis();
  if (!client) {
    return {
      hasProducts: false,
      hasCategories: false,
      hasPublicCategories: false,
      hasRibbons: false,
      hasBestsellers: false,
      hasNewArrivals: false,
    };
  }

  const [products, categories, publicCategories, ribbons, bestsellers, newArrivals] = await Promise.all([
    client.exists(CACHE_KEYS.ALL_PRODUCTS),
    client.exists(CACHE_KEYS.CATEGORIES),
    client.exists(CACHE_KEYS.PUBLIC_CATEGORIES),
    client.exists(CACHE_KEYS.RIBBONS),
    client.exists(CACHE_KEYS.BESTSELLERS),
    client.exists(CACHE_KEYS.NEW_ARRIVALS),
  ]);

  return {
    hasProducts: products === 1,
    hasCategories: categories === 1,
    hasPublicCategories: publicCategories === 1,
    hasRibbons: ribbons === 1,
    hasBestsellers: bestsellers === 1,
    hasNewArrivals: newArrivals === 1,
  };
}

/**
 * Wrapper function to get cached data or fetch from source
 */
export async function getCachedOrFetch<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  await setCache(cacheKey, data, ttlSeconds);

  return data;
}

// ========================================
// Legacy in-memory cache (kept for backwards compatibility)
// ========================================

interface CacheEntry<T> {
  data: T | null;
  timestamp: number | null;
  ttl: number;
}

// Product cache (5 minutes) - DEPRECATED: use Redis instead
export const productCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000
};

// Category cache (30 minutes) - DEPRECATED: use Redis instead
export const categoryCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000
};

// Public category cache (30 minutes) - DEPRECATED: use Redis instead
export const publicCategoryCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000
};

// Ribbon cache (1 hour) - DEPRECATED: use Redis instead
export const ribbonCache: CacheEntry<unknown[]> = {
  data: null,
  timestamp: null,
  ttl: 60 * 60 * 1000
};

// Check if cache is valid - DEPRECATED: use Redis instead
export function isCacheValid<T>(cache: CacheEntry<T>): boolean {
  return cache.data !== null &&
         cache.timestamp !== null &&
         Date.now() - cache.timestamp < cache.ttl;
}

// Clear all in-memory caches - DEPRECATED: use clearAllOdooCache instead
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
