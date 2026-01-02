// GET/DELETE /api/admin/cache - Cache management
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/server/config';
import {
  clearAllOdooCache,
  clearProductsCache,
  clearCategoriesCache,
  clearRibbonsCache,
  getCacheStats
} from '@/lib/server/cache';

// GET - Get cache status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getCacheStats();
    return NextResponse.json({
      success: true,
      stats,
      message: 'Cache status retrieved'
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json({ error: 'Failed to get cache stats' }, { status: 500 });
  }
}

// DELETE - Clear cache
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let result: { success: boolean; deletedKeys?: number; message: string };

    switch (type) {
      case 'products':
        const productCount = await clearProductsCache();
        result = { success: true, deletedKeys: productCount, message: 'Products cache cleared' };
        break;

      case 'categories':
        const categoryCount = await clearCategoriesCache();
        result = { success: true, deletedKeys: categoryCount, message: 'Categories cache cleared' };
        break;

      case 'ribbons':
        await clearRibbonsCache();
        result = { success: true, deletedKeys: 1, message: 'Ribbons cache cleared' };
        break;

      case 'all':
      default:
        const allResult = await clearAllOdooCache();
        result = {
          success: allResult.success,
          deletedKeys: allResult.deletedKeys,
          message: allResult.success
            ? `All cache cleared (${allResult.deletedKeys} keys deleted)`
            : 'Failed to clear cache'
        };
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}

// POST - Refresh specific cache (fetches fresh data from Odoo)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();

    // Clear the cache first
    switch (type) {
      case 'products':
        await clearProductsCache();
        break;
      case 'categories':
        await clearCategoriesCache();
        break;
      case 'ribbons':
        await clearRibbonsCache();
        break;
      case 'all':
      default:
        await clearAllOdooCache();
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${type || 'all'}. Fresh data will be fetched on next request.`
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return NextResponse.json({ error: 'Failed to refresh cache' }, { status: 500 });
  }
}
