/**
 * Bella Bathwares - Odoo API Proxy Server
 *
 * Modular Express server for the Bella Bathwares eCommerce website.
 * Acts as a proxy between the frontend and Odoo ERP.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Config
const { PORT, ODOO_CONFIG } = require('./config');

// Routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const searchRoutes = require('./routes/search');
const quotationRoutes = require('./routes/quotation');
const trackRoutes = require('./routes/track');
const verifyRoutes = require('./routes/verify');
const adminRoutes = require('./routes/admin');
const miscRoutes = require('./routes/misc');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/products', productsRoutes);
app.use('/api/product', productsRoutes);  // For /api/product/by-slug/:slug
app.use('/api/categories', categoriesRoutes);
app.use('/api/public-categories', (req, res, next) => {
    // Redirect old routes to new structure
    req.url = '/public' + req.url;
    categoriesRoutes(req, res, next);
});
app.use('/api/search', searchRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);  // For /api/health, /api/ribbons, /api/contact, /api/cache/clear

// Serve static images
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Start server
app.listen(PORT, () => {
    console.log(`Bella Bathwares API Server running on port ${PORT}`);
    console.log(`Connected to Odoo: ${ODOO_CONFIG.baseUrl}`);
});

module.exports = app;
