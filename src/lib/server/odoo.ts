// Odoo JSON-RPC API client for Next.js API routes

const ODOO_CONFIG = {
  baseUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
  // Use Cloudflare CDN for images (erp.bellastore.in proxies to Odoo with caching)
  imageBaseUrl: process.env.ODOO_IMAGE_URL || 'https://erp.bellastore.in',
  // Cloudinary cloud name for image optimization
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'doksvu65b',
  database: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
  apiKey: process.env.ODOO_API_KEY || '',
};

// Generate optimized image URL using Cloudinary fetch
// Automatically converts to WebP/AVIF based on browser support
export function getOptimizedImageUrl(
  originalUrl: string,
  options: { width?: number; quality?: number } = {}
): string {
  const { width, quality = 85 } = options;

  // If Cloudinary not configured, return original URL
  if (!ODOO_CONFIG.cloudinaryCloudName) {
    return originalUrl;
  }

  // Build Cloudinary transformation options
  // f_webp = force WebP format (Safari/iOS supports WebP since iOS 14)
  // q_auto or q_XX = quality
  const transforms: string[] = ['f_webp'];
  transforms.push(quality === 85 ? 'q_auto' : `q_${quality}`);
  if (width) {
    transforms.push(`w_${width}`);
  }

  // Cloudinary fetch URL format:
  // https://res.cloudinary.com/CLOUD_NAME/image/fetch/f_auto,q_auto,w_512/https://original-url
  return `https://res.cloudinary.com/${ODOO_CONFIG.cloudinaryCloudName}/image/fetch/${transforms.join(',')}/${originalUrl}`;
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
