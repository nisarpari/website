# AquaLux Sanitaryware Website - Odoo Integration Guide

## Overview

This website is designed to sync products directly from your Odoo 19 instance. The integration uses Odoo's REST API (or XML-RPC for older versions).

---

## Quick Setup (3 Steps)

### Step 1: Enable API Access in Odoo 19

1. **Go to Settings → Technical → API Keys**
2. **Generate a new API key** for website integration
3. **Note down:**
   - Your Odoo URL (e.g., `https://yourdomain.odoo.com`)
   - Database name
   - API Key

### Step 2: Update Website Configuration

Open `index.html` and find the `ODOO_CONFIG` section (around line 38):

```javascript
const ODOO_CONFIG = {
    baseUrl: 'https://erp.bellastore.in', // ← Your Odoo URL
    database: 'Dec8',                  // ← Your database name
    apiKey: '29f68d396f385ce533f1701072a62020d72d3aa9

',                     // ← Your API key
    useOdoo: true                               // ← Change to true
};
```

### Step 3: Deploy

Upload the files to your web hosting. The website will now fetch products from Odoo!

---

## Detailed Odoo Setup

### Required Odoo Modules

Ensure these modules are installed in Odoo 19:
- `website` (for product images)
- `sale` or `website_sale` (for product catalog)
- `product` (core product management)

### Product Configuration in Odoo

For products to display correctly, ensure each product has:

| Field | Odoo Field Name | Required |
|-------|-----------------|----------|
| Name | `name` | ✅ Yes |
| Price | `list_price` | ✅ Yes |
| Category | `categ_id` | ✅ Yes |
| Image | `image_1920` | Recommended |
| SKU | `default_code` | Optional |
| Description | `description_sale` | Optional |
| Color Attribute | `product_template_attribute_value_ids` | For color filter |

### Category Setup

Create product categories in Odoo matching your sanitaryware types:
1. Go to **Inventory → Configuration → Product Categories**
2. Create categories:
   - Showers
   - Shower Columns
   - Wash Basins
   - Basin Mixers
   - Single Piece WC
   - Wall Hung Toilets
   - Concealed Cisterns
   - Shattafs
   - Jacuzzi
   - Bathtubs
   - Sauna
   - Steam Rooms
   - Switches
   - Exhaust Fans
   - Lights

---

## API Endpoints Used

The website uses these Odoo API calls:

### Fetch Products
```javascript
POST /web/dataset/call_kw

{
    "model": "product.template",
    "method": "search_read",
    "args": [[]],
    "kwargs": {
        "fields": ["id", "name", "list_price", "categ_id", "image_1920", "description_sale", "default_code"],
        "limit": 100
    }
}
```

### Fetch Categories
```javascript
POST /web/dataset/call_kw

{
    "model": "product.category",
    "method": "search_read",
    "args": [[]],
    "kwargs": {
        "fields": ["id", "name", "parent_id"]
    }
}
```

### Product Images
Images are served from:
```
{ODOO_URL}/web/image/product.template/{PRODUCT_ID}/image_1920
```

---

## Alternative: Backend Proxy (Recommended for Production)

For production, we recommend using a backend proxy to:
1. **Hide API credentials** from frontend code
2. **Cache product data** for faster loading
3. **Handle CORS issues**

### Node.js Proxy Example

See `odoo-proxy-server.js` in this package.

### Python/Flask Proxy Example

See `odoo_proxy.py` in this package.

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:

**Option A:** Enable CORS in Odoo Nginx config:
```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
}
```

**Option B:** Use the backend proxy (recommended)

### Products Not Loading
1. Check browser console for errors
2. Verify API key is correct
3. Ensure products are published in Odoo
4. Check if `list_price` is set (products with $0 may be filtered)

### Images Not Showing
1. Ensure images are uploaded in Odoo (Image field)
2. Check if Odoo allows public access to images
3. Try accessing image URL directly in browser

---

## Color Attribute Integration

To enable color filtering, set up product attributes in Odoo:

1. Go to **Products → Attributes**
2. Create attribute: **Color**
3. Add values: Chrome, Matte Black, Gold, Rose Gold, Brushed Nickel, White, Copper
4. Assign color attribute to products

The website will read from `product_template_attribute_value_ids`.

---

## Performance Tips

1. **Pagination:** The default limit is 100 products. For large catalogs, implement pagination.
2. **Image Optimization:** Consider using Odoo's image resizing: `/web/image/product.template/{id}/image_512`
3. **Caching:** Implement caching layer for product data (Redis, localStorage, etc.)

---

## Support

For Odoo integration support:
- Odoo Documentation: https://www.odoo.com/documentation/17.0/
- Odoo REST API: https://www.odoo.com/documentation/17.0/developer/reference/external_api.html

For website customization, modify the React components in `index.html`.
