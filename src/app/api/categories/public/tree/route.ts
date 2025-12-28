// GET /api/categories/public/tree - Get public categories as tree structure
import { NextResponse } from 'next/server';
import { publicCategoryCache, isCacheValid } from '@/lib/server/cache';

interface PublicCategory {
  id: number;
  name: string;
  parentId: number | null;
  childIds: number[];
  sequence: number;
  [key: string]: unknown;
}

interface CategoryWithChildren extends PublicCategory {
  children: CategoryWithChildren[];
}

export async function GET() {
  try {
    let categories: PublicCategory[];

    // Use cache if available, otherwise fetch fresh
    if (isCacheValid(publicCategoryCache)) {
      categories = publicCategoryCache.data as PublicCategory[];
    } else {
      // Fetch from public categories endpoint
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/categories/public`, { cache: 'no-store' });
      categories = await response.json();
    }

    // Build tree structure
    const rootCategories = categories.filter(cat => cat.parentId === null);

    const buildTree = (parent: PublicCategory): CategoryWithChildren => {
      const children = categories.filter(cat => cat.parentId === parent.id);
      return {
        ...parent,
        children: children.map(buildTree).sort((a, b) => a.sequence - b.sequence)
      };
    };

    const tree = rootCategories.map(buildTree).sort((a, b) => a.sequence - b.sequence);
    return NextResponse.json(tree);
  } catch (error) {
    console.error('Error building public category tree:', error);
    return NextResponse.json({ error: 'Failed to build public category tree' }, { status: 500 });
  }
}
