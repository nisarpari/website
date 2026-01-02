// GET /api/admin/category-images - Get category images config
import { readSiteConfigAsync } from '@/lib/server/config';
import { cachedJsonResponse, HTTP_CACHE_TTL } from '@/lib/server/cache';

export async function GET() {
  try {
    const config = await readSiteConfigAsync();
    // Return with cache headers - category images rarely change
    return cachedJsonResponse(config.categoryImages || {}, HTTP_CACHE_TTL.LONG);
  } catch (error) {
    console.error('Error reading category images:', error);
    return new Response(JSON.stringify({ error: 'Failed to read category images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
