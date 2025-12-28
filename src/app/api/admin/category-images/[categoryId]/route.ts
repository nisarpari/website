// PUT/DELETE /api/admin/category-images/[categoryId] - Update or delete category image
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, checkAdminAuth } from '@/lib/server/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId } = await params;
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const config = readSiteConfig();
    if (!config.categoryImages) {
      config.categoryImages = {};
    }

    config.categoryImages[categoryId] = imageUrl;
    writeSiteConfig(config);

    return NextResponse.json({ success: true, categoryId, imageUrl });
  } catch (error) {
    console.error('Error updating category image:', error);
    return NextResponse.json({ error: 'Failed to update category image' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId } = await params;
    const config = readSiteConfig();

    if (config.categoryImages && config.categoryImages[categoryId]) {
      delete config.categoryImages[categoryId];
      writeSiteConfig(config);
    }

    return NextResponse.json({ success: true, categoryId });
  } catch (error) {
    console.error('Error deleting category image:', error);
    return NextResponse.json({ error: 'Failed to delete category image' }, { status: 500 });
  }
}
