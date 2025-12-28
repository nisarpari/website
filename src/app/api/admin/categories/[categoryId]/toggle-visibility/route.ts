// POST /api/admin/categories/[categoryId]/toggle-visibility - Toggle category visibility
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

    if (!config.hiddenCategories) {
      config.hiddenCategories = [];
    }

    const index = config.hiddenCategories.indexOf(categoryId);
    let isHidden: boolean;

    if (index === -1) {
      config.hiddenCategories.push(categoryId);
      isHidden = true;
    } else {
      config.hiddenCategories.splice(index, 1);
      isHidden = false;
    }

    writeSiteConfig(config);

    return NextResponse.json({ success: true, categoryId, isHidden });
  } catch (error) {
    console.error('Error toggling category visibility:', error);
    return NextResponse.json({ error: 'Failed to toggle category visibility' }, { status: 500 });
  }
}
