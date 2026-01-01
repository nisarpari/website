// GET/PUT/DELETE /api/admin/category-content/[categoryId] - Single category landing page content
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, checkAdminAuth, CategoryLandingContent } from '@/lib/server/config';

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

// GET - Fetch content for a specific category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { categoryId } = await params;
    const config = readSiteConfig();
    const categoryContent = config.categoryLandingContent as Record<string, CategoryLandingContent> | undefined;
    const content = categoryContent?.[categoryId] || null;
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error reading category content:', error);
    return NextResponse.json({ error: 'Failed to read category content' }, { status: 500 });
  }
}

// PUT - Update content for a specific category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId } = await params;
    const content = await request.json();

    const config = readSiteConfig();
    if (!config.categoryLandingContent) {
      config.categoryLandingContent = {} as Record<string, CategoryLandingContent>;
    }

    (config.categoryLandingContent as Record<string, CategoryLandingContent>)[categoryId] = content;
    writeSiteConfig(config);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error updating category content:', error);
    return NextResponse.json({ error: 'Failed to update category content' }, { status: 500 });
  }
}

// DELETE - Remove content for a specific category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId } = await params;

    const config = readSiteConfig();
    const categoryContent = config.categoryLandingContent as Record<string, CategoryLandingContent> | undefined;
    if (categoryContent?.[categoryId]) {
      delete categoryContent[categoryId];
      writeSiteConfig(config);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category content:', error);
    return NextResponse.json({ error: 'Failed to delete category content' }, { status: 500 });
  }
}
