# SEO Migration Plan: bellabathwares.com

## Overview
Migrating from the current Odoo-based website to the new Next.js website while preserving SEO rankings.

---

## URL Pattern Comparison

| Page Type | Current Site (bellabathwares.com) | New Site |
|-----------|-----------------------------------|----------|
| **Products** | `/shop/[product-slug]-[id]?category=[id]` | `/product/[slug]` |
| **Categories** | `/shop/category/[name]-[id]` | `/category/[id]` or `/shop?category=[id]` |
| **Shop** | `/shop` | `/shop` |
| **Cart** | `/shop/cart` | `/cart` |
| **Wishlist** | `/shop/wishlist` | `/wishlist` |
| **About** | `/about` | `/about` |
| **Direct categories** | `/faucets`, `/cabinets`, `/jacuzzis`, etc. | Not yet implemented |

### Example URL Mappings

**Products:**
- OLD: `/shop/sft38-205d-in-wall-touch-less-faucet-chrome-16397?category=39`
- NEW: `/product/sft38-205d-in-wall-touch-less-faucet-chrome-16397`

**Categories:**
- OLD: `/shop/category/washroom-faucets-39`
- NEW: `/category/39` or `/shop?category=39`

---

## Implementation Tasks

### 1. Add 301 Redirects in next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ... existing patterns
    ],
  },

  async redirects() {
    return [
      // Product redirects: /shop/product-name-123 → /product/product-name-123
      {
        source: '/shop/:slug((?!category|cart|wishlist)[^/]+)',
        destination: '/product/:slug',
        permanent: true,
      },

      // Category page redirects: /shop/category/name-123 → /category/123
      {
        source: '/shop/category/:slug*-:id(\\d+)',
        destination: '/category/:id',
        permanent: true,
      },

      // Cart redirect
      {
        source: '/shop/cart',
        destination: '/cart',
        permanent: true,
      },

      // Wishlist redirect
      {
        source: '/shop/wishlist',
        destination: '/wishlist',
        permanent: true,
      },

      // User account redirects
      {
        source: '/my/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/my/orders',
        destination: '/track',
        permanent: true,
      },
      {
        source: '/my/account',
        destination: '/',
        permanent: true,
      },

      // Direct category slug redirects (map old slugs to category IDs)
      // TODO: Add all category mappings
      {
        source: '/faucets',
        destination: '/shop?category=39',
        permanent: true,
      },
      {
        source: '/cabinets',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/jacuzzis',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/bathtubs',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/sensor-faucets',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/art-basins',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/wall-hung-basins',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/concealed-showers',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },
      {
        source: '/shower-mixers',
        destination: '/shop?category=XX', // Replace XX with actual ID
        permanent: true,
      },

      // Special pages
      {
        source: '/smart_products',
        destination: '/shop', // Or create dedicated page
        permanent: true,
      },
      {
        source: '/hygiene-pro',
        destination: '/shop', // Or create dedicated page
        permanent: true,
      },
      {
        source: '/bella-italian-collections',
        destination: '/shop', // Or create dedicated page
        permanent: true,
      },
      {
        source: '/collections',
        destination: '/shop',
        permanent: true,
      },

      // Terms page
      {
        source: '/terms-conditions',
        destination: '/about', // Or create dedicated terms page
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

---

### 2. Create XML Sitemap

Create file: `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { OdooAPI } from '@/lib/api/odoo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.bellabathwares.com';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  // Fetch categories
  const categories = await OdooAPI.fetchPublicCategories();
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch products (you may need to implement pagination for large catalogs)
  const products = await OdooAPI.fetchProducts();
  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
```

---

### 3. Add robots.txt

Create file: `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/checkout', '/cart'],
    },
    sitemap: 'https://www.bellabathwares.com/sitemap.xml',
  };
}
```

---

### 4. Add Meta Tags to Layout

Update `src/app/layout.tsx` with proper metadata:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Bella Bathwares - Premium Bathroom Fixtures & Accessories',
    template: '%s | Bella Bathwares',
  },
  description: 'Discover premium bathroom fixtures, faucets, basins, bathtubs, and accessories at Bella Bathwares. Quality Italian designs for your home.',
  keywords: ['bathroom fixtures', 'faucets', 'basins', 'bathtubs', 'bathroom accessories', 'Italian bathware'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.bellabathwares.com',
    siteName: 'Bella Bathwares',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bella Bathwares',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.bellabathwares.com',
  },
};
```

---

### 5. Add Structured Data (JSON-LD)

Create `src/components/StructuredData.tsx`:

```typescript
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bella Bathwares',
    url: 'https://www.bellabathwares.com',
    logo: 'https://www.bellabathwares.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'AED',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## Post-Migration Checklist

### Before Go-Live
- [ ] Test all redirect rules locally
- [ ] Verify sitemap generates correctly
- [ ] Check robots.txt is accessible
- [ ] Ensure all meta tags are in place
- [ ] Test structured data with Google's Rich Results Test

### Go-Live Day
- [ ] Deploy the new site
- [ ] Verify redirects work in production
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing of key pages

### After Go-Live
- [ ] Monitor Google Search Console for crawl errors
- [ ] Check "Coverage" report for indexing issues
- [ ] Monitor "Core Web Vitals" for performance
- [ ] Track rankings for key terms
- [ ] Update Google Business Profile URL (if applicable)
- [ ] Update any external links/directories pointing to old URLs

---

## Category ID Mapping (To Complete)

Get the actual category IDs from Odoo and fill in this mapping:

| Old Slug | Category Name | New Category ID |
|----------|---------------|-----------------|
| `/faucets` | Washroom Faucets | 39 |
| `/cabinets` | Cabinets | ? |
| `/jacuzzis` | Jacuzzis | ? |
| `/bathtubs` | Bathtubs | ? |
| `/sensor-faucets` | Sensor Faucets | ? |
| `/art-basins` | Art Basins | ? |
| `/wall-hung-basins` | Wall Hung Basins | ? |
| `/concealed-showers` | Concealed Showers | ? |
| `/shower-mixers` | Shower Mixers | ? |

---

## Notes

- 301 redirects pass ~90-99% of link equity to the new URL
- Google typically processes redirects within a few days to weeks
- Keep the redirects in place permanently (at least 1 year minimum)
- Monitor Search Console for any 404 errors and add redirects as needed
