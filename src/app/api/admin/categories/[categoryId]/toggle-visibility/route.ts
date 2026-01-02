// POST /api/admin/categories/[categoryId]/toggle-visibility - Toggle category visibility for homepage
import { NextRequest, NextResponse } from 'next/server';
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
    const config = readSiteConfig();

    if (!config.visibleCategories) {
      config.visibleCategories = [];
    }

    const index = config.visibleCategories.indexOf(categoryId);
    let isVisible: boolean;

    if (index === -1) {
      // Add to visible list (show on homepage)
      config.visibleCategories.push(categoryId);
      isVisible = true;
    } else {
      // Remove from visible list (hide from homepage)
      config.visibleCategories.splice(index, 1);
      isVisible = false;
    }

    writeSiteConfig(config);

    return NextResponse.json({ success: true, categoryId, isVisible });
  } catch (error) {
    console.error('Error toggling category visibility:', error);
    return NextResponse.json({ error: 'Failed to toggle category visibility' }, { status: 500 });
  }
}
