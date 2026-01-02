// GET /api/products - Fetch all products
import { NextRequest } from 'next/server';
import { odooApiCall, ODOO_CONFIG } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL, cachedJsonResponse, HTTP_CACHE_TTL } from '@/lib/server/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Cache key includes pagination params
    const cacheKey = offset === 0 && limit >= 500
      ? CACHE_KEYS.ALL_PRODUCTS
      : `${CACHE_KEYS.ALL_PRODUCTS}:${offset}:${limit}`;

    const products = await getCachedOrFetch(
      cacheKey,
      CACHE_TTL.PRODUCTS,
      async () => {
        const rawProducts = await odooApiCall<Array<Record<string, unknown>>>(
          'product.template',
          'search_read',
          [[['is_published', '=', true]]],
          {
            fields: [
              'id', 'name', 'list_price', 'categ_id',
              'description_sale', 'default_code', 'qty_available', 'website_url',
              'public_categ_ids',
              'website_ribbon_id',
              'allow_out_of_stock_order',
              'show_availability',
              'available_threshold',
              'product_template_image_ids',
              'product_variant_ids'
            ],
            limit: limit,
            offset: offset,
            order: 'name asc'
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawProducts.map((p: any) => transformProduct(p));
      }
    );

    return cachedJsonResponse(products, HTTP_CACHE_TTL.MEDIUM);
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
        odooUrl: ODOO_CONFIG.baseUrl
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
