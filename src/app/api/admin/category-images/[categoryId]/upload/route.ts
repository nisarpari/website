// POST /api/admin/category-images/[categoryId]/upload - Upload category image (converts to WebP)
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { readSiteConfig, writeSiteConfig, checkAdminAuth } from '@/lib/server/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId } = await params;
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with timestamp - always use .webp extension
    const filename = `category-${categoryId}-${Date.now()}.webp`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'categories');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);

    // Convert to WebP using Sharp
    const originalExt = path.extname(file.name).toLowerCase();
    const isPng = originalExt === '.png';

    // For PNG, preserve transparency; for others, use standard WebP conversion
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85, lossless: isPng })
      .toBuffer();

    await writeFile(filePath, webpBuffer);

    // Build URL (relative to public folder)
    const imageUrl = `/images/categories/${filename}`;

    // Update config
    const config = readSiteConfig();
    if (!config.categoryImages) {
      config.categoryImages = {};
    }
    config.categoryImages[categoryId] = imageUrl;
    writeSiteConfig(config);

    return NextResponse.json({
      success: true,
      categoryId,
      imageUrl,
      filename
    });
  } catch (error) {
    console.error('Category image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload category image' }, { status: 500 });
  }
}
