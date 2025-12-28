// GET /api/ribbons - Fetch all product ribbons
import { NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { ribbonCache, isCacheValid } from '@/lib/server/cache';

export async function GET() {
  try {
    if (isCacheValid(ribbonCache)) {
      return NextResponse.json(ribbonCache.data);
    }

    const ribbons = await odooApiCall<Array<{
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

    ribbonCache.data = ribbons;
    ribbonCache.timestamp = Date.now();

    return NextResponse.json(ribbons);
  } catch (error) {
    console.error('Error fetching ribbons:', error);
    return NextResponse.json({ error: 'Failed to fetch ribbons' }, { status: 500 });
  }
}
