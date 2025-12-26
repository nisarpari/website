const express = require('express');
const router = express.Router();
const { odooApiCall } = require('../utils/odoo');
const { transformProduct } = require('../utils/transform');

// Search products
router.get('/', async (req, res) => {
    try {
        const { q, minPrice, maxPrice, category, color, sort } = req.query;

        // Build domain filters
        const domain = [];

        if (q) {
            domain.push(['name', 'ilike', q]);
        }
        if (minPrice) {
            domain.push(['list_price', '>=', parseFloat(minPrice)]);
        }
        if (maxPrice) {
            domain.push(['list_price', '<=', parseFloat(maxPrice)]);
        }
        if (category) {
            domain.push(['categ_id.name', '=', category]);
        }

        // Determine sort order
        let order = 'name asc';
        if (sort === 'price-low') order = 'list_price asc';
        if (sort === 'price-high') order = 'list_price desc';

        const products = await odooApiCall(
            'product.template',
            'search_read',
            [domain],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'image_1920', 'description_sale', 'default_code'
                ],
                limit: 100,
                order: order
            }
        );

        res.json(products.map(transformProduct));
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
