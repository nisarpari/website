// Client-side image utilities
// Images served directly from Cloudflare CDN (erp.bellastore.in)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://web.bellastore.in';

/**
 * Get image URL - returns URL as-is
 * Odoo's live server already optimizes images, Cloudflare caches them
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  _options: { width?: number; quality?: number } = {}
): string {
  if (!originalUrl) return originalUrl;
  return originalUrl;
}

/**
 * Get responsive image URL
 * Returns URL as-is - no transformation needed
 */
export function getResponsiveImageUrl(
  url: string,
  _screenType: 'mobile' | 'tablet' | 'desktop'
): string {
  if (!url) return '/placeholder.webp';

  // For local paths, return as-is
  if (url.startsWith('/')) {
    return url;
  }

  return url;
}
