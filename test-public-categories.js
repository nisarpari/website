const axios = require('axios');

const ODOO_CONFIG = {
    baseUrl: 'https://erp.bellastore.in',
    database: 'Dec8',
    apiKey: '29f68d396f385ce533f1701072a62020d72d3aa9'
};

async function testPublicCategories() {
    try {
        // Get ALL public categories (without filtering)
        console.log('=== Fetching ALL public categories ===\n');
        const catResponse = await axios.post(
            `${ODOO_CONFIG.baseUrl}/json/2/product.public.category/search_read`,
            {
                domain: [],
                fields: ['id', 'name', 'parent_id', 'child_id', 'sequence'],
                order: 'sequence asc, name asc'
            },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                    'X-Odoo-Database': ODOO_CONFIG.database
                }
            }
        );

        const allCategories = catResponse.data;
        console.log(`Total public categories: ${allCategories.length}\n`);

        // Check each category for products
        console.log('=== Category Details with Product Counts ===\n');

        for (const cat of allCategories) {
            // Count ALL products (published or not)
            const allProductsCount = await axios.post(
                `${ODOO_CONFIG.baseUrl}/json/2/product.template/search_count`,
                {
                    domain: [['public_categ_ids', 'in', [cat.id]]]
                },
                {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                        'X-Odoo-Database': ODOO_CONFIG.database
                    }
                }
            );

            // Count only published products
            const publishedCount = await axios.post(
                `${ODOO_CONFIG.baseUrl}/json/2/product.template/search_count`,
                {
                    domain: [['public_categ_ids', 'in', [cat.id]], ['is_published', '=', true]]
                },
                {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                        'X-Odoo-Database': ODOO_CONFIG.database
                    }
                }
            );

            const parentInfo = cat.parent_id ? `(parent: ${cat.parent_id[1]})` : '(root)';
            const status = publishedCount > 0 ? '✓' : '✗';

            console.log(`${status} ${cat.name} ${parentInfo}`);
            console.log(`   ID: ${cat.id}, Sequence: ${cat.sequence}`);
            console.log(`   Total products: ${allProductsCount.data}, Published: ${publishedCount.data}`);
            console.log('');
        }

        // Find "WC & More" specifically
        console.log('\n=== Looking for "WC & More" ===\n');
        const wcCategory = allCategories.find(c => c.name.toLowerCase().includes('wc'));
        if (wcCategory) {
            console.log('Found:', wcCategory);

            // Get products in this category
            const wcProducts = await axios.post(
                `${ODOO_CONFIG.baseUrl}/json/2/product.template/search_read`,
                {
                    domain: [['public_categ_ids', 'in', [wcCategory.id]]],
                    fields: ['id', 'name', 'is_published', 'public_categ_ids'],
                    limit: 10
                },
                {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': `bearer ${ODOO_CONFIG.apiKey}`,
                        'X-Odoo-Database': ODOO_CONFIG.database
                    }
                }
            );
            console.log('\nProducts in WC category:');
            wcProducts.data.forEach(p => {
                console.log(`  - ${p.name} (published: ${p.is_published})`);
            });
        } else {
            console.log('No category with "WC" in name found');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testPublicCategories();
