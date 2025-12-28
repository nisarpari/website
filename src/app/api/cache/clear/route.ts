// POST /api/cache/clear - Clear all caches
import { NextResponse } from 'next/server';
import { clearAllCaches } from '@/lib/server/cache';

export async function POST() {
  clearAllCaches();
  return NextResponse.json({ success: true, message: 'Cache cleared' });
}
