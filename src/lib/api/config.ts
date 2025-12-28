// ODOO Configuration - Using Proxy Server
export const ODOO_CONFIG = {
  // Use localhost API for local testing, relative URL for Vercel
  baseUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : '',
  proxyUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : '',
  useOdoo: true
};

// Mock Categories
export const MOCK_CATEGORIES = [
  // Root categories
  { id: 1, name: 'Collections', slug: 'collections', totalCount: 150, childIds: [10, 11, 12], parentId: null },
  { id: 2, name: 'Bathroom', slug: 'bathroom', totalCount: 200, childIds: [20, 21, 22, 23], parentId: null },
  { id: 3, name: 'Bath Essentials', slug: 'bath-essentials', totalCount: 120, childIds: [30, 31, 32], parentId: null },
  { id: 4, name: 'Washroom', slug: 'washroom', totalCount: 100, childIds: [40, 41, 42], parentId: null },
  { id: 5, name: 'Washlet', slug: 'washlet', totalCount: 60, childIds: [50, 51], parentId: null },
  { id: 6, name: 'Wellness', slug: 'wellness', totalCount: 80, childIds: [60, 61, 62], parentId: null },
  // Collections children
  { id: 10, name: 'Premium Series', slug: 'premium-series', totalCount: 50, childIds: [], parentId: 1 },
  { id: 11, name: 'Classic Collection', slug: 'classic-collection', totalCount: 50, childIds: [], parentId: 1 },
  { id: 12, name: 'Modern Line', slug: 'modern-line', totalCount: 50, childIds: [], parentId: 1 },
  // Bathroom children
  { id: 20, name: 'Basin Mixers', slug: 'basin-mixers', totalCount: 60, childIds: [], parentId: 2 },
  { id: 21, name: 'Shower Systems', slug: 'shower-systems', totalCount: 50, childIds: [], parentId: 2 },
  { id: 22, name: 'Bathtubs', slug: 'bathtubs', totalCount: 40, childIds: [], parentId: 2 },
  { id: 23, name: 'Bathroom Accessories', slug: 'bathroom-accessories', totalCount: 50, childIds: [], parentId: 2 },
  // Bath Essentials children
  { id: 30, name: 'Faucets', slug: 'faucets', totalCount: 40, childIds: [], parentId: 3 },
  { id: 31, name: 'Showers', slug: 'showers', totalCount: 40, childIds: [], parentId: 3 },
  { id: 32, name: 'Drains', slug: 'drains', totalCount: 40, childIds: [], parentId: 3 },
  // Washroom children
  { id: 40, name: 'Toilets', slug: 'toilets', totalCount: 35, childIds: [], parentId: 4 },
  { id: 41, name: 'Urinals', slug: 'urinals', totalCount: 30, childIds: [], parentId: 4 },
  { id: 42, name: 'Basins', slug: 'basins', totalCount: 35, childIds: [], parentId: 4 },
  // Washlet children
  { id: 50, name: 'Smart Toilets', slug: 'smart-toilets', totalCount: 30, childIds: [], parentId: 5 },
  { id: 51, name: 'Bidet Seats', slug: 'bidet-seats', totalCount: 30, childIds: [], parentId: 5 },
  // Wellness children
  { id: 60, name: 'Jacuzzi', slug: 'jacuzzi', totalCount: 30, childIds: [], parentId: 6 },
  { id: 61, name: 'Steam Rooms', slug: 'steam-rooms', totalCount: 25, childIds: [], parentId: 6 },
  { id: 62, name: 'Spa Equipment', slug: 'spa-equipment', totalCount: 25, childIds: [], parentId: 6 },
];

