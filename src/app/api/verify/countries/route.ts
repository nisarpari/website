// GET /api/verify/countries - Get list of GCC countries
import { NextResponse } from 'next/server';
import { GCC_COUNTRIES } from '@/lib/server/config';

export async function GET() {
  return NextResponse.json({
    success: true,
    countries: Object.entries(GCC_COUNTRIES).map(([countryCode, data]) => ({
      code: countryCode,
      name: data.name,
      dialCode: data.code,
      flag: data.flag
    }))
  });
}
