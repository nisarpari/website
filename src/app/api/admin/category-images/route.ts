// GET /api/admin/category-images - Get category images config
import { NextResponse } from 'next/server';
import { readSiteConfig } from '@/lib/server/config';

export async function GET() {
  try {
    const config = readSiteConfig();
    return NextResponse.json(config.categoryImages || {});
  } catch (error) {
    console.error('Error reading category images:', error);
    return NextResponse.json({ error: 'Failed to read category images' }, { status: 500 });
  }
}
