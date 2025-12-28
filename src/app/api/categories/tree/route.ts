// GET /api/categories/tree - Get category hierarchy as tree structure
import { NextResponse } from 'next/server';
import { categoryCache, isCacheValid } from '@/lib/server/cache';

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  childIds: number[];
  [key: string]: unknown;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export async function GET() {
  try {
    let categories: Category[];

    // Use cache if available, otherwise fetch fresh
    if (isCacheValid(categoryCache)) {
      categories = categoryCache.data as Category[];
    } else {
      // Fetch from categories endpoint
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/categories`, { cache: 'no-store' });
      categories = await response.json();
    }

    // Build tree structure
    const rootCategories = categories.filter(cat => cat.parentId === null);

    const buildTree = (parent: Category): CategoryWithChildren => {
      const children = categories.filter(cat => cat.parentId === parent.id);
      return {
        ...parent,
        children: children.map(buildTree)
      };
    };

    const tree = rootCategories.map(buildTree);
    return NextResponse.json(tree);
  } catch (error) {
    console.error('Error building category tree:', error);
    return NextResponse.json({ error: 'Failed to build category tree' }, { status: 500 });
  }
}
