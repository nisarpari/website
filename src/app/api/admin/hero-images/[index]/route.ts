// PUT /api/admin/hero-images/[index] - Update hero image
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, checkAdminAuth, DEFAULT_HERO_IMAGES } from '@/lib/server/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { index: indexStr } = await params;
    const index = parseInt(indexStr);
    const { url, alt } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const config = readSiteConfig();
    if (!config.heroImages) {
      config.heroImages = [...DEFAULT_HERO_IMAGES];
    }

    // Ensure the index exists
    while (config.heroImages.length <= index) {
      config.heroImages.push({ url: '', alt: '' });
    }

    config.heroImages[index] = {
      url,
      alt: alt || config.heroImages[index]?.alt || `Hero Image ${index + 1}`
    };

    writeSiteConfig(config);

    return NextResponse.json({ success: true, index, url });
  } catch (error) {
    console.error('Error updating hero image:', error);
    return NextResponse.json({ error: 'Failed to update hero image' }, { status: 500 });
  }
}
