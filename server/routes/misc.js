const express = require('express');
const router = express.Router();
const { odooApiCall } = require('../utils/odoo');
const { ribbonCache, clearAllCaches } = require('../utils/cache');

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all ribbons
router.get('/ribbons', async (req, res) => {
    try {
        if (ribbonCache.data && Date.now() - ribbonCache.timestamp < ribbonCache.ttl) {
            return res.json(ribbonCache.data);
        }

        const ribbons = await odooApiCall(
            'product.ribbon',
            'search_read',
            [[]],
            { fields: ['id', 'name', 'html', 'bg_color', 'text_color'] }
        );

        ribbonCache.data = ribbons;
        ribbonCache.timestamp = Date.now();

        res.json(ribbons);
    } catch (error) {
        console.error('Error fetching ribbons:', error);
        res.status(500).json({ error: 'Failed to fetch ribbons' });
    }
});

// Contact form submission (saves to Odoo CRM)
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        const leadId = await odooApiCall(
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

        res.json({ success: true, leadId });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// Clear cache endpoint (for admin use)
router.post('/cache/clear', (req, res) => {
    clearAllCaches();
    res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
