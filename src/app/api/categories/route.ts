// GET /api/categories - Fetch all internal categories with hierarchy
import { NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/server/cache';

interface OdooCategory {
  id: number;
  name: string;
  parent_id: [number, string] | false;
  child_id: number[];
  complete_name: string;
}

export async function GET() {
  try {
    const categoriesData = await getCachedOrFetch(
      CACHE_KEYS.CATEGORIES,
      CACHE_TTL.CATEGORIES,
      async () => {
        const categories = await odooApiCall<OdooCategory[]>(
          'product.category',
          'search_read',
          [[]],
          {
            fields: ['id', 'name', 'parent_id', 'child_id', 'complete_name']
          }
        );

        // Count published products per category
        const categoriesWithCount = await Promise.all(
          categories.map(async (cat) => {
            const count = await odooApiCall<number>(
              'product.template',
              'search_count',
              [[['categ_id', '=', cat.id], ['is_published', '=', true]]]
            );
            return {
              id: cat.id,
              name: cat.name,
              fullName: cat.complete_name || cat.name,
              slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              parentId: cat.parent_id ? cat.parent_id[0] : null,
              parentName: cat.parent_id ? cat.parent_id[1] : null,
              childIds: cat.child_id || [],
              count: count,
              image: `https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop`
            };
          })
        );

        // Filter out categories with no published products
        return categoriesWithCount.filter(cat => cat.count > 0);
      }
    );

    return NextResponse.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
