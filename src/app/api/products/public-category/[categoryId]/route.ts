// GET /api/products/public-category/[categoryId] - Fetch products by public category
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/server/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const catId = parseInt(categoryId);
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    // Use Redis cache for category products
    const cacheKey = `${CACHE_KEYS.PRODUCTS_BY_PUBLIC_CATEGORY}${catId}:${limit}`;

    const products = await getCachedOrFetch(
      cacheKey,
      CACHE_TTL.PRODUCTS_BY_CATEGORY,
      async () => {
        const rawProducts = await odooApiCall<Array<Record<string, unknown>>>(
          'product.template',
          'search_read',
          [[['public_categ_ids', 'in', [catId]], ['is_published', '=', true]]],
          {
            fields: [
              'id', 'name', 'list_price', 'categ_id',
              'description_sale', 'default_code', 'qty_available', 'website_url',
              'public_categ_ids', 'website_ribbon_id',
              'allow_out_of_stock_order', 'show_availability',
              'product_template_image_ids'
            ],
            limit: limit
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawProducts.map((p: any) => transformProduct(p));
      }
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products by public category:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
