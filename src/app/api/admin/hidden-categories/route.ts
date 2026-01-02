// GET/PUT /api/admin/hidden-categories - Manage visible categories list and grid settings
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfigAsync, writeSiteConfigAsync, checkAdminAuth } from '@/lib/server/config';

export async function GET() {
  try {
    const config = await readSiteConfigAsync();
    return NextResponse.json({
      visibleCategories: config.visibleCategories || [],
      categoryGridCount: config.categoryGridCount || 6
    });
  } catch (error) {
    console.error('Error reading visible categories:', error);
    return NextResponse.json({ error: 'Failed to read visible categories' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { visibleCategories, categoryGridCount } = await request.json();

    const config = await readSiteConfigAsync();

    if (visibleCategories !== undefined) {
      if (!Array.isArray(visibleCategories)) {
        return NextResponse.json({ error: 'visibleCategories must be an array' }, { status: 400 });
      }
      config.visibleCategories = visibleCategories;
    }

    if (categoryGridCount !== undefined) {
      if (categoryGridCount !== 6 && categoryGridCount !== 8) {
        return NextResponse.json({ error: 'categoryGridCount must be 6 or 8' }, { status: 400 });
      }
      config.categoryGridCount = categoryGridCount;
    }

    await writeSiteConfigAsync(config);

    return NextResponse.json({
      success: true,
      visibleCategories: config.visibleCategories,
      categoryGridCount: config.categoryGridCount
    });
  } catch (error) {
    console.error('Error updating visible categories:', error);
    return NextResponse.json({ error: 'Failed to update visible categories' }, { status: 500 });
  }
}
