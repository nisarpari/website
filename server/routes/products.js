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
        const limit = parseInt(req.query.limit) || 100;

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
                limit: limit
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
                    'product_template_image_ids',
                    'barcode'
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

        // Fetch documents attached to this product
        // Try multiple approaches since Odoo stores documents differently
        try {
            let documents = [];

            // Approach 1: Try documents.document model (Odoo Documents app)
            // Documents might be linked via res_model/res_id or through name matching
            try {
                const docs = await odooApiCall(
                    'documents.document',
                    'search_read',
                    [[
                        '|',
                        '&', ['res_model', '=', 'product.template'], ['res_id', '=', productId],
                        '&', ['res_model', '=', 'product.product'], ['res_id', 'in', product.variantIds || []]
                    ]],
                    { fields: ['id', 'name', 'mimetype', 'attachment_id'] }
                );
                if (docs.length > 0) {
                    documents = docs.map(doc => ({
                        id: doc.attachment_id ? doc.attachment_id[0] : doc.id,
                        name: doc.name,
                        url: `http://localhost:3001/api/products/document/${doc.attachment_id ? doc.attachment_id[0] : doc.id}`
                    }));
                }
            } catch (docErr) {
                // documents.document model might not exist
                console.log('Documents app query failed, trying ir.attachment');
            }

            // Approach 2: Try ir.attachment for product.template
            if (documents.length === 0) {
                const attachments = await odooApiCall(
                    'ir.attachment',
                    'search_read',
                    [[
                        '|',
                        '&', ['res_model', '=', 'product.template'], ['res_id', '=', productId],
                        '&', ['res_model', '=', 'product.product'], ['res_id', 'in', product.variantIds || []]
                    ]],
                    { fields: ['id', 'name', 'mimetype', 'file_size', 'res_model', 'res_id'] }
                );
                // Filter for PDF files
                const pdfAttachments = attachments.filter(att =>
                    att.mimetype && att.mimetype.toLowerCase().includes('pdf')
                );
                if (pdfAttachments.length > 0) {
                    documents = pdfAttachments.map(att => ({
                        id: att.id,
                        name: att.name,
                        url: `http://localhost:3001/api/products/document/${att.id}`
                    }));
                }
            }

            // Approach 3: Query documents by product barcode (unique identifier)
            // Barcode is the most reliable way to find exact product documents
            if (documents.length === 0 && product.barcode) {
                try {
                    const docsByBarcode = await odooApiCall(
                        'ir.attachment',
                        'search_read',
                        [[
                            ['name', 'ilike', product.barcode],
                            ['mimetype', 'ilike', 'pdf']
                        ]],
                        { fields: ['id', 'name', 'mimetype'], limit: 5, order: 'id desc' }
                    );

                    // Filter to ensure document name contains the exact barcode
                    const relevantDocs = docsByBarcode.filter(att =>
                        att.name.toLowerCase().includes(product.barcode.toLowerCase())
                    );

                    if (relevantDocs.length > 0) {
                        // Deduplicate by normalized name
                        const seen = new Set();
                        const uniqueDocs = relevantDocs.filter(att => {
                            const normalizedName = att.name.replace(/[_\d]+\.pdf$/i, '.pdf');
                            if (seen.has(normalizedName)) return false;
                            seen.add(normalizedName);
                            return true;
                        });
                        documents = uniqueDocs.map(att => ({
                            id: att.id,
                            name: att.name.replace(/[_\d]+\.pdf$/i, '.pdf'),
                            url: `http://localhost:3001/api/products/document/${att.id}`
                        }));
                    }
                } catch (e) {
                    // Barcode search failed
                }
            }

            product.documents = documents;
        } catch (e) {
            console.error('Error fetching product documents:', e.message);
            product.documents = [];
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Get popular/bestselling products (sorted by recent sales activity)
router.get('/popular/bestsellers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        // Fetch products sorted by sales count or recent activity
        // Using website_sequence and qty_available as proxy for popularity
        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['is_published', '=', true], ['qty_available', '>', 0]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'description_sale', 'default_code', 'qty_available', 'website_url',
                    'public_categ_ids', 'website_ribbon_id',
                    'product_template_image_ids'
                ],
                limit: limit,
                order: 'write_date desc'  // Most recently updated (often correlates with sales activity)
            }
        );

        res.json(products.map(transformProduct));
    } catch (error) {
        console.error('Error fetching popular products:', error);
        res.status(500).json({ error: 'Failed to fetch popular products' });
    }
});

// Get new arrivals (recently added products)
router.get('/popular/new-arrivals', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[['is_published', '=', true]]],
            {
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'description_sale', 'default_code', 'qty_available', 'website_url',
                    'public_categ_ids', 'website_ribbon_id',
                    'product_template_image_ids'
                ],
                limit: limit,
                order: 'create_date desc'  // Most recently created
            }
        );

        res.json(products.map(transformProduct));
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        res.status(500).json({ error: 'Failed to fetch new arrivals' });
    }
});

// Get random products from same category (for "You May Also Like" fallback)
router.get('/random-from-category/:categoryId', async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const excludeId = parseInt(req.query.exclude) || 0;
        const limit = parseInt(req.query.limit) || 8;

        // Fetch more products than needed, then shuffle and take limit
        const products = await odooApiCall(
            'product.template',
            'search_read',
            [[
                ['public_categ_ids', 'in', [categoryId]],
                ['is_published', '=', true],
                ['qty_available', '>', 0],
                ['id', '!=', excludeId]
            ]],
            {
                fields: [
                    'id', 'name', 'list_price', 'website_url',
                    'qty_available', 'public_categ_ids'
                ],
                limit: limit * 3,  // Fetch extra for randomization
                order: 'id asc'
            }
        );

        // Shuffle array and take requested limit
        const shuffled = products.sort(() => Math.random() - 0.5).slice(0, limit);

        // Transform to minimal product format
        const result = shuffled.map(p => ({
            id: p.id,
            name: p.name,
            price: p.list_price,
            thumbnail: `${ODOO_CONFIG.baseUrl}/web/image/product.template/${p.id}/image_512`,
            slug: p.website_url ? p.website_url.replace('/shop/', '') : `${p.name.toLowerCase().replace(/\s+/g, '-')}-${p.id}`
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching random products from category:', error);
        res.status(500).json({ error: 'Failed to fetch random products' });
    }
});

// Proxy endpoint to download documents (Odoo requires authentication)
router.get('/document/:attachmentId', async (req, res) => {
    try {
        const attachmentId = parseInt(req.params.attachmentId);

        // Fetch the attachment data including the binary content
        const attachments = await odooApiCall(
            'ir.attachment',
            'search_read',
            [[['id', '=', attachmentId]]],
            { fields: ['name', 'mimetype', 'datas'] }
        );

        if (attachments.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const attachment = attachments[0];

        // datas is base64 encoded
        const fileBuffer = Buffer.from(attachment.datas, 'base64');

        // Set headers for download
        res.setHeader('Content-Type', attachment.mimetype || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.name}"`);
        res.setHeader('Content-Length', fileBuffer.length);

        res.send(fileBuffer);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ error: 'Failed to download document' });
    }
});

module.exports = router;
