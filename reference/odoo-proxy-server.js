/**
 * AquaLux - Odoo API Proxy Server
 * 
 * This server acts as a proxy between your website and Odoo,
 * keeping API credentials secure and handling CORS.
 * 
 * Setup:
 * 1. npm init -y
 * 2. npm install express cors axios dotenv
 * 3. Create .env file with your Odoo credentials
 * 4. node odoo-proxy-server.js
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Odoo Configuration from environment variables
// Note: Use direct Odoo.sh URL to avoid Cloudflare blocking
const ODOO_CONFIG = {
    baseUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
    database: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
    apiKey: process.env.ODOO_API_KEY || 'de6b7193044f410d428e101981088632cbbfb587',
};

// Cache for products (simple in-memory cache)
let productCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
};

let categoryCache = {
    data: null,
    timestamp: null,
    ttl: 30 * 60 * 1000 // 30 minutes
};

let publicCategoryCache = {
    data: null,
    timestamp: null,
    ttl: 30 * 60 * 1000 // 30 minutes
};

let ribbonCache = {
    data: null,
    timestamp: null,
    ttl: 60 * 60 * 1000 // 1 hour
};

// Helper function for Odoo JSON-RPC API calls
async function odooApiCall(model, method, args = [], kwargs = {}) {
    try {
        // Standard Odoo JSON-RPC format
        const url = `${ODOO_CONFIG.baseUrl}/jsonrpc`;

        const body = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.database,
                    2, // User ID (2 is typically admin)
                    ODOO_CONFIG.apiKey,
                    model,
                    method,
                    args,
                    kwargs
                ]
            },
            id: Date.now()
        };

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.error) {
            throw new Error(response.data.error.data?.message || response.data.error.message || JSON.stringify(response.data.error));
        }

        return response.data.result !== undefined ? response.data.result : response.data;
    } catch (error) {
        console.error('Odoo API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Transform Odoo product to website format
function transformProduct(product, includeRelated = false) {
    const transformed = {
        id: product.id,
        name: product.name,
        price: product.list_price || 0,
        // Internal category (for backwards compatibility)
        category: product.categ_id ? product.categ_id[1] : 'Uncategorized',
        categoryId: product.categ_id ? product.categ_id[0] : null,
        // eCommerce public categories
        publicCategoryIds: product.public_categ_ids || [],
        // Images
        image: `${ODOO_CONFIG.baseUrl}/web/image/product.template/${product.id}/image_1920`,
        thumbnail: `${ODOO_CONFIG.baseUrl}/web/image/product.template/${product.id}/image_512`,
        additionalImageIds: product.product_template_image_ids || [],
        // Description
        description: product.description_sale || '',
        ecommerceDescription: product.website_description || '',
        sku: product.default_code || '',
        rating: 4.5 + Math.random() * 0.5,
        color: extractColor(product),
        // Stock & Availability
        inStock: product.qty_available > 0 || product.allow_out_of_stock_order,
        allowOutOfStock: product.allow_out_of_stock_order || false,
        outOfStockMessage: product.out_of_stock_message || '',
        showAvailability: product.show_availability || false,
        availableThreshold: product.available_threshold || 0,
        qtyAvailable: product.qty_available || 0,
        // Ribbon (e.g., "Sale", "Sold out", "New!")
        ribbonId: product.website_ribbon_id ? product.website_ribbon_id[0] : null,
        ribbonName: product.website_ribbon_id ? product.website_ribbon_id[1] : null,
        // Related products (IDs only - fetch details separately)
        accessoryProductIds: product.accessory_product_ids || [],
        alternativeProductIds: product.alternative_product_ids || [],
        // Documents
        documentIds: product.product_document_ids || [],
        // SEO-friendly URL from Odoo
        url: product.website_url || `/shop/${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
        slug: product.website_url ? product.website_url.replace('/shop/', '') : `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
        // Product variant IDs for order creation
        variantIds: product.product_variant_ids || [],
    };

    return transformed;
}

// Extract color from product attributes (customize based on your Odoo setup)
function extractColor(product) {
    // This depends on how you've set up color attributes in Odoo
    // Default implementation - customize as needed
    if (product.product_template_attribute_value_ids && product.attribute_line_ids) {
        // Extract color from attribute values
        // You'll need to adjust this based on your attribute setup
    }
    return 'Chrome'; // Default color
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        // Check cache
        if (productCache.data && Date.now() - productCache.timestamp < productCache.ttl) {
            return res.json(productCache.data);
        }

        // Fetch from Odoo - only published products with eCommerce fields
        // Reduced limit to avoid Vercel timeout, fetch in batches if needed
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
                    // eCommerce specific fields
                    'public_categ_ids',
                    'website_ribbon_id',
                    'allow_out_of_stock_order',
                    'show_availability',
                    'available_threshold',
                    'product_template_image_ids',
                    // Include product variant IDs for order creation
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

// Get products by category ID (only published)
app.get('/api/products/category/:categoryId', async (req, res) => {
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

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
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

// Get single product by slug (for SEO-friendly URLs like /shop/product-name-123)
// This endpoint returns FULL product details including related products
app.get('/api/product/by-slug/:slug', async (req, res) => {
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
                    // eCommerce fields
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
                    // Note: product_document_ids removed - not available in Odoo 16
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

// Get all categories with hierarchy
app.get('/api/categories', async (req, res) => {
    try {
        // Check cache
        if (categoryCache.data && Date.now() - categoryCache.timestamp < categoryCache.ttl) {
            return res.json(categoryCache.data);
        }

        const categories = await odooApiCall(
            'product.category',
            'search_read',
            [[]],
            {
                fields: ['id', 'name', 'parent_id', 'child_id', 'complete_name']
            }
        );

        // Build category map for quick lookup
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat;
        });

        // Count published products per category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await odooApiCall(
                    'product.template',
                    'search_count',
                    [[['categ_id', '=', cat.id], ['is_published', '=', true]]]
                );
                return {
                    id: cat.id,
                    name: cat.name,
                    fullName: cat.complete_name || cat.name,
                    slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    parentId: cat.parent_id ? cat.parent_id[0] : null,
                    parentName: cat.parent_id ? cat.parent_id[1] : null,
                    childIds: cat.child_id || [],
                    count: count,
                    image: `https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop`
                };
            })
        );

        // Filter out categories with no published products
        const filteredCategories = categoriesWithCount.filter(cat => cat.count > 0);

        // Update cache with filtered categories
        categoryCache.data = filteredCategories;
        categoryCache.timestamp = Date.now();

        res.json(filteredCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get category hierarchy (tree structure)
app.get('/api/categories/tree', async (req, res) => {
    try {
        // Use cached flat categories
        let categories = categoryCache.data;
        if (!categories || Date.now() - categoryCache.timestamp >= categoryCache.ttl) {
            // Fetch fresh if cache expired
            const response = await axios.get(`http://localhost:${PORT}/api/categories`);
            categories = response.data;
        }

        // Build tree structure
        const rootCategories = categories.filter(cat => cat.parentId === null);
        const buildTree = (parent) => {
            const children = categories.filter(cat => cat.parentId === parent.id);
            return {
                ...parent,
                children: children.map(buildTree)
            };
        };

        const tree = rootCategories.map(buildTree);
        res.json(tree);
    } catch (error) {
        console.error('Error building category tree:', error);
        res.status(500).json({ error: 'Failed to build category tree' });
    }
});

// Get eCommerce public categories (website categories)
app.get('/api/public-categories', async (req, res) => {
    try {
        // Check cache
        if (publicCategoryCache.data && Date.now() - publicCategoryCache.timestamp < publicCategoryCache.ttl) {
            return res.json(publicCategoryCache.data);
        }

        const categories = await odooApiCall(
            'product.public.category',
            'search_read',
            [[]],
            {
                fields: ['id', 'name', 'parent_id', 'child_id', 'sequence'],
                order: 'sequence asc, name asc'
            }
        );

        // Count published products per public category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await odooApiCall(
                    'product.template',
                    'search_count',
                    [[['public_categ_ids', 'in', [cat.id]], ['is_published', '=', true]]]
                );
                return {
                    id: cat.id,
                    name: cat.name,
                    slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    parentId: cat.parent_id ? cat.parent_id[0] : null,
                    parentName: cat.parent_id ? cat.parent_id[1] : null,
                    childIds: cat.child_id || [],
                    sequence: cat.sequence,
                    count: count
                };
            })
        );

        // Build a map for quick lookup
        const categoryMap = {};
        categoriesWithCount.forEach(cat => {
            categoryMap[cat.id] = cat;
        });

        // Calculate total count (including children) for each category
        const calculateTotalCount = (catId) => {
            const cat = categoryMap[catId];
            if (!cat) return 0;
            let total = cat.count;
            if (cat.childIds && cat.childIds.length > 0) {
                cat.childIds.forEach(childId => {
                    total += calculateTotalCount(childId);
                });
            }
            return total;
        };

        // Add totalCount to each category
        categoriesWithCount.forEach(cat => {
            cat.totalCount = calculateTotalCount(cat.id);
        });

        // Filter categories that have products (directly or via children)
        // Include a category if:
        // 1. It has direct products (count > 0), OR
        // 2. Any of its children/descendants have products (totalCount > count)
        const filteredCategories = categoriesWithCount
            .filter(cat => cat.totalCount > 0)
            .sort((a, b) => a.sequence - b.sequence);

        // Update cache
        publicCategoryCache.data = filteredCategories;
        publicCategoryCache.timestamp = Date.now();

        res.json(filteredCategories);
    } catch (error) {
        console.error('Error fetching public categories:', error);
        res.status(500).json({ error: 'Failed to fetch public categories' });
    }
});

// Get public categories as tree structure
app.get('/api/public-categories/tree', async (req, res) => {
    try {
        let categories = publicCategoryCache.data;
        if (!categories || Date.now() - publicCategoryCache.timestamp >= publicCategoryCache.ttl) {
            const response = await axios.get(`http://localhost:${PORT}/api/public-categories`);
            categories = response.data;
        }

        // Build tree structure
        const rootCategories = categories.filter(cat => cat.parentId === null);
        const buildTree = (parent) => {
            const children = categories.filter(cat => cat.parentId === parent.id);
            return {
                ...parent,
                children: children.map(buildTree).sort((a, b) => a.sequence - b.sequence)
            };
        };

        const tree = rootCategories.map(buildTree).sort((a, b) => a.sequence - b.sequence);
        res.json(tree);
    } catch (error) {
        console.error('Error building public category tree:', error);
        res.status(500).json({ error: 'Failed to build public category tree' });
    }
});

// Get products by public category
app.get('/api/products/public-category/:categoryId', async (req, res) => {
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

// Get all ribbons
app.get('/api/ribbons', async (req, res) => {
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

// Search products
app.get('/api/search', async (req, res) => {
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

// Contact form submission (saves to Odoo CRM)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Create lead in Odoo CRM
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
app.post('/api/cache/clear', (req, res) => {
    productCache.data = null;
    productCache.timestamp = null;
    categoryCache.data = null;
    categoryCache.timestamp = null;
    res.json({ success: true, message: 'Cache cleared' });
});

// ============================================
// ADMIN API - Site Configuration
// ============================================
const fs = require('fs');
const path = require('path');
const CONFIG_PATH = path.join(__dirname, 'site-config.json');

// Simple admin password (in production, use proper auth)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bella2024';

// Middleware to check admin auth
const checkAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Get site config
app.get('/api/admin/config', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read config' });
    }
});

// Update site config (requires auth)
app.put('/api/admin/config', checkAdminAuth, (req, res) => {
    try {
        const newConfig = req.body;
        newConfig.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
        res.json({ success: true, config: newConfig });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update config' });
    }
});

// Update specific config section (requires auth)
app.patch('/api/admin/config/:section', checkAdminAuth, (req, res) => {
    try {
        const { section } = req.params;
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

        if (!config[section]) {
            return res.status(400).json({ error: `Section '${section}' not found` });
        }

        config[section] = { ...config[section], ...req.body };
        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        res.json({ success: true, section, data: config[section] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update config section' });
    }
});

// Admin login (returns token if password correct)
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Upload image (requires auth) - saves to /images folder
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'images', req.body.folder || 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

app.post('/api/admin/upload', checkAdminAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
    }
    const imagePath = `/images/${req.body.folder || 'uploads'}/${req.file.filename}`;
    res.json({ success: true, path: imagePath, filename: req.file.filename });
});

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve static HTML files (admin.html, etc.)
app.use(express.static(__dirname));

// ============================================
// QUOTATION & ORDER ENDPOINTS
// ============================================

// Country code to name mapping
const COUNTRY_NAMES = {
    'OM': 'Oman',
    'AE': 'United Arab Emirates',
    'QA': 'Qatar',
    'IN': 'India',
    'SA': 'Saudi Arabia',
    'KW': 'Kuwait',
    'BH': 'Bahrain'
};

// Create or find customer in Odoo
async function findOrCreateCustomer(customerData) {
    const { name, phone, email, country } = customerData;

    // Search for existing customer by phone
    let domain = [];
    if (phone) {
        domain = [['phone', '=', phone]];
    } else if (email) {
        domain = [['email', '=', email]];
    }

    if (domain.length > 0) {
        const existingCustomers = await odooApiCall('res.partner', 'search_read', [domain], {
            fields: ['id', 'name', 'phone', 'email', 'comment'],
            limit: 1
        });

        if (existingCustomers && existingCustomers.length > 0) {
            // Update existing customer if needed
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

    return partnerId;
}

// Create quotation (draft sale order) in Odoo
async function createQuotation(customerId, cartItems, country, orderRef = null) {
    // Prepare order lines - use product.product variant ID
    const orderLines = [];
    const failedProducts = [];

    for (const item of cartItems) {
        let productVariantId = null;

        // First try to use variantId if provided
        if (item.variantId) {
            productVariantId = item.variantId;
        } else if (item.variantIds && item.variantIds.length > 0) {
            // Use first variant from the list
            productVariantId = item.variantIds[0];
        } else {
            // Fallback: Find the product.product variant for this template
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
                price_unit: item.price // Original OMR price
            }]);
        } else {
            failedProducts.push(item.name || item.id);
        }
    }

    if (orderLines.length === 0) {
        throw new Error(`No valid products found in cart. Failed products: ${failedProducts.join(', ')}`);
    }

    // Log if some products failed but we still have valid ones
    if (failedProducts.length > 0) {
        console.warn(`Some products failed to resolve: ${failedProducts.join(', ')}`);
    }

    // Create the quotation (draft sale order)
    const countryName = COUNTRY_NAMES[country] || country;

    // Get default warehouse
    let warehouseId = null;
    try {
        const warehouses = await odooApiCall('stock.warehouse', 'search_read',
            [[]],  // Get all warehouses
            { fields: ['id', 'name'], limit: 1 }
        );
        console.log('Warehouses found:', warehouses);
        if (warehouses && warehouses.length > 0) {
            warehouseId = warehouses[0].id;
        }
    } catch (err) {
        console.warn('Could not fetch warehouse:', err.message);
    }

    if (!warehouseId) {
        console.warn('No warehouse found, trying hardcoded value 1');
        warehouseId = 1;
    }

    const orderData = {
        partner_id: customerId,
        order_line: orderLines,
        warehouse_id: warehouseId,
        state: 'draft', // Quotation state
        note: `Website Quotation Request\nCountry: ${countryName}`
    };

    if (orderRef) {
        orderData.client_order_ref = orderRef;
    }

    const orderId = await odooApiCall('sale.order', 'create', [orderData]);

    // Get order details including name (quotation number)
    const orderDetails = await odooApiCall('sale.order', 'read', [[orderId]], {
        fields: ['name', 'amount_total', 'state']
    });

    return { id: orderId, ...orderDetails[0] };
}

// Submit order - creates quotation in Odoo (no payment processing)
app.post('/api/quotation/submit', async (req, res) => {
    try {
        const { customer, cart, country } = req.body;

        // Validate required fields
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

        // Add country to customer data
        const customerWithCountry = { ...customer, country };

        // Create/find customer in Odoo
        const customerId = await findOrCreateCustomer(customerWithCountry);

        // Generate unique order reference
        const orderRef = `WEB-${Date.now()}`;

        // Create quotation (draft order) in Odoo
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
app.get('/api/quotation/status/:orderRef', async (req, res) => {
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

// ============================================
// TRACK ORDER / CUSTOMER LOOKUP
// ============================================

// Search for customer records by phone or reference number
app.get('/api/track/search', async (req, res) => {
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

        // Determine if searching by phone or reference
        const isPhoneSearch = /^\+?\d{6,}$/.test(searchQuery.replace(/\s/g, ''));

        let partnerId = null;

        if (isPhoneSearch) {
            // Search by phone number - find the customer first
            // Clean phone: remove spaces, dashes, and handle various formats
            let phoneClean = searchQuery.replace(/[\s\-\(\)]/g, '');

            // Extract last 8 digits for matching (handles country code variations)
            const lastDigits = phoneClean.replace(/^\+/, '').slice(-8);

            // Also try with/without country code
            const phoneWithoutPlus = phoneClean.replace(/^\+/, '');
            const phoneWithoutCode = phoneClean.replace(/^\+?968/, '');

            console.log('Phone search variants:', { phoneClean, lastDigits, phoneWithoutPlus, phoneWithoutCode });

            // Search in phone, mobile, AND name fields (some customers have phone in name)
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
                    // Also search in name field (some customers have phone embedded in name)
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
            // Search by order reference
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

        // Map order states to readable format
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

        // Search Delivery Orders (stock.picking)
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

        // Search Helpdesk Tickets (if module exists)
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

        // Search Repair Orders (if module exists)
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
app.get('/api/track/order/:orderId', async (req, res) => {
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

        // Fetch order lines
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
app.get('/api/track/delivery/:deliveryId', async (req, res) => {
    try {
        const deliveryId = parseInt(req.params.deliveryId);

        const deliveries = await odooApiCall('stock.picking', 'read', [[deliveryId]], {
            fields: ['id', 'name', 'state', 'scheduled_date', 'date_done', 'partner_id', 'origin', 'move_ids_without_package']
        });

        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        const delivery = deliveries[0];

        // Fetch move lines (items)
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

// ============================================
// USER VERIFICATION (OTP) ENDPOINTS
// ============================================

// GCC Countries only for verification
const GCC_COUNTRIES = {
    'OM': { name: 'Oman', code: '+968', flag: '🇴🇲' },
    'AE': { name: 'UAE', code: '+971', flag: '🇦🇪' },
    'SA': { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    'QA': { name: 'Qatar', code: '+974', flag: '🇶🇦' },
    'KW': { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
    'BH': { name: 'Bahrain', code: '+973', flag: '🇧🇭' }
};

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get list of GCC countries for frontend
app.get('/api/verify/countries', (req, res) => {
    res.json({
        success: true,
        countries: Object.entries(GCC_COUNTRIES).map(([code, data]) => ({
            code,
            ...data
        }))
    });
});

// Send OTP to phone number
app.post('/api/verify/send-otp', async (req, res) => {
    try {
        const { phone, countryCode } = req.body;

        // Validate country is GCC
        if (!GCC_COUNTRIES[countryCode]) {
            return res.status(400).json({
                error: 'Verification is only available for GCC countries'
            });
        }

        if (!phone || phone.length < 8) {
            return res.status(400).json({
                error: 'Please enter a valid phone number'
            });
        }

        // Format full phone number
        const countryDialCode = GCC_COUNTRIES[countryCode].code;
        const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
        const fullPhone = `${countryDialCode}${cleanPhone}`;

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // Store OTP
        otpStore.set(fullPhone, {
            otp,
            expiresAt,
            countryCode,
            attempts: 0
        });

        // TODO: Integrate with WhatsApp Business API
        // For now, we'll log the OTP (in production, send via WhatsApp)
        console.log(`📱 OTP for ${fullPhone}: ${otp}`);

        // In development/testing, include OTP in response
        // Remove this in production!
        const isDev = process.env.NODE_ENV !== 'production';

        res.json({
            success: true,
            message: `OTP sent to ${GCC_COUNTRIES[countryCode].code} ${phone}`,
            phone: fullPhone,
            // Only include in dev mode for testing
            ...(isDev && { devOtp: otp })
        });

    } catch (error) {
        console.error('Send OTP error:', error.message);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP
app.post('/api/verify/check-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }

        const stored = otpStore.get(phone);

        if (!stored) {
            return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
        }

        // Check expiry
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Check attempts (max 3)
        if (stored.attempts >= 3) {
            otpStore.delete(phone);
            return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (stored.otp !== otp) {
            stored.attempts++;
            return res.status(400).json({
                error: 'Invalid OTP. Please try again.',
                attemptsRemaining: 3 - stored.attempts
            });
        }

        // OTP is valid - mark user as verified in Odoo
        const countryCode = stored.countryCode;
        otpStore.delete(phone);

        // Find or create customer and mark as verified
        try {
            const existingCustomers = await odooApiCall('res.partner', 'search_read',
                [[['phone', '=', phone]]],
                { fields: ['id', 'name', 'comment'], limit: 1 }
            );

            if (existingCustomers && existingCustomers.length > 0) {
                // Update existing customer - add verified flag
                const customerId = existingCustomers[0].id;
                const existingComment = existingCustomers[0].comment || '';
                const newComment = existingComment.includes('VERIFIED')
                    ? existingComment
                    : `${existingComment}\n[VERIFIED] Phone verified on ${new Date().toISOString()}`;

                await odooApiCall('res.partner', 'write', [[customerId], {
                    comment: newComment.trim()
                }]);
            } else {
                // Create new verified customer
                await odooApiCall('res.partner', 'create', [{
                    name: `Verified User (${phone})`,
                    phone: phone,
                    comment: `Country: ${GCC_COUNTRIES[countryCode].name}\n[VERIFIED] Phone verified on ${new Date().toISOString()}`,
                    customer_rank: 1
                }]);
            }
        } catch (odooError) {
            console.error('Odoo verification update error:', odooError.message);
            // Continue even if Odoo update fails - user is still verified locally
        }

        // Generate verification token (simple hash for now)
        const verificationToken = Buffer.from(`${phone}:${Date.now()}:verified`).toString('base64');

        res.json({
            success: true,
            verified: true,
            message: 'Phone number verified successfully!',
            phone: phone,
            countryCode: countryCode,
            token: verificationToken
        });

    } catch (error) {
        console.error('Verify OTP error:', error.message);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Check if a phone is verified
app.get('/api/verify/status', async (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check in Odoo
        const customers = await odooApiCall('res.partner', 'search_read',
            [[['phone', '=', phone]]],
            { fields: ['id', 'name', 'comment'], limit: 1 }
        );

        if (customers && customers.length > 0) {
            const comment = customers[0].comment || '';
            const isVerified = comment.includes('[VERIFIED]');

            res.json({
                success: true,
                verified: isVerified,
                phone: phone
            });
        } else {
            res.json({
                success: true,
                verified: false,
                phone: phone
            });
        }

    } catch (error) {
        console.error('Check verification status error:', error.message);
        res.status(500).json({ error: 'Failed to check verification status' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Bella Bathwares API Server running on port ${PORT}`);
    console.log(`📦 Connected to Odoo: ${ODOO_CONFIG.baseUrl}`);
});

module.exports = app;
