// GET /api/verify/status - Check if phone is verified
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const customers = await odooApiCall<Array<{ id: number; name: string; comment: string }>>(
      'res.partner',
      'search_read',
      [[['phone', '=', phone]]],
      { fields: ['id', 'name', 'comment'], limit: 1 }
    );

    if (customers && customers.length > 0) {
      const comment = customers[0].comment || '';
      const isVerified = comment.includes('[VERIFIED]');

      return NextResponse.json({
        success: true,
        verified: isVerified,
        phone: phone
      });
    } else {
      return NextResponse.json({
        success: true,
        verified: false,
        phone: phone
      });
    }
  } catch (error) {
    console.error('Check verification status error:', error);
    return NextResponse.json({ error: 'Failed to check verification status' }, { status: 500 });
  }
}
