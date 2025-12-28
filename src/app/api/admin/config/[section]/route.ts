// PATCH /api/admin/config/[section] - Update specific config section
import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, checkAdminAuth } from '@/lib/server/config';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!checkAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section } = await params;
    const body = await request.json();
    const config = readSiteConfig();

    if (!config[section]) {
      return NextResponse.json({ error: `Section '${section}' not found` }, { status: 400 });
    }

    config[section] = { ...(config[section] as object), ...body };
    writeSiteConfig(config);

    return NextResponse.json({ success: true, section, data: config[section] });
  } catch (error) {
    console.error('Error updating config section:', error);
    return NextResponse.json({ error: 'Failed to update config section' }, { status: 500 });
  }
}
