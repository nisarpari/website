const express = require('express');
const router = express.Router();
const { odooApiCall } = require('../utils/odoo');
const { transformProduct } = require('../utils/transform');
const { productCache } = require('../utils/cache');
const { ODOO_CONFIG } = require('../config');

// Get all products
router.get('/', async (req, res) => {
    try {
        // Check cache
        if (productCache.data && Date.now() - productCache.timestamp < productCache.ttl) {
            return res.json(productCache.data);
        }

        const limit = parseInt(req.query.limit) || 500;
        const offset = parseInt(req.query.offset) || 0;

        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['is_published', '=', true]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'description_sale', 'default_code', 'qty_available', 'website_url',
                    'public_categ_ids',
                    'website_ribbon_id',
                    'allow_out_of_stock_order',
                    'show_availability',
                    'available_threshold',
                    'product_template_image_ids',
                    'product_variant_ids'
                ],
                limit: limit,
                offset: offset,
                order: 'name asc'
            }
        );

        const transformedProducts = products.map(transformProduct);

        // Only cache if fetching all products (no offset)
        if (offset === 0 && limit >= 500) {
            productCache.data = transformedProducts;
            productCache.timestamp = Date.now();
        }

        res.json(transformedProducts);
    } catch (error) {
        console.error('Error fetching products:', error.message, error.stack);
        res.status(500).json({
            error: 'Failed to fetch products',
            details: error.message,
            odooUrl: ODOO_CONFIG.baseUrl
        });
    }
});

// Get products by internal category ID (only published)
router.get('/category/:categoryId', async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);

        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['categ_id', '=', categoryId], ['is_published', '=', true]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'image_1920', 'description_sale', 'default_code',
                    'qty_available', 'website_url'
                ],
                limit: 100
            }
        );

        res.json(products.map(transformProduct));
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get products by public category
router.get('/public-category/:categoryId', async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);

        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['public_categ_ids', 'in', [categoryId]], ['is_published', '=', true]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'description_sale', 'default_code', 'qty_available', 'website_url',
                    'public_categ_ids', 'website_ribbon_id',
                    'allow_out_of_stock_order', 'show_availability',
                    'product_template_image_ids'
                ],
                limit: 100
            }
        );

        res.json(products.map(transformProduct));
    } catch (error) {
        console.error('Error fetching products by public category:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['id', '=', productId]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'image_1920', 'description_sale', 'default_code',
                    'qty_available', 'description', 'website_url'
                ]
            }
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(transformProduct(products[0]));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Get single product by slug (for SEO-friendly URLs)
router.get('/by-slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        // Extract product ID from slug (last segment after final hyphen)
        const match = slug.match(/-(\d+)$/);
        if (!match) {
            return res.status(400).json({ error: 'Invalid product slug format' });
        }
        const productId = parseInt(match[1]);

        // Fetch product with ALL eCommerce fields
        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['id', '=', productId]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'description_sale', 'default_code', 'qty_available', 'website_url',
                    'public_categ_ids',
                    'accessory_product_ids',
                    'alternative_product_ids',
                    'website_ribbon_id',
                    'allow_out_of_stock_order',
                    'out_of_stock_message',
                    'show_availability',
                    'available_threshold',
                    'website_description',
                    'product_template_image_ids'
                ]
            }
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = transformProduct(products[0]);

        // Fetch additional images if any
        if (product.additionalImageIds.length > 0) {
            try {
                const images = await odooApiCall(
                    'product.image',
                    'search_read',
                    [[['id', 'in', product.additionalImageIds]]],
                    { fields: ['id', 'name', 'image_1920'] }
                );
                product.additionalImages = images.map(img => ({
                    id: img.id,
                    name: img.name,
                    url: `${ODOO_CONFIG.baseUrl}/web/image/product.image/${img.id}/image_1920`
                }));
            } catch (e) {
                product.additionalImages = [];
            }
        } else {
            product.additionalImages = [];
        }

        // Fetch accessory products (basic info only)
        if (product.accessoryProductIds.length > 0) {
            try {
                const accessories = await odooApiCall(
                    'product.template',
                    'search_read',
                    [[['id', 'in', product.accessoryProductIds], ['is_published', '=', true]]],
                    { fields: ['id', 'name', 'list_price', 'website_url'], limit: 20 }
                );
                product.accessoryProducts = accessories.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.list_price,
                    thumbnail: `${ODOO_CONFIG.baseUrl}/web/image/product.template/${p.id}/image_512`,
                    slug: p.website_url ? p.website_url.replace('/shop/', '') : `${p.name.toLowerCase().replace(/\s+/g, '-')}-${p.id}`
                }));
            } catch (e) {
                product.accessoryProducts = [];
            }
        } else {
            product.accessoryProducts = [];
        }

        // Fetch alternative products (basic info only)
        if (product.alternativeProductIds.length > 0) {
            try {
                const alternatives = await odooApiCall(
                    'product.template',
                    'search_read',
                    [[['id', 'in', product.alternativeProductIds], ['is_published', '=', true]]],
                    { fields: ['id', 'name', 'list_price', 'website_url'], limit: 20 }
                );
                product.alternativeProducts = alternatives.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.list_price,
                    thumbnail: `${ODOO_CONFIG.baseUrl}/web/image/product.template/${p.id}/image_512`,
                    slug: p.website_url ? p.website_url.replace('/shop/', '') : `${p.name.toLowerCase().replace(/\s+/g, '-')}-${p.id}`
                }));
            } catch (e) {
                product.alternativeProducts = [];
            }
        } else {
            product.alternativeProducts = [];
        }

        // Fetch documents if any
        if (product.documentIds.length > 0) {
            try {
                const docs = await odooApiCall(
                    'product.document',
                    'search_read',
                    [[['id', 'in', product.documentIds]]],
                    { fields: ['id', 'name', 'ir_attachment_id'] }
                );
                product.documents = docs.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    url: doc.ir_attachment_id ? `${ODOO_CONFIG.baseUrl}/web/content/${doc.ir_attachment_id[0]}?download=true` : null
                }));
            } catch (e) {
                product.documents = [];
            }
        } else {
            product.documents = [];
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

module.exports = router;
