// POST /api/verify/send-otp - Send OTP to phone number
import { NextRequest, NextResponse } from 'next/server';
import { GCC_COUNTRIES, otpStore } from '@/lib/server/config';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode } = await request.json();

    if (!GCC_COUNTRIES[countryCode]) {
      return NextResponse.json({ error: 'Verification is only available for GCC countries' }, { status: 400 });
    }

    if (!phone || phone.length < 8) {
      return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
    }

    const countryDialCode = GCC_COUNTRIES[countryCode].code;
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = `${countryDialCode}${cleanPhone}`;

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    otpStore.set(fullPhone, {
      otp,
      expiresAt,
      countryCode,
      attempts: 0
    });

    // TODO: Integrate with WhatsApp Business API
    console.log(`OTP for ${fullPhone}: ${otp}`);

    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${GCC_COUNTRIES[countryCode].code} ${phone}`,
      phone: fullPhone,
      ...(isDev && { devOtp: otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
