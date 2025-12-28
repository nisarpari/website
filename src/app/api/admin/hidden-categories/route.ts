// GET /api/admin/hidden-categories - Get hidden categories list
import { NextResponse } from 'next/server';
import { readSiteConfig } from '@/lib/server/config';

export async function GET() {
  try {
    const config = readSiteConfig();
    return NextResponse.json(config.hiddenCategories || []);
  } catch (error) {
    console.error('Error reading hidden categories:', error);
    return NextResponse.json({ error: 'Failed to read hidden categories' }, { status: 500 });
  }
}
