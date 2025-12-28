// POST /api/admin/login - Admin login
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD } from '@/lib/server/config';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: ADMIN_PASSWORD });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
