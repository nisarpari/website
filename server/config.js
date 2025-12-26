require('dotenv').config();

// Odoo Configuration from environment variables
const ODOO_CONFIG = {
    baseUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
    database: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
    apiKey: process.env.ODOO_API_KEY || 'de6b7193044f410d428e101981088632cbbfb587',
};

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

// GCC Countries for verification
const GCC_COUNTRIES = {
    'OM': { name: 'Oman', code: '+968', flag: '🇴🇲' },
    'AE': { name: 'UAE', code: '+971', flag: '🇦🇪' },
    'SA': { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    'QA': { name: 'Qatar', code: '+974', flag: '🇶🇦' },
    'KW': { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
    'BH': { name: 'Bahrain', code: '+973', flag: '🇧🇭' }
};

// Admin password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bella2024';

// Server port
const PORT = process.env.PORT || 3001;

module.exports = {
    ODOO_CONFIG,
    COUNTRY_NAMES,
    GCC_COUNTRIES,
    ADMIN_PASSWORD,
    PORT
};
