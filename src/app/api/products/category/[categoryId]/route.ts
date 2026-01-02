// GET /api/products/category/[categoryId] - Fetch products by internal category
import { NextRequest } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL, cachedJsonResponse, HTTP_CACHE_TTL } from '@/lib/server/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const catId = parseInt(categoryId);
    const cacheKey = `${CACHE_KEYS.PRODUCTS_BY_CATEGORY}${catId}`;

    const products = await getCachedOrFetch(
      cacheKey,
      CACHE_TTL.PRODUCTS_BY_CATEGORY,
      async () => {
        const rawProducts = await odooApiCall<Array<Record<string, unknown>>>(
          'product.template',
          'search_read',
          [[['categ_id', '=', catId], ['is_published', '=', true]]],
          {
            fields: [
              'id', 'name', 'list_price', 'categ_id',
              'image_1920', 'description_sale', 'default_code',
              'qty_available', 'website_url'
            ],
            limit: 100
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawProducts.map((p: any) => transformProduct(p));
      }
    );

    return cachedJsonResponse(products, HTTP_CACHE_TTL.MEDIUM);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
