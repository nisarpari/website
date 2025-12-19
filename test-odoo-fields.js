const axios = require('axios');

const ODOO_CONFIG = {
    baseUrl: 'https://erp.bellastore.in',
    database: 'Dec8',
    apiKey: '29f68d396f385ce533f1701072a62020d72d3aa9'
};

async function testFields() {
    try {
        // Test eCommerce fields
        const response = await axios.post(
            `${ODOO_CONFIG.baseUrl}/json/2/product.template/search_read`,
            {
                domain: [['is_published', '=', true]],
                fields: [
                    'id', 'name', 'list_price', 'categ_id',
                    'public_categ_ids',           // eCommerce categories
                    'accessory_product_ids',       // Accessory products
                    'alternative_product_ids',     // Alternative products
                    'website_ribbon_id',           // Ribbon (e.g., "Sold out", "New")
                    'allow_out_of_stock_order',    // Sell when out of stock
                    'out_of_stock_message',        // Out of stock message
                    'show_availability',           // Show available qty
                    'available_threshold',         // Available qty threshold
                    'website_description',         // eCommerce description (HTML)
                    'product_template_image_ids',  // Additional images
                    'product_document_ids',        // Documents
                    'description_sale',            // Sales description
                    'website_url'
                ],
                limit: 5
            },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                    'X-Odoo-Database': ODOO_CONFIG.database
                }
            }
        );

        console.log('Products with eCommerce fields:');
        console.log(JSON.stringify(response.data, null, 2));

        // Find a product with alternative products
        const withAlternatives = response.data.find(p => p.alternative_product_ids?.length > 0);
        if (withAlternatives) {
            console.log('\n\nProduct with alternatives:', withAlternatives.name);
            console.log('Alternative IDs:', withAlternatives.alternative_product_ids);
        }

        // Get ribbon info
        const ribbonResponse = await axios.post(
            `${ODOO_CONFIG.baseUrl}/json/2/product.ribbon/search_read`,
            {
                domain: [],
                fields: ['id', 'name', 'html', 'bg_color', 'text_color']
            },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                    'X-Odoo-Database': ODOO_CONFIG.database
                }
            }
        );
        console.log('\n\nAvailable ribbons:');
        console.log(JSON.stringify(ribbonResponse.data, null, 2));

        // Get public categories
        const catResponse = await axios.post(
            `${ODOO_CONFIG.baseUrl}/json/2/product.public.category/search_read`,
            {
                domain: [],
                fields: ['id', 'name', 'parent_id', 'child_id', 'sequence']
            },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                    'X-Odoo-Database': ODOO_CONFIG.database
                }
            }
        );
        console.log('\n\nPublic eCommerce categories:');
        console.log(JSON.stringify(catResponse.data.slice(0, 10), null, 2));

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testFields();
