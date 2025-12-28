// POST /api/contact - Submit contact form to Odoo CRM
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    const leadId = await odooApiCall<number>(
      'crm.lead',
      'create',
      [{
        name: `Website Inquiry: ${name}`,
        contact_name: name,
        email_from: email,
        phone: phone,
        description: message,
        type: 'lead'
      }]
    );

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
