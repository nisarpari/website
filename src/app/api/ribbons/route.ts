// GET /api/ribbons - Fetch all product ribbons
import { NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/server/cache';

export async function GET() {
  try {
    const ribbons = await getCachedOrFetch(
      CACHE_KEYS.RIBBONS,
      CACHE_TTL.RIBBONS,
      async () => {
        return await odooApiCall<Array<{
          id: number;
          name: string;
          html: string;
          bg_color: string;
          text_color: string;
        }>>(
          'product.ribbon',
          'search_read',
          [[]],
          { fields: ['id', 'name', 'html', 'bg_color', 'text_color'] }
        );
      }
    );

    return NextResponse.json(ribbons);
  } catch (error) {
    console.error('Error fetching ribbons:', error);
    return NextResponse.json({ error: 'Failed to fetch ribbons' }, { status: 500 });
  }
}
