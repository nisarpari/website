// Odoo JSON-2 API client for Next.js API routes (Odoo 19+)

const ODOO_CONFIG = {
  baseUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
  // Use Odoo.com directly for images (they auto-optimize to ~220KB)
  imageBaseUrl: process.env.ODOO_IMAGE_URL || 'https://bellagcc.odoo.com',
  database: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
  apiKey: process.env.ODOO_API_KEY || '',
};

// Return image URL directly from Cloudflare CDN (no transformation)
// Odoo's live server already optimizes images
export function getOptimizedImageUrl(originalUrl: string): string {
  return originalUrl;
}

export { ODOO_CONFIG };

interface OdooKwargs {
  fields?: string[];
  limit?: number;
  offset?: number;
  order?: string;
  [key: string]: unknown;
}

// Helper function for Odoo JSON-2 API calls (Odoo 19+)
// Migrated from deprecated /jsonrpc to new /json/2/<model>/<method> endpoint
export async function odooApiCall<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: OdooKwargs = {}
): Promise<T> {
  // New JSON-2 API endpoint format: /json/2/<model>/<method>
  const url = `${ODOO_CONFIG.baseUrl}/json/2/${model}/${method}`;

  // Build the request body for JSON-2 API
  // JSON-2 uses named parameters, not positional
  const body: Record<string, unknown> = {};

  // Handle domain argument (first positional arg for search methods)
  if (args.length > 0 && Array.isArray(args[0])) {
    body.domain = args[0];
  }

  // Handle ids argument (for read, write methods)
  if (args.length > 0 && (typeof args[0] === 'number' || (Array.isArray(args[0]) && typeof args[0][0] === 'number' && !Array.isArray(args[0][0])))) {
    body.ids = Array.isArray(args[0]) ? args[0] : [args[0]];
  }

  // Handle values argument (for create, write methods - second arg)
  if (args.length > 1 && typeof args[1] === 'object' && !Array.isArray(args[1])) {
    body.values = args[1];
  }

  // Add kwargs as named parameters
  if (kwargs.fields) body.fields = kwargs.fields;
  if (kwargs.limit !== undefined) body.limit = kwargs.limit;
  if (kwargs.offset !== undefined) body.offset = kwargs.offset;
  if (kwargs.order) body.order = kwargs.order;

  // Add any other kwargs
  for (const [key, value] of Object.entries(kwargs)) {
    if (!['fields', 'limit', 'offset', 'order'].includes(key)) {
      body[key] = value;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${ODOO_CONFIG.apiKey}`,
  };

  // Add database header for multi-database environments
  if (ODOO_CONFIG.database) {
    headers['X-Odoo-Database'] = ODOO_CONFIG.database;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  // JSON-2 API returns meaningful HTTP status codes
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Odoo API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // JSON-2 returns the result directly, not wrapped in jsonrpc format
  return data as T;
}
