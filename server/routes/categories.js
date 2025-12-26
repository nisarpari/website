const express = require('express');
const router = express.Router();
const axios = require('axios');
const { odooApiCall } = require('../utils/odoo');
const { categoryCache, publicCategoryCache } = require('../utils/cache');
const { PORT } = require('../config');

// Get all internal categories with hierarchy
router.get('/', async (req, res) => {
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

        // Update cache
        categoryCache.data = filteredCategories;
        categoryCache.timestamp = Date.now();

        res.json(filteredCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get category hierarchy (tree structure)
router.get('/tree', async (req, res) => {
    try {
        let categories = categoryCache.data;
        if (!categories || Date.now() - categoryCache.timestamp >= categoryCache.ttl) {
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
router.get('/public', async (req, res) => {
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
router.get('/public/tree', async (req, res) => {
    try {
        let categories = publicCategoryCache.data;
        if (!categories || Date.now() - publicCategoryCache.timestamp >= publicCategoryCache.ttl) {
            const response = await axios.get(`http://localhost:${PORT}/api/categories/public`);
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

module.exports = router;
