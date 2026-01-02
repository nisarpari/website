// GET /api/cache-status - Public cache status check (no auth required)
import { getCacheStats } from '@/lib/server/cache';

export async function GET() {
  try {
    const stats = await getCacheStats();

    return new Response(JSON.stringify({
      success: true,
      redisConnected: Object.values(stats).some(v => v === true),
      stats,
      timestamp: new Date().toISOString(),
      message: stats.hasPublicCategories
        ? 'Redis cache is active and has cached data'
        : 'Redis may not be connected or cache is empty'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get cache stats',
      message: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
