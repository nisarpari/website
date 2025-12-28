// GET /api/products/[id] - Fetch single product by ID
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    const products = await odooApiCall<Array<Record<string, unknown>>>(
      'product.template',
      'search_read',
      [[['id', '=', productId]]],
      {
        fields: [
          'id', 'name', 'list_price', 'categ_id',
          'image_1920', 'description_sale', 'default_code',
          'qty_available', 'description', 'website_url'
        ]
      }
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(transformProduct(products[0] as any));
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
