// GET /api/admin/hero-images - Get hero images
import { NextResponse } from 'next/server';
import { readSiteConfig, DEFAULT_HERO_IMAGES } from '@/lib/server/config';

export async function GET() {
  try {
    const config = readSiteConfig();
    return NextResponse.json(config.heroImages || DEFAULT_HERO_IMAGES);
  } catch (error) {
    console.error('Error reading hero images:', error);
    return NextResponse.json({ error: 'Failed to read hero images' }, { status: 500 });
  }
}
