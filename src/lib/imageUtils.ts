// Client-side image optimization utilities
// Uses Cloudflare Image Transformations for automatic WebP conversion

const CF_IMAGE_TRANSFORM_URL = process.env.NEXT_PUBLIC_CF_IMAGE_TRANSFORM_URL || '';

/**
 * Get optimized image URL using Cloudflare Image Transformations
 * Automatically converts images to WebP format with specified quality and size
 *
 * @param originalUrl - The original image URL (can be from any source)
 * @param options - Optimization options (width, quality, format)
 * @returns Optimized image URL through Cloudflare, or original URL if CF not configured
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: { width?: number; quality?: number; format?: 'auto' | 'webp' | 'avif' } = {}
): string {
  // Skip if already a WebP or if it's a local static file
  if (!originalUrl || originalUrl.startsWith('/')) {
    return originalUrl;
  }

  // Skip if Cloudflare transforms not configured
  if (!CF_IMAGE_TRANSFORM_URL) {
    return originalUrl;
  }

  const { width, quality = 85, format = 'auto' } = options;

  // Build Cloudflare transformation options
  const cfOptions: string[] = [`format=${format}`, `quality=${quality}`];
  if (width) {
    cfOptions.push(`width=${width}`);
  }

  // Cloudflare Image Transformation URL format:
  // https://your-domain.com/cdn-cgi/image/format=auto,quality=85/https://origin-url/path
  return `${CF_IMAGE_TRANSFORM_URL}/cdn-cgi/image/${cfOptions.join(',')}/${originalUrl}`;
}

/**
 * Check if an image URL is already optimized (WebP/AVIF format)
 */
export function isOptimizedImage(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.avif') || lowerUrl.includes('/cdn-cgi/image/');
}

/**
 * Get the best image format for a URL, preferring WebP
 * For external URLs, routes through Cloudflare for conversion
 * For local files, assumes they're already optimized
 */
export function ensureOptimizedImage(
  url: string,
  options: { width?: number; quality?: number } = {}
): string {
  if (!url) return '/placeholder.webp';

  // Local files - assume already optimized
  if (url.startsWith('/')) {
    return url;
  }

  // Already optimized
  if (isOptimizedImage(url)) {
    return url;
  }

  // Route through Cloudflare for optimization
  return getOptimizedImageUrl(url, { ...options, format: 'auto' });
}
