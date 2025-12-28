const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { checkAdminAuth, upload } = require('../middleware');
const { ADMIN_PASSWORD, PORT } = require('../config');
const { processUploadedImage } = require('../imageProcessor');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'site-config.json');

// Helper to get full image URL
const getFullImageUrl = (req, imagePath) => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}${imagePath}`;
};

// Get site config (public)
router.get('/config', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read config' });
    }
});

// Update site config (requires auth)
router.put('/config', checkAdminAuth, (req, res) => {
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
router.patch('/config/:section', checkAdminAuth, (req, res) => {
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
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Upload image (requires auth) - with compression and responsive variants
router.post('/upload', checkAdminAuth, upload.single('image'), processUploadedImage, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
    }
    const folder = req.body.folder || 'uploads';
    const imagePath = `/images/${folder}/${req.file.filename}`;
    const fullUrl = getFullImageUrl(req, imagePath);

    // Build variant URLs
    const variants = {};
    if (req.processedVariants) {
        for (const [variant, path] of Object.entries(req.processedVariants)) {
            variants[variant] = getFullImageUrl(req, path);
        }
    }

    res.json({
        success: true,
        path: imagePath,
        url: fullUrl,
        filename: req.file.filename,
        variants
    });
});

// Get category images config
router.get('/category-images', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        res.json(config.categoryImages || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to read category images' });
    }
});

// Update category image (by category ID or slug)
router.put('/category-images/:categoryId', checkAdminAuth, (req, res) => {
    try {
        const { categoryId } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (!config.categoryImages) {
            config.categoryImages = {};
        }

        config.categoryImages[categoryId] = imageUrl;
        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        res.json({ success: true, categoryId, imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category image' });
    }
});

// Upload category image and update config - with compression
router.post('/category-images/:categoryId/upload', checkAdminAuth, upload.single('image'), processUploadedImage, (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Store in categories folder - use full URL so frontend can load from API server
        const imagePath = `/images/categories/${req.file.filename}`;
        const fullUrl = getFullImageUrl(req, imagePath);

        // Build variant URLs for responsive images
        const variants = {};
        if (req.processedVariants) {
            for (const [variant, path] of Object.entries(req.processedVariants)) {
                variants[variant] = getFullImageUrl(req, path);
            }
        }

        // Update config with full URL (desktop version as main)
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (!config.categoryImages) {
            config.categoryImages = {};
        }

        // Store main image URL and variants
        config.categoryImages[categoryId] = fullUrl;

        // Optionally store variants separately for future use
        if (!config.categoryImageVariants) {
            config.categoryImageVariants = {};
        }
        if (Object.keys(variants).length > 0) {
            config.categoryImageVariants[categoryId] = variants;
        }

        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        res.json({
            success: true,
            categoryId,
            imageUrl: fullUrl,
            variants
        });
    } catch (error) {
        console.error('Category image upload error:', error);
        res.status(500).json({ error: 'Failed to upload category image' });
    }
});

// Delete category image
router.delete('/category-images/:categoryId', checkAdminAuth, (req, res) => {
    try {
        const { categoryId } = req.params;
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

        if (config.categoryImages && config.categoryImages[categoryId]) {
            delete config.categoryImages[categoryId];
            config.lastUpdated = new Date().toISOString();
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        }

        res.json({ success: true, categoryId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category image' });
    }
});

// Toggle category visibility on homepage
router.post('/categories/:categoryId/toggle-visibility', checkAdminAuth, (req, res) => {
    try {
        const { categoryId } = req.params;
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

        if (!config.hiddenCategories) {
            config.hiddenCategories = [];
        }

        const index = config.hiddenCategories.indexOf(categoryId);
        let isHidden;

        if (index === -1) {
            // Add to hidden list
            config.hiddenCategories.push(categoryId);
            isHidden = true;
        } else {
            // Remove from hidden list
            config.hiddenCategories.splice(index, 1);
            isHidden = false;
        }

        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        res.json({ success: true, categoryId, isHidden });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle category visibility' });
    }
});

// Get hidden categories list
router.get('/hidden-categories', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        res.json(config.hiddenCategories || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read hidden categories' });
    }
});

// Default hero images
const DEFAULT_HERO_IMAGES = [
    { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80', alt: 'Modern Freestanding Bathtub' },
    { url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80', alt: 'Luxury Jacuzzi Spa' },
    { url: 'https://images.unsplash.com/photo-1629774631753-88f827bf6447?w=1200&q=80', alt: 'Modern Rain Shower' },
    { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80', alt: 'Elegant Soaking Tub' },
    { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80', alt: 'Contemporary Walk-in Shower' }
];

// Get hero images
router.get('/hero-images', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        res.json(config.heroImages || DEFAULT_HERO_IMAGES);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read hero images' });
    }
});

// Update hero image by index
router.put('/hero-images/:index', checkAdminAuth, (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const { url, alt } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (!config.heroImages) {
            config.heroImages = [...DEFAULT_HERO_IMAGES];
        }

        // Ensure the index exists
        while (config.heroImages.length <= index) {
            config.heroImages.push({ url: '', alt: '' });
        }

        config.heroImages[index] = {
            url,
            alt: alt || config.heroImages[index]?.alt || `Hero Image ${index + 1}`
        };
        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        res.json({ success: true, index, url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update hero image' });
    }
});

// Upload hero image and update config - with compression
router.post('/hero-images/:index/upload', checkAdminAuth, upload.single('image'), processUploadedImage, (req, res) => {
    try {
        const index = parseInt(req.params.index);

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Store in hero folder - use full URL so frontend can load from API server
        const imagePath = `/images/hero/${req.file.filename}`;
        const fullUrl = getFullImageUrl(req, imagePath);

        // Build variant URLs for responsive images
        const variants = {};
        if (req.processedVariants) {
            for (const [variant, path] of Object.entries(req.processedVariants)) {
                variants[variant] = getFullImageUrl(req, path);
            }
        }

        // Update config
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (!config.heroImages) {
            config.heroImages = [...DEFAULT_HERO_IMAGES];
        }

        // Ensure the index exists
        while (config.heroImages.length <= index) {
            config.heroImages.push({ url: '', alt: '', variants: {} });
        }

        config.heroImages[index] = {
            url: fullUrl,
            alt: config.heroImages[index]?.alt || `Hero Image ${index + 1}`,
            variants: variants
        };
        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        res.json({
            success: true,
            index,
            url: fullUrl,
            variants
        });
    } catch (error) {
        console.error('Hero image upload error:', error);
        res.status(500).json({ error: 'Failed to upload hero image' });
    }
});

module.exports = router;
