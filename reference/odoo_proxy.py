"""
AquaLux - Odoo API Proxy Server (Python/Flask)

Alternative to Node.js proxy for those who prefer Python.

Setup:
    pip install flask flask-cors requests python-dotenv
    python odoo_proxy.py

Or with gunicorn for production:
    pip install gunicorn
    gunicorn -w 4 -b 0.0.0.0:3001 odoo_proxy:app
"""

import os
import time
import requests
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Odoo Configuration
ODOO_CONFIG = {
    'base_url': os.getenv('ODOO_URL', 'https://your-odoo-instance.com'),
    'database': os.getenv('ODOO_DATABASE', 'your_database'),
    'api_key': os.getenv('ODOO_API_KEY', 'your_api_key'),
}

# Simple cache
cache = {
    'products': {'data': None, 'timestamp': 0, 'ttl': 300},  # 5 minutes
    'categories': {'data': None, 'timestamp': 0, 'ttl': 1800},  # 30 minutes
}


def odoo_api_call(model, method, args=None, kwargs=None):
    """Make a call to Odoo's JSON-RPC API"""
    if args is None:
        args = []
    if kwargs is None:
        kwargs = {}
    
    url = f"{ODOO_CONFIG['base_url']}/web/dataset/call_kw"
    
    payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': {
            'model': model,
            'method': method,
            'args': args,
            'kwargs': kwargs
        },
        'id': int(time.time() * 1000)
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {ODOO_CONFIG['api_key']}"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    if 'error' in result:
        raise Exception(result['error'].get('message', 'Unknown error'))
    
    return result.get('result')


def transform_product(product):
    """Transform Odoo product to website format"""
    return {
        'id': product['id'],
        'name': product['name'],
        'price': product.get('list_price', 0),
        'category': product['categ_id'][1] if product.get('categ_id') else 'Uncategorized',
        'categoryId': product['categ_id'][0] if product.get('categ_id') else None,
        'image': f"{ODOO_CONFIG['base_url']}/web/image/product.template/{product['id']}/image_1920",
        'thumbnail': f"{ODOO_CONFIG['base_url']}/web/image/product.template/{product['id']}/image_512",
        'description': product.get('description_sale', ''),
        'sku': product.get('default_code', ''),
        'rating': 4.5,  # Placeholder
        'color': 'Chrome',  # Default - customize based on your attribute setup
    }


def get_cached(key, fetch_func):
    """Get data from cache or fetch fresh"""
    cache_entry = cache.get(key, {})
    now = time.time()
    
    if cache_entry.get('data') and (now - cache_entry.get('timestamp', 0)) < cache_entry.get('ttl', 0):
        return cache_entry['data']
    
    data = fetch_func()
    cache[key] = {
        'data': data,
        'timestamp': now,
        'ttl': cache_entry.get('ttl', 300)
    }
    return data


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')})


@app.route('/api/products')
def get_products():
    try:
        def fetch():
            products = odoo_api_call(
                'product.template',
                'search_read',
                [[]],
                {
                    'fields': ['id', 'name', 'list_price', 'categ_id', 
                               'image_1920', 'description_sale', 'default_code'],
                    'limit': 500,
                    'order': 'name asc'
                }
            )
            return [transform_product(p) for p in products]
        
        products = get_cached('products', fetch)
        return jsonify(products)
    except Exception as e:
        app.logger.error(f"Error fetching products: {e}")
        return jsonify({'error': 'Failed to fetch products'}), 500


@app.route('/api/products/category/<category_name>')
def get_products_by_category(category_name):
    try:
        products = odoo_api_call(
            'product.template',
            'search_read',
            [[['categ_id.name', '=', category_name]]],
            {
                'fields': ['id', 'name', 'list_price', 'categ_id', 
                           'image_1920', 'description_sale', 'default_code'],
                'limit': 100
            }
        )
        return jsonify([transform_product(p) for p in products])
    except Exception as e:
        app.logger.error(f"Error fetching products by category: {e}")
        return jsonify({'error': 'Failed to fetch products'}), 500


@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    try:
        products = odoo_api_call(
            'product.template',
            'search_read',
            [[['id', '=', product_id]]],
            {
                'fields': ['id', 'name', 'list_price', 'categ_id', 
                           'image_1920', 'description_sale', 'default_code', 'description']
            }
        )
        
        if not products:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify(transform_product(products[0]))
    except Exception as e:
        app.logger.error(f"Error fetching product: {e}")
        return jsonify({'error': 'Failed to fetch product'}), 500


@app.route('/api/categories')
def get_categories():
    try:
        def fetch():
            categories = odoo_api_call(
                'product.category',
                'search_read',
                [[]],
                {'fields': ['id', 'name', 'parent_id']}
            )
            
            result = []
            for cat in categories:
                count = odoo_api_call(
                    'product.template',
                    'search_count',
                    [[['categ_id', '=', cat['id']]]]
                )
                result.append({
                    'id': cat['id'],
                    'name': cat['name'],
                    'slug': cat['name'].lower().replace(' ', '-'),
                    'parentId': cat['parent_id'][0] if cat.get('parent_id') else None,
                    'count': count,
                    'image': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop'
                })
            return result
        
        categories = get_cached('categories', fetch)
        return jsonify(categories)
    except Exception as e:
        app.logger.error(f"Error fetching categories: {e}")
        return jsonify({'error': 'Failed to fetch categories'}), 500


@app.route('/api/search')
def search_products():
    try:
        q = request.args.get('q', '')
        min_price = request.args.get('minPrice', type=float)
        max_price = request.args.get('maxPrice', type=float)
        category = request.args.get('category', '')
        sort = request.args.get('sort', 'name asc')
        
        # Build domain
        domain = []
        if q:
            domain.append(['name', 'ilike', q])
        if min_price is not None:
            domain.append(['list_price', '>=', min_price])
        if max_price is not None:
            domain.append(['list_price', '<=', max_price])
        if category:
            domain.append(['categ_id.name', '=', category])
        
        # Sort order
        order_map = {
            'price-low': 'list_price asc',
            'price-high': 'list_price desc',
            'rating': 'name asc',  # Placeholder
        }
        order = order_map.get(sort, 'name asc')
        
        products = odoo_api_call(
            'product.template',
            'search_read',
            [domain],
            {
                'fields': ['id', 'name', 'list_price', 'categ_id', 
                           'image_1920', 'description_sale', 'default_code'],
                'limit': 100,
                'order': order
            }
        )
        
        return jsonify([transform_product(p) for p in products])
    except Exception as e:
        app.logger.error(f"Error searching products: {e}")
        return jsonify({'error': 'Search failed'}), 500


@app.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.json
        
        lead_id = odoo_api_call(
            'crm.lead',
            'create',
            [{
                'name': f"Website Inquiry: {data.get('name', 'Unknown')}",
                'contact_name': data.get('name', ''),
                'email_from': data.get('email', ''),
                'phone': data.get('phone', ''),
                'description': data.get('message', ''),
                'type': 'lead'
            }]
        )
        
        return jsonify({'success': True, 'leadId': lead_id})
    except Exception as e:
        app.logger.error(f"Error creating lead: {e}")
        return jsonify({'error': 'Failed to submit contact form'}), 500


@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    global cache
    for key in cache:
        cache[key]['data'] = None
        cache[key]['timestamp'] = 0
    return jsonify({'success': True, 'message': 'Cache cleared'})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    print(f"🚀 AquaLux API Server running on port {port}")
    print(f"📦 Connected to Odoo: {ODOO_CONFIG['base_url']}")
    app.run(host='0.0.0.0', port=port, debug=True)
