// Odoo API client for Next.js API routes
// Uses /web/dataset/call_kw endpoint (Odoo 20+ compatible)

const ODOO_CONFIG = {
  baseUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
  // Use Cloudflare CDN for images (erp.bellastore.in proxies to Odoo with caching)
  imageBaseUrl: process.env.ODOO_IMAGE_URL || 'https://erp.bellastore.in',
  database: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
  apiKey: process.env.ODOO_API_KEY || '',
};

export { ODOO_CONFIG };

interface OdooKwargs {
  fields?: string[];
  limit?: number;
  offset?: number;
  order?: string;
  [key: string]: unknown;
}

// Helper function for Odoo API calls using /web/dataset/call_kw (Odoo 20+ compatible)
export async function odooApiCall<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: OdooKwargs = {}
): Promise<T> {
  const url = `${ODOO_CONFIG.baseUrl}/web/dataset/call_kw/${model}/${method}`;

  const body = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      model: model,
      method: method,
      args: args,
      kwargs: kwargs
    },
    id: Date.now()
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': ODOO_CONFIG.apiKey
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
