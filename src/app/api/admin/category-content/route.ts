// GET/POST /api/admin/category-content - Category landing page content management
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, checkAdminAuth } from '@/lib/server/config';

export interface CategoryFeature {
  icon: string; // SVG path
  title: string;
  description: string;
}

export interface CategoryLandingContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  description?: string;
  features?: CategoryFeature[];
  productSectionTitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

// GET - Fetch all category landing content
export async function GET() {
  try {
    const config = readSiteConfig();
    return NextResponse.json(config.categoryLandingContent || {});
  } catch (error) {
    console.error('Error reading category content:', error);
    return NextResponse.json({ error: 'Failed to read category content' }, { status: 500 });
  }
}

// POST - Update category landing content (bulk update)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId, content } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const config = readSiteConfig();
    if (!config.categoryLandingContent) {
      config.categoryLandingContent = {};
    }

    config.categoryLandingContent[categoryId] = content;
    writeSiteConfig(config);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error updating category content:', error);
    return NextResponse.json({ error: 'Failed to update category content' }, { status: 500 });
  }
}
