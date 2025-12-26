const axios = require('axios');
const { ODOO_CONFIG } = require('../config');

// Helper function for Odoo JSON-RPC API calls
async function odooApiCall(model, method, args = [], kwargs = {}) {
    try {
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

module.exports = { odooApiCall };
