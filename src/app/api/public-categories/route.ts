// GET /api/public-categories - Redirect to /api/categories/public for backwards compatibility
import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch from the new endpoint
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/categories/public`, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json({ error: 'Failed to fetch public categories' }, { status: 500 });
  }
}
