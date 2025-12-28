// GET /api/track/order/[orderId] - Get detailed order info
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

const orderStateMap: Record<string, string> = {
  'draft': 'Quotation',
  'sent': 'Quotation Sent',
  'sale': 'Sales Order',
  'done': 'Completed',
  'cancel': 'Cancelled'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const id = parseInt(orderId);

    const orders = await odooApiCall<Array<{
      id: number;
      name: string;
      state: string;
      date_order: string;
      amount_total: number;
      amount_untaxed: number;
      amount_tax: number;
      client_order_ref: string;
      partner_id: [number, string];
      order_line: number[];
      note: string;
      commitment_date: string;
    }>>(
      'sale.order',
      'read',
      [[id]],
      { fields: ['id', 'name', 'state', 'date_order', 'amount_total', 'amount_untaxed', 'amount_tax', 'client_order_ref', 'partner_id', 'order_line', 'note', 'commitment_date'] }
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    let lines: Array<{ productName: string; quantity: number; unitPrice: number; subtotal: number }> = [];
    if (order.order_line && order.order_line.length > 0) {
      const rawLines = await odooApiCall<Array<{ product_id: [number, string]; name: string; product_uom_qty: number; price_unit: number; price_subtotal: number }>>(
        'sale.order.line',
        'read',
        [order.order_line],
        { fields: ['product_id', 'name', 'product_uom_qty', 'price_unit', 'price_subtotal'] }
      );
      lines = rawLines.map(line => ({
        productName: line.product_id ? line.product_id[1] : line.name,
        quantity: line.product_uom_qty,
        unitPrice: line.price_unit,
        subtotal: line.price_subtotal
      }));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        reference: order.name,
        clientRef: order.client_order_ref,
        status: orderStateMap[order.state] || order.state,
        statusKey: order.state,
        date: order.date_order,
        expectedDate: order.commitment_date,
        subtotal: order.amount_untaxed,
        tax: order.amount_tax,
        total: order.amount_total,
        customerName: order.partner_id ? order.partner_id[1] : 'Unknown',
        note: order.note,
        lines
      }
    });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
