// GET /api/products - Fetch all products
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall, ODOO_CONFIG } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';
import { productCache, isCacheValid } from '@/lib/server/cache';

export async function GET(request: NextRequest) {
  try {
    // Check cache
    if (isCacheValid(productCache)) {
      return NextResponse.json(productCache.data);
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');

    const products = await odooApiCall<Array<Record<string, unknown>>>(
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
    const transformedProducts = products.map((p: any) => transformProduct(p));

    // Only cache if fetching all products (no offset)
    if (offset === 0 && limit >= 500) {
      productCache.data = transformedProducts;
      productCache.timestamp = Date.now();
    }

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
        odooUrl: ODOO_CONFIG.baseUrl
      },
      { status: 500 }
    );
  }
}
