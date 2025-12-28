// GET /api/track/search - Search for customer records
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

const orderStateMap: Record<string, string> = {
  'draft': 'Quotation',
  'sent': 'Quotation Sent',
  'sale': 'Sales Order',
  'done': 'Completed',
  'cancel': 'Cancelled'
};

const deliveryStateMap: Record<string, string> = {
  'draft': 'Draft',
  'waiting': 'Waiting',
  'confirmed': 'Waiting',
  'assigned': 'Ready',
  'done': 'Delivered',
  'cancel': 'Cancelled'
};

const repairStateMap: Record<string, string> = {
  'draft': 'Draft',
  'confirmed': 'Confirmed',
  'under_repair': 'Under Repair',
  'ready': 'Ready',
  '2binvoiced': 'To be Invoiced',
  'invoice_except': 'Invoice Exception',
  'done': 'Completed',
  'cancel': 'Cancelled'
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide at least 3 characters to search' }, { status: 400 });
    }

    const searchQuery = query.trim();
    const results: {
      orders: Array<{ id: number; reference: string; clientRef: string; status: string; statusKey: string; date: string; total: number; customerName: string; itemCount: number }>;
      deliveries: Array<{ id: number; reference: string; origin: string; status: string; statusKey: string; scheduledDate: string; doneDate: string; customerName: string; itemCount: number }>;
      helpdesk: Array<{ id: number; reference: string; subject: string; status: string; date: string; customerName: string; priority: string }>;
      repairs: Array<{ id: number; reference: string; status: string; statusKey: string; date: string; customerName: string; product: string; total: number }>;
      customer: { name: string; phone?: string; email?: string } | null;
    } = {
      orders: [],
      deliveries: [],
      helpdesk: [],
      repairs: [],
      customer: null
    };

    const isPhoneSearch = /^\+?\d{6,}$/.test(searchQuery.replace(/\s/g, ''));
    let partnerId: number[] | number | null = null;

    if (isPhoneSearch) {
      const phoneClean = searchQuery.replace(/[\s\-\(\)]/g, '');
      const lastDigits = phoneClean.replace(/^\+/, '').slice(-8);
      const phoneWithoutPlus = phoneClean.replace(/^\+/, '');
      const phoneWithoutCode = phoneClean.replace(/^\+?968/, '');

      const partners = await odooApiCall<Array<{ id: number; name: string; phone: string; mobile: string; email: string }>>(
        'res.partner',
        'search_read',
        [['|', '|', '|', '|', '|', '|', '|',
          ['phone', 'ilike', phoneClean],
          ['mobile', 'ilike', phoneClean],
          ['phone', 'ilike', phoneWithoutPlus],
          ['mobile', 'ilike', phoneWithoutPlus],
          ['phone', 'ilike', lastDigits],
          ['mobile', 'ilike', lastDigits],
          ['phone', 'ilike', phoneWithoutCode],
          ['mobile', 'ilike', phoneWithoutCode]
        ]],
        { fields: ['id', 'name', 'phone', 'mobile', 'email'], limit: 10 }
      );

      if (partners && partners.length > 0) {
        const partnerIds = partners.map(p => p.id);
        partnerId = partnerIds;

        const primaryPartner = partners.find(p =>
          p.phone === phoneClean || p.mobile === phoneClean ||
          p.phone === phoneWithoutPlus || p.mobile === phoneWithoutPlus ||
          p.phone === `+${phoneWithoutPlus}` || p.mobile === `+${phoneWithoutPlus}`
        ) || partners[0];

        results.customer = {
          name: primaryPartner.name,
          phone: primaryPartner.phone || primaryPartner.mobile,
          email: primaryPartner.email
        };
      }
    }

    // Search Sale Orders
    let orderDomain: unknown[];
    if (partnerId && Array.isArray(partnerId)) {
      orderDomain = [['partner_id', 'in', partnerId]];
    } else if (partnerId) {
      orderDomain = [['partner_id', '=', partnerId]];
    } else {
      orderDomain = ['|', '|',
        ['name', 'ilike', searchQuery],
        ['client_order_ref', 'ilike', searchQuery],
        ['origin', 'ilike', searchQuery]
      ];
    }

    const orders = await odooApiCall<Array<{ id: number; name: string; state: string; date_order: string; amount_total: number; client_order_ref: string; partner_id: [number, string]; order_line: number[] }>>(
      'sale.order',
      'search_read',
      [orderDomain],
      { fields: ['id', 'name', 'state', 'date_order', 'amount_total', 'client_order_ref', 'partner_id', 'order_line'], order: 'date_order desc', limit: 20 }
    );

    results.orders = (orders || []).map(order => ({
      id: order.id,
      reference: order.name,
      clientRef: order.client_order_ref,
      status: orderStateMap[order.state] || order.state,
      statusKey: order.state,
      date: order.date_order,
      total: order.amount_total,
      customerName: order.partner_id ? order.partner_id[1] : 'Unknown',
      itemCount: order.order_line ? order.order_line.length : 0
    }));

    // Search Delivery Orders
    try {
      let deliveryDomain: unknown[];
      if (partnerId && Array.isArray(partnerId)) {
        deliveryDomain = [['partner_id', 'in', partnerId], ['picking_type_code', '=', 'outgoing']];
      } else if (partnerId) {
        deliveryDomain = [['partner_id', '=', partnerId], ['picking_type_code', '=', 'outgoing']];
      } else {
        deliveryDomain = ['&', ['picking_type_code', '=', 'outgoing'], '|',
          ['name', 'ilike', searchQuery],
          ['origin', 'ilike', searchQuery]
        ];
      }

      const deliveries = await odooApiCall<Array<{ id: number; name: string; state: string; scheduled_date: string; date_done: string; partner_id: [number, string]; origin: string; move_ids_without_package: number[] }>>(
        'stock.picking',
        'search_read',
        [deliveryDomain],
        { fields: ['id', 'name', 'state', 'scheduled_date', 'date_done', 'partner_id', 'origin', 'move_ids_without_package'], order: 'scheduled_date desc', limit: 20 }
      );

      results.deliveries = (deliveries || []).map(delivery => ({
        id: delivery.id,
        reference: delivery.name,
        origin: delivery.origin,
        status: deliveryStateMap[delivery.state] || delivery.state,
        statusKey: delivery.state,
        scheduledDate: delivery.scheduled_date,
        doneDate: delivery.date_done,
        customerName: delivery.partner_id ? delivery.partner_id[1] : 'Unknown',
        itemCount: delivery.move_ids_without_package ? delivery.move_ids_without_package.length : 0
      }));
    } catch {
      console.log('Delivery search error');
    }

    // Search Helpdesk Tickets
    try {
      let ticketDomain: unknown[];
      if (partnerId && Array.isArray(partnerId)) {
        ticketDomain = [['partner_id', 'in', partnerId]];
      } else if (partnerId) {
        ticketDomain = [['partner_id', '=', partnerId]];
      } else {
        ticketDomain = ['|', ['name', 'ilike', searchQuery], ['ticket_ref', 'ilike', searchQuery]];
      }

      const tickets = await odooApiCall<Array<{ id: number; name: string; ticket_ref: string; stage_id: [number, string]; create_date: string; partner_id: [number, string]; priority: string }>>(
        'helpdesk.ticket',
        'search_read',
        [ticketDomain],
        { fields: ['id', 'name', 'ticket_ref', 'stage_id', 'create_date', 'partner_id', 'priority'], order: 'create_date desc', limit: 20 }
      );

      results.helpdesk = (tickets || []).map(ticket => ({
        id: ticket.id,
        reference: ticket.ticket_ref || `#${ticket.id}`,
        subject: ticket.name,
        status: ticket.stage_id ? ticket.stage_id[1] : 'Unknown',
        date: ticket.create_date,
        customerName: ticket.partner_id ? ticket.partner_id[1] : 'Unknown',
        priority: ticket.priority || '0'
      }));
    } catch {
      console.log('Helpdesk module not available');
    }

    // Search Repair Orders
    try {
      let repairDomain: unknown[];
      if (partnerId && Array.isArray(partnerId)) {
        repairDomain = [['partner_id', 'in', partnerId]];
      } else if (partnerId) {
        repairDomain = [['partner_id', '=', partnerId]];
      } else {
        repairDomain = [['name', 'ilike', searchQuery]];
      }

      const repairs = await odooApiCall<Array<{ id: number; name: string; state: string; create_date: string; partner_id: [number, string]; product_id: [number, string]; amount_total: number }>>(
        'repair.order',
        'search_read',
        [repairDomain],
        { fields: ['id', 'name', 'state', 'create_date', 'partner_id', 'product_id', 'amount_total'], order: 'create_date desc', limit: 20 }
      );

      results.repairs = (repairs || []).map(repair => ({
        id: repair.id,
        reference: repair.name,
        status: repairStateMap[repair.state] || repair.state,
        statusKey: repair.state,
        date: repair.create_date,
        customerName: repair.partner_id ? repair.partner_id[1] : 'Unknown',
        product: repair.product_id ? repair.product_id[1] : 'Unknown',
        total: repair.amount_total
      }));
    } catch {
      console.log('Repair module not available');
    }

    if (!results.customer && results.orders.length > 0) {
      results.customer = { name: results.orders[0].customerName };
    }

    const totalResults = results.orders.length + results.deliveries.length + results.helpdesk.length + results.repairs.length;

    return NextResponse.json({
      success: true,
      query: searchQuery,
      searchType: isPhoneSearch ? 'phone' : 'reference',
      totalResults,
      ...results
    });
  } catch (error) {
    console.error('Track search error:', error);
    return NextResponse.json({ error: 'Failed to search records', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
