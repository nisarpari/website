// GET /api/categories/public - Fetch eCommerce public categories
import { NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { publicCategoryCache, isCacheValid } from '@/lib/server/cache';

interface OdooPublicCategory {
  id: number;
  name: string;
  parent_id: [number, string] | false;
  child_id: number[];
  sequence: number;
}

interface TransformedCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName: string | null;
  childIds: number[];
  sequence: number;
  count: number;
  totalCount: number;
}

export async function GET() {
  try {
    // Check cache
    if (isCacheValid(publicCategoryCache)) {
      return NextResponse.json(publicCategoryCache.data);
    }

    const categories = await odooApiCall<OdooPublicCategory[]>(
      'product.public.category',
      'search_read',
      [[]],
      {
        fields: ['id', 'name', 'parent_id', 'child_id', 'sequence'],
        order: 'sequence asc, name asc'
      }
    );

    // Count published products per public category
    const categoriesWithCount: TransformedCategory[] = await Promise.all(
      categories.map(async (cat) => {
        const count = await odooApiCall<number>(
          'product.template',
          'search_count',
          [[['public_categ_ids', 'in', [cat.id]], ['is_published', '=', true]]]
        );
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          parentId: cat.parent_id ? cat.parent_id[0] : null,
          parentName: cat.parent_id ? cat.parent_id[1] : null,
          childIds: cat.child_id || [],
          sequence: cat.sequence,
          count: count,
          totalCount: 0
        };
      })
    );

    // Build a map for quick lookup
    const categoryMap: Record<number, TransformedCategory> = {};
    categoriesWithCount.forEach(cat => {
      categoryMap[cat.id] = cat;
    });

    // Calculate total count (including children) for each category
    const calculateTotalCount = (catId: number): number => {
      const cat = categoryMap[catId];
      if (!cat) return 0;
      let total = cat.count;
      if (cat.childIds && cat.childIds.length > 0) {
        cat.childIds.forEach(childId => {
          total += calculateTotalCount(childId);
        });
      }
      return total;
    };

    // Add totalCount to each category
    categoriesWithCount.forEach(cat => {
      cat.totalCount = calculateTotalCount(cat.id);
    });

    // Filter categories that have products (directly or via children)
    const filteredCategories = categoriesWithCount
      .filter(cat => cat.totalCount > 0)
      .sort((a, b) => a.sequence - b.sequence);

    // Update cache
    publicCategoryCache.data = filteredCategories;
    publicCategoryCache.timestamp = Date.now();

    return NextResponse.json(filteredCategories);
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json({ error: 'Failed to fetch public categories' }, { status: 500 });
  }
}
