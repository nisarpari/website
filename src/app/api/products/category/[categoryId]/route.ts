// GET /api/products/category/[categoryId] - Fetch products by internal category
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const catId = parseInt(categoryId);

    const products = await odooApiCall<Array<Record<string, unknown>>>(
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
    return NextResponse.json(products.map((p: any) => transformProduct(p)));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
