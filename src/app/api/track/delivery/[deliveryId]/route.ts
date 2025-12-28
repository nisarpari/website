// GET /api/track/delivery/[deliveryId] - Get detailed delivery info
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

const deliveryStateMap: Record<string, string> = {
  'draft': 'Draft',
  'waiting': 'Waiting',
  'confirmed': 'Waiting',
  'assigned': 'Ready',
  'done': 'Delivered',
  'cancel': 'Cancelled'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params;
    const id = parseInt(deliveryId);

    const deliveries = await odooApiCall<Array<{
      id: number;
      name: string;
      state: string;
      scheduled_date: string;
      date_done: string;
      partner_id: [number, string];
      origin: string;
      move_ids_without_package: number[];
    }>>(
      'stock.picking',
      'read',
      [[id]],
      { fields: ['id', 'name', 'state', 'scheduled_date', 'date_done', 'partner_id', 'origin', 'move_ids_without_package'] }
    );

    if (!deliveries || deliveries.length === 0) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    const delivery = deliveries[0];

    let lines: Array<{ productName: string; quantity: number; quantityDone: number; uom: string }> = [];
    if (delivery.move_ids_without_package && delivery.move_ids_without_package.length > 0) {
      const rawLines = await odooApiCall<Array<{ product_id: [number, string]; name: string; product_uom_qty: number; quantity_done: number; product_uom: [number, string] }>>(
        'stock.move',
        'read',
        [delivery.move_ids_without_package],
        { fields: ['product_id', 'name', 'product_uom_qty', 'quantity_done', 'product_uom'] }
      );
      lines = rawLines.map(line => ({
        productName: line.product_id ? line.product_id[1] : line.name,
        quantity: line.product_uom_qty,
        quantityDone: line.quantity_done,
        uom: line.product_uom ? line.product_uom[1] : 'Units'
      }));
    }

    return NextResponse.json({
      success: true,
      delivery: {
        id: delivery.id,
        reference: delivery.name,
        origin: delivery.origin,
        status: deliveryStateMap[delivery.state] || delivery.state,
        statusKey: delivery.state,
        scheduledDate: delivery.scheduled_date,
        doneDate: delivery.date_done,
        customerName: delivery.partner_id ? delivery.partner_id[1] : 'Unknown',
        lines
      }
    });
  } catch (error) {
    console.error('Delivery detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery details' }, { status: 500 });
  }
}
