// POST /api/quotation/submit - Submit quotation request
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';
import { COUNTRY_NAMES } from '@/lib/server/config';

interface CartItem {
  id: number;
  name?: string;
  quantity: number;
  price: number;
  variantId?: number;
  variantIds?: number[];
}

interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  country?: string;
}

async function findOrCreateCustomer(customerData: CustomerData & { country: string }): Promise<number> {
  const { name, phone, email, country } = customerData;

  // Search for existing customer by phone
  if (phone) {
    const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
    const lastDigits = phoneClean.replace(/^\+/, '').slice(-8);
    const phoneWithoutPlus = phoneClean.replace(/^\+/, '');
    const phoneWithoutCode = phoneClean.replace(/^\+?968/, '');

    const existingCustomers = await odooApiCall<Array<{ id: number; name: string; phone: string; mobile: string; email: string; comment: string }>>(
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
      { fields: ['id', 'name', 'phone', 'mobile', 'email', 'comment'], limit: 5 }
    );

    if (existingCustomers && existingCustomers.length > 0) {
      const bestMatch = existingCustomers.find(c =>
        c.phone === phoneClean || c.mobile === phoneClean ||
        c.phone === phoneWithoutPlus || c.mobile === phoneWithoutPlus ||
        c.phone === `+${phoneWithoutPlus}` || c.mobile === `+${phoneWithoutPlus}`
      ) || existingCustomers[0];

      const customerId = bestMatch.id;
      const countryName = COUNTRY_NAMES[country] || country;

      await odooApiCall('res.partner', 'write', [[customerId], {
        name: name || bestMatch.name,
        email: email || bestMatch.email,
        comment: `Country: ${countryName}`
      }]);

      return customerId;
    }
  } else if (email) {
    const existingCustomers = await odooApiCall<Array<{ id: number; name: string; phone: string; email: string }>>(
      'res.partner',
      'search_read',
      [[['email', '=', email]]],
      { fields: ['id', 'name', 'phone', 'email'], limit: 1 }
    );

    if (existingCustomers && existingCustomers.length > 0) {
      const customerId = existingCustomers[0].id;
      const countryName = COUNTRY_NAMES[country] || country;
      await odooApiCall('res.partner', 'write', [[customerId], {
        name: name || existingCustomers[0].name,
        phone: phone || existingCustomers[0].phone,
        comment: `Country: ${countryName}`
      }]);
      return customerId;
    }
  }

  // Create new customer
  const countryName = COUNTRY_NAMES[country] || country;
  const partnerId = await odooApiCall<number>('res.partner', 'create', [{
    name: name,
    phone: phone || false,
    email: email || false,
    comment: `Country: ${countryName}`,
    customer_rank: 1
  }]);

  return partnerId;
}

async function createQuotation(customerId: number, cartItems: CartItem[], country: string, orderRef: string | null = null) {
  const orderLines: Array<[number, number, { product_id: number; product_uom_qty: number; price_unit: number }]> = [];
  const failedProducts: string[] = [];

  for (const item of cartItems) {
    let productVariantId: number | null = null;

    if (item.variantId) {
      productVariantId = item.variantId;
    } else if (item.variantIds && item.variantIds.length > 0) {
      productVariantId = item.variantIds[0];
    } else {
      try {
        const variants = await odooApiCall<Array<{ id: number }>>(
          'product.product',
          'search_read',
          [[['product_tmpl_id', '=', item.id]]],
          { fields: ['id'], limit: 1 }
        );
        if (variants && variants.length > 0) {
          productVariantId = variants[0].id;
        }
      } catch (err) {
        console.error(`Failed to find variant for product ${item.id}:`, err);
      }
    }

    if (productVariantId) {
      orderLines.push([0, 0, {
        product_id: productVariantId,
        product_uom_qty: item.quantity,
        price_unit: item.price
      }]);
    } else {
      failedProducts.push(item.name || String(item.id));
    }
  }

  if (orderLines.length === 0) {
    throw new Error(`No valid products found in cart. Failed products: ${failedProducts.join(', ')}`);
  }

  const countryName = COUNTRY_NAMES[country] || country;

  // Get default warehouse
  let warehouseId = 1;
  try {
    const warehouses = await odooApiCall<Array<{ id: number; name: string }>>(
      'stock.warehouse',
      'search_read',
      [[]],
      { fields: ['id', 'name'], limit: 1 }
    );
    if (warehouses && warehouses.length > 0) {
      warehouseId = warehouses[0].id;
    }
  } catch {
    console.warn('Could not fetch warehouse');
  }

  const orderData: Record<string, unknown> = {
    partner_id: customerId,
    order_line: orderLines,
    warehouse_id: warehouseId,
    state: 'draft',
    note: `Website Quotation Request\nCountry: ${countryName}`
  };

  if (orderRef) {
    orderData.client_order_ref = orderRef;
  }

  const orderId = await odooApiCall<number>('sale.order', 'create', [orderData]);

  const orderDetails = await odooApiCall<Array<{ name: string; amount_total: number; state: string }>>(
    'sale.order',
    'read',
    [[orderId]],
    { fields: ['name', 'amount_total', 'state'] }
  );

  return { id: orderId, ...orderDetails[0] };
}

export async function POST(request: NextRequest) {
  try {
    const { customer, cart, country } = await request.json();

    if (!customer || !customer.name || !customer.phone) {
      return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
    }

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    const customerWithCountry = { ...customer, country };
    const customerId = await findOrCreateCustomer(customerWithCountry);
    const orderRef = `WEB-${Date.now()}`;
    const quotation = await createQuotation(customerId, cart, country, orderRef);

    return NextResponse.json({
      success: true,
      quotationId: quotation.id,
      quotationName: quotation.name,
      orderRef: orderRef,
      message: 'Your quotation request has been submitted successfully!'
    });
  } catch (error) {
    console.error('Quotation submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit quotation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
