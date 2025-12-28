// POST /api/admin/hero-images/[index]/upload - Upload hero image
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { readSiteConfig, writeSiteConfig, checkAdminAuth, DEFAULT_HERO_IMAGES } from '@/lib/server/config';

export async function POST(
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
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with timestamp
    const ext = path.extname(file.name) || '.jpg';
    const filename = `hero-${index}-${Date.now()}${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'hero');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Build URL (relative to public folder)
    const imageUrl = `/images/hero/${filename}`;

    // Update config
    const config = readSiteConfig();
    if (!config.heroImages) {
      config.heroImages = [...DEFAULT_HERO_IMAGES];
    }

    while (config.heroImages.length <= index) {
      config.heroImages.push({ url: '', alt: '', variants: {} });
    }

    config.heroImages[index] = {
      url: imageUrl,
      alt: config.heroImages[index]?.alt || `Hero Image ${index + 1}`,
      variants: {}
    };

    writeSiteConfig(config);

    return NextResponse.json({
      success: true,
      index,
      url: imageUrl,
      filename
    });
  } catch (error) {
    console.error('Hero image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload hero image' }, { status: 500 });
  }
}
