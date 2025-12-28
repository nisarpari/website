const { ODOO_CONFIG } = require('../config');

// Extract color from product attributes (customize based on your Odoo setup)
function extractColor(product) {
    if (product.product_template_attribute_value_ids && product.attribute_line_ids) {
        // Extract color from attribute values
        // Adjust this based on your attribute setup
    }
    return 'Chrome'; // Default color
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
        // Documents (field may not exist in all Odoo versions)
        documentIds: [],
        // Barcode (unique identifier for document matching)
        barcode: product.barcode || '',
        // SEO-friendly URL from Odoo
        url: product.website_url || `/shop/${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
        slug: product.website_url ? product.website_url.replace('/shop/', '') : `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
        // Product variant IDs for order creation
        variantIds: product.product_variant_ids || [],
    };

    return transformed;
}

module.exports = {
    transformProduct,
    extractColor
};
