// GET /api/products/popular/bestsellers - Fetch popular/bestselling products
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    // Fetch products sorted by sales count or recent activity
    const products = await odooApiCall<Array<Record<string, unknown>>>(
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
    return NextResponse.json(products.map((p: any) => transformProduct(p)));
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return NextResponse.json({ error: 'Failed to fetch popular products' }, { status: 500 });
  }
}
