// GET /api/search - Search products
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');

    // Build domain filters
    const domain: Array<[string, string, unknown]> = [];

    if (q) {
      domain.push(['name', 'ilike', q]);
    }
    if (minPrice) {
      domain.push(['list_price', '>=', parseFloat(minPrice)]);
    }
    if (maxPrice) {
      domain.push(['list_price', '<=', parseFloat(maxPrice)]);
    }
    if (category) {
      domain.push(['categ_id.name', '=', category]);
    }

    // Determine sort order
    let order = 'name asc';
    if (sort === 'price-low') order = 'list_price asc';
    if (sort === 'price-high') order = 'list_price desc';

    const products = await odooApiCall<Array<Record<string, unknown>>>(
      'product.template',
      'search_read',
      [domain],
      {
        fields: [
          'id', 'name', 'list_price', 'categ_id',
          'image_1920', 'description_sale', 'default_code'
        ],
        limit: 100,
        order: order
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(products.map((p: any) => transformProduct(p)));
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
