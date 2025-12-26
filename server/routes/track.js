const express = require('express');
const router = express.Router();
const { odooApiCall } = require('../utils/odoo');

// Search for customer records by phone or reference number
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length < 3) {
            return res.status(400).json({
                error: 'Please provide at least 3 characters to search'
            });
        }

        const searchQuery = query.trim();
        const results = {
            orders: [],
            deliveries: [],
            helpdesk: [],
            repairs: [],
            customer: null
        };

        const isPhoneSearch = /^\+?\d{6,}$/.test(searchQuery.replace(/\s/g, ''));
        let partnerId = null;

        if (isPhoneSearch) {
            let phoneClean = searchQuery.replace(/[\s\-\(\)]/g, '');
            const lastDigits = phoneClean.replace(/^\+/, '').slice(-8);
            const phoneWithoutPlus = phoneClean.replace(/^\+/, '');
            const phoneWithoutCode = phoneClean.replace(/^\+?968/, '');

            console.log('Phone search variants:', { phoneClean, lastDigits, phoneWithoutPlus, phoneWithoutCode });

            const partners = await odooApiCall('res.partner', 'search_read', [
                ['|', '|', '|', '|', '|', '|', '|', '|', '|',
                    ['phone', 'ilike', phoneClean],
                    ['mobile', 'ilike', phoneClean],
                    ['phone', 'ilike', phoneWithoutPlus],
                    ['mobile', 'ilike', phoneWithoutPlus],
                    ['phone', 'ilike', lastDigits],
                    ['mobile', 'ilike', lastDigits],
                    ['phone', 'ilike', phoneWithoutCode],
                    ['mobile', 'ilike', phoneWithoutCode],
                    ['name', 'ilike', lastDigits],
                    ['name', 'ilike', phoneWithoutCode]
                ]
            ], {
                fields: ['id', 'name', 'phone', 'mobile', 'email'],
                limit: 5
            });

            console.log('Partners found:', partners?.length || 0);

            if (partners && partners.length > 0) {
                partnerId = partners[0].id;
                results.customer = {
                    name: partners[0].name,
                    phone: partners[0].phone || partners[0].mobile,
                    email: partners[0].email
                };
            }
        }

        // Search Sale Orders
        let orderDomain = [];
        if (partnerId) {
            orderDomain = [['partner_id', '=', partnerId]];
        } else {
            orderDomain = ['|', '|',
                ['name', 'ilike', searchQuery],
                ['client_order_ref', 'ilike', searchQuery],
                ['origin', 'ilike', searchQuery]
            ];
        }

        const orders = await odooApiCall('sale.order', 'search_read', [orderDomain], {
            fields: ['id', 'name', 'state', 'date_order', 'amount_total', 'client_order_ref', 'partner_id', 'order_line'],
            order: 'date_order desc',
            limit: 20
        });

        const orderStateMap = {
            'draft': 'Quotation',
            'sent': 'Quotation Sent',
            'sale': 'Sales Order',
            'done': 'Completed',
            'cancel': 'Cancelled'
        };

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
            let deliveryDomain = [];
            if (partnerId) {
                deliveryDomain = [['partner_id', '=', partnerId], ['picking_type_code', '=', 'outgoing']];
            } else {
                deliveryDomain = ['&', ['picking_type_code', '=', 'outgoing'], '|',
                    ['name', 'ilike', searchQuery],
                    ['origin', 'ilike', searchQuery]
                ];
            }

            const deliveries = await odooApiCall('stock.picking', 'search_read', [deliveryDomain], {
                fields: ['id', 'name', 'state', 'scheduled_date', 'date_done', 'partner_id', 'origin', 'move_ids_without_package'],
                order: 'scheduled_date desc',
                limit: 20
            });

            const deliveryStateMap = {
                'draft': 'Draft',
                'waiting': 'Waiting',
                'confirmed': 'Waiting',
                'assigned': 'Ready',
                'done': 'Delivered',
                'cancel': 'Cancelled'
            };

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
        } catch (err) {
            console.log('Delivery search error:', err.message);
        }

        // Search Helpdesk Tickets
        try {
            let ticketDomain = [];
            if (partnerId) {
                ticketDomain = [['partner_id', '=', partnerId]];
            } else {
                ticketDomain = ['|',
                    ['name', 'ilike', searchQuery],
                    ['ticket_ref', 'ilike', searchQuery]
                ];
            }

            const tickets = await odooApiCall('helpdesk.ticket', 'search_read', [ticketDomain], {
                fields: ['id', 'name', 'ticket_ref', 'stage_id', 'create_date', 'partner_id', 'description', 'priority'],
                order: 'create_date desc',
                limit: 20
            });

            results.helpdesk = (tickets || []).map(ticket => ({
                id: ticket.id,
                reference: ticket.ticket_ref || `#${ticket.id}`,
                subject: ticket.name,
                status: ticket.stage_id ? ticket.stage_id[1] : 'Unknown',
                date: ticket.create_date,
                customerName: ticket.partner_id ? ticket.partner_id[1] : 'Unknown',
                priority: ticket.priority || '0'
            }));
        } catch (err) {
            console.log('Helpdesk module not available or error:', err.message);
        }

        // Search Repair Orders
        try {
            let repairDomain = [];
            if (partnerId) {
                repairDomain = [['partner_id', '=', partnerId]];
            } else {
                repairDomain = [['name', 'ilike', searchQuery]];
            }

            const repairs = await odooApiCall('repair.order', 'search_read', [repairDomain], {
                fields: ['id', 'name', 'state', 'create_date', 'partner_id', 'product_id', 'amount_total'],
                order: 'create_date desc',
                limit: 20
            });

            const repairStateMap = {
                'draft': 'Draft',
                'confirmed': 'Confirmed',
                'under_repair': 'Under Repair',
                'ready': 'Ready',
                '2binvoiced': 'To be Invoiced',
                'invoice_except': 'Invoice Exception',
                'done': 'Completed',
                'cancel': 'Cancelled'
            };

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
        } catch (err) {
            console.log('Repair module not available or error:', err.message);
        }

        // Set customer info from first order if not already set
        if (!results.customer && results.orders.length > 0) {
            results.customer = {
                name: results.orders[0].customerName
            };
        }

        const totalResults = results.orders.length + results.deliveries.length + results.helpdesk.length + results.repairs.length;

        res.json({
            success: true,
            query: searchQuery,
            searchType: isPhoneSearch ? 'phone' : 'reference',
            totalResults,
            ...results
        });

    } catch (error) {
        console.error('Track search error:', error.message);
        res.status(500).json({
            error: 'Failed to search records',
            details: error.message
        });
    }
});

