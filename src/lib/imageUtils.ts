// Client-side image utilities
// Images served directly from Cloudflare CDN (erp.bellastore.in)

/**
 * Get image URL - returns URL as-is
 * Odoo's live server already optimizes images, Cloudflare caches them
 */
export function getOptimizedImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  return originalUrl;
}

/**
 * Get responsive image URL
 * Returns URL as-is - no transformation needed
 */
export function getResponsiveImageUrl(url: string): string {
  if (!url) return '/placeholder.webp';
  return url;
}

/**
 * Ensure optimized image - returns URL as-is
 * Kept for backwards compatibility
 */
export function ensureOptimizedImage(url: string): string {
  if (!url) return '/placeholder.webp';
  return url;
}
