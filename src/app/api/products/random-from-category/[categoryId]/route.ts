// GET /api/products/random-from-category/[categoryId] - Fetch random products from category
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall, ODOO_CONFIG, getOptimizedImageUrl } from '@/lib/server/odoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const catId = parseInt(categoryId);
    const searchParams = request.nextUrl.searchParams;
    const excludeId = parseInt(searchParams.get('exclude') || '0');
    const limit = parseInt(searchParams.get('limit') || '8');

    // Fetch more products than needed, then shuffle
    const products = await odooApiCall<Array<{ id: number; name: string; list_price: number; website_url: string; qty_available: number; public_categ_ids: number[] }>>(
      'product.template',
      'search_read',
      [[
        ['public_categ_ids', 'in', [catId]],
        ['is_published', '=', true],
        ['qty_available', '>', 0],
        ['id', '!=', excludeId]
      ]],
      {
        fields: [
          'id', 'name', 'list_price', 'website_url',
          'qty_available', 'public_categ_ids'
        ],
        limit: limit * 3,
        order: 'id asc'
      }
    );

    // Shuffle array and take requested limit
    const shuffled = products.sort(() => Math.random() - 0.5).slice(0, limit);

    // Transform to minimal product format
    const result = shuffled.map(p => ({
      id: p.id,
      name: p.name,
      price: p.list_price,
      thumbnail: getOptimizedImageUrl(
        `${ODOO_CONFIG.imageBaseUrl}/web/image/product.template/${p.id}/image_512`,
        { width: 512 }
      ),
      slug: p.website_url ? p.website_url.replace('/shop/', '') : `${p.name.toLowerCase().replace(/\s+/g, '-')}-${p.id}`
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching random products from category:', error);
    return NextResponse.json({ error: 'Failed to fetch random products' }, { status: 500 });
  }
}
