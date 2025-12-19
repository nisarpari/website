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
                    'product_template_image_ids'
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AquaLux API Server running on port ${PORT}`);
    console.log(`📦 Connected to Odoo: ${ODOO_CONFIG.baseUrl}`);
});

module.exports = app;
