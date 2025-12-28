// POST /api/admin/category-images/[categoryId]/upload - Upload category image
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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

    // Create filename with timestamp
    const ext = path.extname(file.name) || '.jpg';
    const filename = `category-${categoryId}-${Date.now()}${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'categories');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

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
