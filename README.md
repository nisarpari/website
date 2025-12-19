# AquaLux - Premium Sanitaryware Website

A modern, responsive e-commerce website for sanitaryware products with **Odoo integration**.

![AquaLux Preview](https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=400&fit=crop)

## Features

- ✅ **Modern Design** - Luxury aesthetic with smooth animations
- ✅ **Responsive** - Works on desktop, tablet, and mobile
- ✅ **Product Catalog** - Grid layout with category tiles
- ✅ **Advanced Filtering** - Category, price range, color
- ✅ **Sorting Options** - Price (low/high), rating, featured
- ✅ **Odoo Integration** - Direct product sync from Odoo 19
- ✅ **Contact Form** - Creates leads in Odoo CRM
- ✅ **SEO Ready** - Clean structure for search engines

## Pages

1. **Home** - Hero section, category tiles, features
2. **Products** - Full catalog with filters and sorting
3. **About** - Company story, stats, values
4. **Contact** - Contact form and information

## Categories Included

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

## Quick Start

### Option 1: Static Website (No Server)

1. Open `index.html` in a browser
2. Website works with mock data
3. Perfect for design preview

### Option 2: With Odoo Integration

1. Configure Odoo credentials in `index.html`:
   ```javascript
   const ODOO_CONFIG = {
       baseUrl: 'https://your-odoo.com',
       database: 'your_db',
       apiKey: 'your_key',
       useOdoo: true  // ← Enable this
   };
   ```

2. Deploy to any web server

### Option 3: With Backend Proxy (Recommended for Production)

**Node.js:**
```bash
npm install
cp .env.example .env
# Edit .env with your Odoo credentials
npm start
```

**Python:**
```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Odoo credentials
python odoo_proxy.py
```

Then update `index.html` to use the proxy:
```javascript
const ODOO_CONFIG = {
    baseUrl: 'http://localhost:3001',  // Proxy URL
    useOdoo: true
};
```

---

## File Structure

```
sanitaryware-website/
├── index.html              # Main website (React SPA)
├── ODOO_INTEGRATION.md     # Detailed Odoo setup guide
├── odoo-proxy-server.js    # Node.js proxy server
├── odoo_proxy.py           # Python proxy server (alternative)
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

---

## Customization

### Changing Colors

Edit the Tailwind config in `index.html`:
```javascript
colors: {
    'luxury': { /* gray shades */ },
    'accent': {
        gold: '#c9a962',    // Primary accent
        copper: '#b87333',  // Secondary
        teal: '#2d6a6a',    // Tertiary
    }
}
```

### Adding Categories

Update the `CATEGORIES` array in `index.html`.

### Changing Fonts

Replace Google Fonts import and update `fontFamily` in config.

### Adding Product Details Page

Extend the `ProductCard` component to link to a details page/modal.

---

## Deployment Options

| Platform | Best For | Notes |
|----------|----------|-------|
| **Vercel** | Frontend | Deploy `index.html` directly |
| **Netlify** | Frontend | Drag and drop deployment |
| **Railway** | Full Stack | Deploy with proxy server |
| **DigitalOcean** | Full Stack | VPS with Nginx |
| **AWS S3** | Static | CloudFront CDN optional |

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

---

## Tech Stack

- **Frontend:** React 18, Tailwind CSS
- **Fonts:** Playfair Display, Outfit
- **Backend (optional):** Node.js/Express or Python/Flask
- **Integration:** Odoo 19 REST API

---

## Support

For questions about:
- **Website customization:** Modify the React components in `index.html`
- **Odoo integration:** See `ODOO_INTEGRATION.md`
- **Deployment:** Check platform-specific documentation

---

## License

MIT License - Free for commercial and personal use.

---

Made with ❤️ for AquaLux Sanitaryware
