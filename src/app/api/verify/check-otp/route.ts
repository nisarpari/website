// POST /api/verify/check-otp - Verify OTP
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { GCC_COUNTRIES, otpStore } from '@/lib/server/config';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const stored = otpStore.get(phone);

    if (!stored) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (stored.attempts >= 3) {
      otpStore.delete(phone);
      return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      stored.attempts++;
      return NextResponse.json({
        error: 'Invalid OTP. Please try again.',
        attemptsRemaining: 3 - stored.attempts
      }, { status: 400 });
    }

    const countryCode = stored.countryCode;
    otpStore.delete(phone);

    // Find or create customer and mark as verified
    try {
      const existingCustomers = await odooApiCall<Array<{ id: number; name: string; comment: string }>>(
        'res.partner',
        'search_read',
        [[['phone', '=', phone]]],
        { fields: ['id', 'name', 'comment'], limit: 1 }
      );

      if (existingCustomers && existingCustomers.length > 0) {
        const customerId = existingCustomers[0].id;
        const existingComment = existingCustomers[0].comment || '';
        const newComment = existingComment.includes('VERIFIED')
          ? existingComment
          : `${existingComment}\n[VERIFIED] Phone verified on ${new Date().toISOString()}`;

        await odooApiCall('res.partner', 'write', [[customerId], {
          comment: newComment.trim()
        }]);
      } else {
        await odooApiCall('res.partner', 'create', [{
          name: `Verified User (${phone})`,
          phone: phone,
          comment: `Country: ${GCC_COUNTRIES[countryCode].name}\n[VERIFIED] Phone verified on ${new Date().toISOString()}`,
          customer_rank: 1
        }]);
      }
    } catch (odooError) {
      console.error('Odoo verification update error:', odooError);
    }

    const verificationToken = Buffer.from(`${phone}:${Date.now()}:verified`).toString('base64');

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Phone number verified successfully!',
      phone: phone,
      countryCode: countryCode,
      token: verificationToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
