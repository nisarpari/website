// GET /api/search - Search products
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { transformProduct } from '@/lib/server/transform';

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: unknown[]; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache for search results

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');

    // Create cache key
    const cacheKey = `${q}-${minPrice}-${maxPrice}-${category}-${sort}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Build domain filters - ALWAYS filter by is_published
    const domain: Array<string | [string, string, unknown]> = [
      ['is_published', '=', true]
    ];

    if (q) {
      // Search in name OR default_code (SKU)
      domain.push('|');
      domain.push(['name', 'ilike', q]);
      domain.push(['default_code', 'ilike', q]);
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
        // Don't fetch image_1920 - it's huge! Use thumbnail URL instead
        fields: [
          'id', 'name', 'list_price', 'categ_id',
          'description_sale', 'default_code', 'website_url',
          'public_categ_ids', 'qty_available'
        ],
        limit: 50, // Limit results for faster response
        order: order
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = products.map((p: any) => transformProduct(p));

    // Cache the results
    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

    // Clean old cache entries (keep cache size manageable)
    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value;
      if (oldestKey) searchCache.delete(oldestKey);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