// Get detailed order info with line items
router.get('/order/:orderId', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);

        const orders = await odooApiCall('sale.order', 'read', [[orderId]], {
            fields: ['id', 'name', 'state', 'date_order', 'amount_total', 'amount_untaxed', 'amount_tax',
                'client_order_ref', 'partner_id', 'order_line', 'note', 'commitment_date']
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        let lines = [];
        if (order.order_line && order.order_line.length > 0) {
            lines = await odooApiCall('sale.order.line', 'read', [order.order_line], {
                fields: ['product_id', 'name', 'product_uom_qty', 'price_unit', 'price_subtotal']
            });
        }

        const orderStateMap = {
            'draft': 'Quotation',
            'sent': 'Quotation Sent',
            'sale': 'Sales Order',
            'done': 'Completed',
            'cancel': 'Cancelled'
        };

        res.json({
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
                lines: lines.map(line => ({
                    productName: line.product_id ? line.product_id[1] : line.name,
                    quantity: line.product_uom_qty,
                    unitPrice: line.price_unit,
                    subtotal: line.price_subtotal
                }))
            }
        });

    } catch (error) {
        console.error('Order detail error:', error.message);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

// Get detailed delivery info with line items
router.get('/delivery/:deliveryId', async (req, res) => {
    try {
        const deliveryId = parseInt(req.params.deliveryId);

        const deliveries = await odooApiCall('stock.picking', 'read', [[deliveryId]], {
            fields: ['id', 'name', 'state', 'scheduled_date', 'date_done', 'partner_id', 'origin', 'move_ids_without_package']
        });

        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        const delivery = deliveries[0];

        let lines = [];
        if (delivery.move_ids_without_package && delivery.move_ids_without_package.length > 0) {
            lines = await odooApiCall('stock.move', 'read', [delivery.move_ids_without_package], {
                fields: ['product_id', 'name', 'product_uom_qty', 'quantity_done', 'product_uom']
            });
        }

        const deliveryStateMap = {
            'draft': 'Draft',
            'waiting': 'Waiting',
            'confirmed': 'Waiting',
            'assigned': 'Ready',
            'done': 'Delivered',
            'cancel': 'Cancelled'
        };

        res.json({
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
                lines: lines.map(line => ({
                    productName: line.product_id ? line.product_id[1] : line.name,
                    quantity: line.product_uom_qty,
                    quantityDone: line.quantity_done,
                    uom: line.product_uom ? line.product_uom[1] : 'Units'
                }))
            }
        });

    } catch (error) {
        console.error('Delivery detail error:', error.message);
        res.status(500).json({ error: 'Failed to fetch delivery details' });
    }
});

module.exports = router;
