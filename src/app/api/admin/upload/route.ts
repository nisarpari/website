// POST /api/admin/upload - Upload generic image (converts to WebP)
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { checkAdminAuth } from '@/lib/server/config';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with timestamp - always use .webp extension
    const filename = `upload-${Date.now()}.webp`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', folder);
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
    const imagePath = `/images/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      path: imagePath,
      url: imagePath,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
