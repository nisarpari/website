const express = require('express');
const router = express.Router();
const { odooApiCall } = require('../utils/odoo');
const { COUNTRY_NAMES } = require('../config');

// Create or find customer in Odoo
async function findOrCreateCustomer(customerData) {
    const { name, phone, email, country } = customerData;

    // Search for existing customer by phone (flexible matching like track search)
    if (phone) {
        const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
        const lastDigits = phoneClean.replace(/^\+/, '').slice(-8);
        const phoneWithoutPlus = phoneClean.replace(/^\+/, '');
        const phoneWithoutCode = phoneClean.replace(/^\+?968/, '');

        const existingCustomers = await odooApiCall('res.partner', 'search_read', [
            ['|', '|', '|', '|', '|', '|', '|',
                ['phone', 'ilike', phoneClean],
                ['mobile', 'ilike', phoneClean],
                ['phone', 'ilike', phoneWithoutPlus],
                ['mobile', 'ilike', phoneWithoutPlus],
                ['phone', 'ilike', lastDigits],
                ['mobile', 'ilike', lastDigits],
                ['phone', 'ilike', phoneWithoutCode],
                ['mobile', 'ilike', phoneWithoutCode]
            ]
        ], {
            fields: ['id', 'name', 'phone', 'mobile', 'email', 'comment'],
            limit: 5
        });

        if (existingCustomers && existingCustomers.length > 0) {
            // Find best match (prefer exact match)
            let bestMatch = existingCustomers.find(c =>
                c.phone === phoneClean || c.mobile === phoneClean ||
                c.phone === phoneWithoutPlus || c.mobile === phoneWithoutPlus ||
                c.phone === `+${phoneWithoutPlus}` || c.mobile === `+${phoneWithoutPlus}`
            ) || existingCustomers[0];

            const customerId = bestMatch.id;
            const countryName = COUNTRY_NAMES[country] || country;

            // Update customer info
            await odooApiCall('res.partner', 'write', [[customerId], {
                name: name || bestMatch.name,
                email: email || bestMatch.email,
                comment: `Country: ${countryName}`
            }]);

            console.log(`Found existing customer: ${bestMatch.name} (ID: ${customerId})`);
            return customerId;
        }
    } else if (email) {
        const existingCustomers = await odooApiCall('res.partner', 'search_read', [
            [['email', '=', email]]
        ], {
            fields: ['id', 'name', 'phone', 'email', 'comment'],
            limit: 1
        });

        if (existingCustomers && existingCustomers.length > 0) {
            const customerId = existingCustomers[0].id;
            const countryName = COUNTRY_NAMES[country] || country;
            await odooApiCall('res.partner', 'write', [[customerId], {
                name: name || existingCustomers[0].name,
                phone: phone || existingCustomers[0].phone,
                email: email || existingCustomers[0].email,
                comment: `Country: ${countryName}`
            }]);
            return customerId;
        }
    }

    // Create new customer
    const countryName = COUNTRY_NAMES[country] || country;
    const partnerId = await odooApiCall('res.partner', 'create', [{
        name: name,
        phone: phone || false,
        email: email || false,
        comment: `Country: ${countryName}`,
        customer_rank: 1
    }]);

    console.log(`Created new customer: ${name} (ID: ${partnerId})`);
    return partnerId;
}

// Create quotation (draft sale order) in Odoo
async function createQuotation(customerId, cartItems, country, orderRef = null) {
    const orderLines = [];
    const failedProducts = [];

    for (const item of cartItems) {
        let productVariantId = null;

        if (item.variantId) {
            productVariantId = item.variantId;
        } else if (item.variantIds && item.variantIds.length > 0) {
            productVariantId = item.variantIds[0];
        } else {
            try {
                const variants = await odooApiCall('product.product', 'search_read',
                    [[['product_tmpl_id', '=', item.id]]],
                    { fields: ['id'], limit: 1 }
                );
                if (variants && variants.length > 0) {
                    productVariantId = variants[0].id;
                }
            } catch (err) {
                console.error(`Failed to find variant for product ${item.id}:`, err.message);
            }
        }

        if (productVariantId) {
            orderLines.push([0, 0, {
                product_id: productVariantId,
                product_uom_qty: item.quantity,
                price_unit: item.price
            }]);
        } else {
            failedProducts.push(item.name || item.id);
        }
    }

    if (orderLines.length === 0) {
        throw new Error(`No valid products found in cart. Failed products: ${failedProducts.join(', ')}`);
    }

    if (failedProducts.length > 0) {
        console.warn(`Some products failed to resolve: ${failedProducts.join(', ')}`);
    }

    const countryName = COUNTRY_NAMES[country] || country;

    // Get default warehouse
    let warehouseId = null;
    try {
        const warehouses = await odooApiCall('stock.warehouse', 'search_read',
            [[]],
            { fields: ['id', 'name'], limit: 1 }
        );
        if (warehouses && warehouses.length > 0) {
            warehouseId = warehouses[0].id;
        }
    } catch (err) {
        console.warn('Could not fetch warehouse:', err.message);
    }

    if (!warehouseId) {
        warehouseId = 1;
    }

    const orderData = {
        partner_id: customerId,
        order_line: orderLines,
        warehouse_id: warehouseId,
        state: 'draft',
        note: `Website Quotation Request\nCountry: ${countryName}`
    };

    if (orderRef) {
        orderData.client_order_ref = orderRef;
    }

    const orderId = await odooApiCall('sale.order', 'create', [orderData]);

    const orderDetails = await odooApiCall('sale.order', 'read', [[orderId]], {
        fields: ['name', 'amount_total', 'state']
    });

    return { id: orderId, ...orderDetails[0] };
}

// Submit quotation
router.post('/submit', async (req, res) => {
    try {
        const { customer, cart, country } = req.body;

        if (!customer || !customer.name || !customer.phone) {
            return res.status(400).json({
                error: 'Customer name and phone are required'
            });
        }

        if (!cart || cart.length === 0) {
            return res.status(400).json({
                error: 'Cart cannot be empty'
            });
        }

        if (!country) {
            return res.status(400).json({
                error: 'Country is required'
            });
        }

        const customerWithCountry = { ...customer, country };
        const customerId = await findOrCreateCustomer(customerWithCountry);
        const orderRef = `WEB-${Date.now()}`;
        const quotation = await createQuotation(customerId, cart, country, orderRef);

        console.log(`Quotation created: ${quotation.name} for ${customer.name} (${country})`);

        res.json({
            success: true,
            quotationId: quotation.id,
            quotationName: quotation.name,
            orderRef: orderRef,
            message: 'Your quotation request has been submitted successfully!'
        });

    } catch (error) {
        console.error('Quotation submission error:', error.message);
        res.status(500).json({
            error: 'Failed to submit quotation',
            details: error.message
        });
    }
});

// Get quotation status
router.get('/status/:orderRef', async (req, res) => {
    try {
        const { orderRef } = req.params;

        const orders = await odooApiCall('sale.order', 'search_read', [
            [['client_order_ref', '=', orderRef]]
        ], {
            fields: ['id', 'name', 'state', 'amount_total', 'date_order'],
            limit: 1
        });

        if (orders && orders.length > 0) {
            res.json({
                success: true,
                quotation: orders[0]
            });
        } else {
            res.status(404).json({ error: 'Quotation not found' });
        }

    } catch (error) {
        console.error('Quotation status error:', error.message);
        res.status(500).json({ error: 'Failed to get quotation status' });
    }
});

module.exports = router;
