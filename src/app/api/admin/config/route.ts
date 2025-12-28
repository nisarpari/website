// GET/PUT /api/admin/config - Site configuration
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, checkAdminAuth } from '@/lib/server/config';

export async function GET() {
  try {
    const config = readSiteConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newConfig = await request.json();
    writeSiteConfig(newConfig);
    return NextResponse.json({ success: true, config: newConfig });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