// Mock Products
export const MOCK_PRODUCTS = [
  // Basin Mixers (categoryId: 20)
  { id: 1, name: 'Premium Basin Mixer Chrome', price: 299, category: 'Basin Mixers', categoryId: 20, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'premium-basin-mixer-chrome-1', inStock: true },
  { id: 2, name: 'Luxury Gold Basin Mixer', price: 449, category: 'Basin Mixers', categoryId: 20, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80', slug: 'luxury-gold-basin-mixer-2', inStock: true },
  { id: 3, name: 'Modern Matte Black Mixer', price: 389, category: 'Basin Mixers', categoryId: 20, image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80', slug: 'modern-matte-black-mixer-3', inStock: true },
  // Shower Systems (categoryId: 21)
  { id: 4, name: 'Rainfall Shower System', price: 599, category: 'Shower Systems', categoryId: 21, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80', slug: 'rainfall-shower-system-4', inStock: true },
  { id: 5, name: 'Thermostatic Shower Set', price: 749, category: 'Shower Systems', categoryId: 21, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'thermostatic-shower-set-5', inStock: true },
  // Bathtubs (categoryId: 22)
  { id: 6, name: 'Freestanding Acrylic Bathtub', price: 1299, category: 'Bathtubs', categoryId: 22, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', slug: 'freestanding-acrylic-bathtub-6', inStock: true },
  { id: 7, name: 'Corner Jacuzzi Tub', price: 2499, category: 'Bathtubs', categoryId: 22, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'corner-jacuzzi-tub-7', inStock: true },
  // Faucets (categoryId: 30)
  { id: 8, name: 'Classic Chrome Faucet', price: 199, category: 'Faucets', categoryId: 30, image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80', slug: 'classic-chrome-faucet-8', inStock: true },
  { id: 9, name: 'Waterfall Faucet Gold', price: 349, category: 'Faucets', categoryId: 30, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80', slug: 'waterfall-faucet-gold-9', inStock: true },
  // Showers (categoryId: 31)
  { id: 10, name: 'Handheld Shower Head', price: 89, category: 'Showers', categoryId: 31, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'handheld-shower-head-10', inStock: true },
  { id: 11, name: 'LED Rain Shower Head', price: 159, category: 'Showers', categoryId: 31, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80', slug: 'led-rain-shower-head-11', inStock: true },
  // Drains (categoryId: 32)
  { id: 12, name: 'Linear Floor Drain', price: 129, category: 'Drains', categoryId: 32, image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80', slug: 'linear-floor-drain-12', inStock: true },
  { id: 13, name: 'Pop-Up Basin Drain', price: 49, category: 'Drains', categoryId: 32, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'pop-up-basin-drain-13', inStock: true },
  // Toilets (categoryId: 40)
  { id: 14, name: 'Wall Hung Toilet', price: 699, category: 'Toilets', categoryId: 40, image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80', slug: 'wall-hung-toilet-14', inStock: true },
  { id: 15, name: 'One-Piece Modern Toilet', price: 549, category: 'Toilets', categoryId: 40, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'one-piece-modern-toilet-15', inStock: true },
  // Basins (categoryId: 42)
  { id: 16, name: 'Vessel Sink Round', price: 249, category: 'Basins', categoryId: 42, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80', slug: 'vessel-sink-round-16', inStock: true },
  { id: 17, name: 'Undermount Basin', price: 299, category: 'Basins', categoryId: 42, image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80', slug: 'undermount-basin-17', inStock: true },
  // Jacuzzi (categoryId: 60)
  { id: 18, name: 'Luxury Spa Jacuzzi', price: 4999, category: 'Jacuzzi', categoryId: 60, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', slug: 'luxury-spa-jacuzzi-18', inStock: true },
  { id: 19, name: 'Outdoor Hot Tub', price: 3999, category: 'Jacuzzi', categoryId: 60, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', slug: 'outdoor-hot-tub-19', inStock: true },
  // Smart Toilets (categoryId: 50)
  { id: 20, name: 'Smart Bidet Toilet', price: 1999, category: 'Smart Toilets', categoryId: 50, image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80', slug: 'smart-bidet-toilet-20', inStock: true },
];

export const COLORS = [
  { name: 'Chrome', hex: '#C0C0C0' },
  { name: 'Matte Black', hex: '#1a1a1a' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Brushed Nickel', hex: '#8B8682' },
  { name: 'White', hex: '#FFFFFF' },
];
