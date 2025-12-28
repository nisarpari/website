// POST /api/admin/upload - Upload generic image
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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

    // Create filename with timestamp
    const ext = path.extname(file.name) || '.jpg';
    const filename = `upload-${Date.now()}${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

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
