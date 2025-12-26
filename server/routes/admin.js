const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { checkAdminAuth, upload } = require('../middleware');
const { ADMIN_PASSWORD } = require('../config');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'site-config.json');

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

// Upload image (requires auth)
router.post('/upload', checkAdminAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
    }
    const imagePath = `/images/${req.body.folder || 'uploads'}/${req.file.filename}`;
    res.json({ success: true, path: imagePath, filename: req.file.filename });
});

module.exports = router;
