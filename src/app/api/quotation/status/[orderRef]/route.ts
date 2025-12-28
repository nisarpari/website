// GET /api/quotation/status/[orderRef] - Get quotation status
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  try {
    const { orderRef } = await params;

    const orders = await odooApiCall<Array<{ id: number; name: string; state: string; amount_total: number; date_order: string }>>(
      'sale.order',
      'search_read',
      [[['client_order_ref', '=', orderRef]]],
      { fields: ['id', 'name', 'state', 'amount_total', 'date_order'], limit: 1 }
    );

    if (orders && orders.length > 0) {
      return NextResponse.json({ success: true, quotation: orders[0] });
    } else {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Quotation status error:', error);
    return NextResponse.json({ error: 'Failed to get quotation status' }, { status: 500 });
  }
}
