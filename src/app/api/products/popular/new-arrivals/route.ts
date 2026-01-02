// GET /api/products/popular/new-arrivals - Fetch new arrivals
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/server/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    // Use cache key with limit to handle different limits
    const cacheKey = `${CACHE_KEYS.NEW_ARRIVALS}:${limit}`;

    const products = await getCachedOrFetch(
      cacheKey,
      CACHE_TTL.NEW_ARRIVALS,
      async () => {
        const rawProducts = await odooApiCall<Array<Record<string, unknown>>>(
          'product.template',
          'search_read',
          [[['is_published', '=', true]]],
          {
            fields: [
              'id', 'name', 'list_price', 'categ_id',
              'description_sale', 'default_code', 'qty_available', 'website_url',
              'public_categ_ids', 'website_ribbon_id',
              'product_template_image_ids'
            ],
            limit: limit,
            order: 'create_date desc'
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawProducts.map((p: any) => transformProduct(p));
      }
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json({ error: 'Failed to fetch new arrivals' }, { status: 500 });
  }
}
