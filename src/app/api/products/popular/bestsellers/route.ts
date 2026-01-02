// GET /api/products/popular/bestsellers - Fetch popular/bestselling products
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/server/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    // Use cache key with limit to handle different limits
    const cacheKey = `${CACHE_KEYS.BESTSELLERS}:${limit}`;

    const products = await getCachedOrFetch(
      cacheKey,
      CACHE_TTL.BESTSELLERS,
      async () => {
        // Fetch products sorted by sales count or recent activity
        const rawProducts = await odooApiCall<Array<Record<string, unknown>>>(
          'product.template',
          'search_read',
          [[['is_published', '=', true], ['qty_available', '>', 0]]],
          {
            fields: [
              'id', 'name', 'list_price', 'categ_id',
              'description_sale', 'default_code', 'qty_available', 'website_url',
              'public_categ_ids', 'website_ribbon_id',
              'product_template_image_ids'
            ],
            limit: limit,
            order: 'write_date desc'
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawProducts.map((p: any) => transformProduct(p));
      }
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return NextResponse.json({ error: 'Failed to fetch popular products' }, { status: 500 });
  }
}
