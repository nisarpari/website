const axios = require('axios');
const { ODOO_CONFIG } = require('../config');

// Helper function for Odoo API calls using /web/dataset/call_kw (Odoo 20+ compatible)
async function odooApiCall(model, method, args = [], kwargs = {}) {
    try {
        const url = `${ODOO_CONFIG.baseUrl}/web/dataset/call_kw/${model}/${method}`;

        const body = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                model: model,
                method: method,
                args: args,
                kwargs: kwargs
            },
            id: Date.now()
        };

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': ODOO_CONFIG.apiKey
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

module.exports = { odooApiCall };
