// Odoo JSON-RPC API client for Next.js API routes

const ODOO_CONFIG = {
  baseUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
  // Use Cloudflare CDN for images (erp.bellastore.in proxies to Odoo with caching)
  imageBaseUrl: process.env.ODOO_IMAGE_URL || 'https://erp.bellastore.in',
  // Cloudflare Image Transformations base URL (set to your domain with Cloudflare)
  cfImageTransformUrl: process.env.CF_IMAGE_TRANSFORM_URL || '',
  database: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
  apiKey: process.env.ODOO_API_KEY || '',
};

// Generate optimized image URL using Cloudflare Image Transformations
// Falls back to direct URL if CF transforms not configured
export function getOptimizedImageUrl(
  originalUrl: string,
  options: { width?: number; quality?: number; format?: 'auto' | 'webp' | 'avif' } = {}
): string {
  const { width, quality = 85, format = 'auto' } = options;

  // If Cloudflare transforms not configured, return original URL
  if (!ODOO_CONFIG.cfImageTransformUrl) {
    return originalUrl;
  }

  // Build Cloudflare transformation options
  const cfOptions: string[] = [`format=${format}`, `quality=${quality}`];
  if (width) {
    cfOptions.push(`width=${width}`);
  }

  // Cloudflare Image Transformation URL format:
  // https://your-domain.com/cdn-cgi/image/format=auto,quality=85/https://origin-url/path
  return `${ODOO_CONFIG.cfImageTransformUrl}/cdn-cgi/image/${cfOptions.join(',')}/${originalUrl}`;
}

export { ODOO_CONFIG };

interface OdooKwargs {
  fields?: string[];
  limit?: number;
  offset?: number;
  order?: string;
  [key: string]: unknown;
}

// Helper function for Odoo JSON-RPC API calls
export async function odooApiCall<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: OdooKwargs = {}
): Promise<T> {
  const url = `${ODOO_CONFIG.baseUrl}/jsonrpc`;

  const body = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        ODOO_CONFIG.database,
        2, // User ID (2 is typically admin)
        ODOO_CONFIG.apiKey,
        model,
        method,
        args,
        kwargs
      ]
    },
    id: Date.now()
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (data.error) {
    const errorMessage = data.error.data?.message || data.error.message || JSON.stringify(data.error);
    throw new Error(errorMessage);
  }

  return data.result !== undefined ? data.result : data;
}
