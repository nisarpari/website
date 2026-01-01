import { ODOO_CONFIG, MOCK_CATEGORIES } from './config';

export interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  slug: string;
}

export interface ProductDocument {
  id: number;
  name: string;
  url: string | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  categoryId?: number;
  publicCategoryIds?: number[];
  image?: string;
  thumbnail?: string;
  slug: string;
  inStock?: boolean;
  sku?: string;
  description?: string;
  images?: string[];
  variantIds?: number[];
  // Additional images from Odoo
  additionalImages?: Array<{ id: number; name: string; url: string }>;
  // Related products
  accessoryProducts?: RelatedProduct[];
  alternativeProducts?: RelatedProduct[];
  // Documents
  documents?: ProductDocument[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  totalCount?: number;
  childIds?: number[];
  parentId: number | null;
  parentName?: string | null;
  image?: string;
}

export const OdooAPI = {
  async fetchProducts(filters: { category?: number; minPrice?: number; maxPrice?: number; search?: string } = {}): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return [];
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', String(filters.category));
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.search) params.append('q', filters.search);

      const url = filters.category || filters.minPrice || filters.maxPrice || filters.search
        ? `${ODOO_CONFIG.baseUrl}/api/search?${params.toString()}`
        : `${ODOO_CONFIG.baseUrl}/api/products`;

      const response = await fetch(url, { next: { revalidate: 3600, tags: ['products'] } });
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  },

  async fetchPublicCategories(): Promise<Category[]> {
    if (!ODOO_CONFIG.useOdoo) return MOCK_CATEGORIES;
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/public-categories`, { next: { revalidate: 3600, tags: ['categories'] } });
      const categories = await response.json();
      if (categories.error) throw new Error(categories.error);
      return categories;
    } catch (error) {
      console.error('Failed to fetch public categories:', error);
      return MOCK_CATEGORIES;
    }
  },

  async fetchProductsByPublicCategory(categoryId: number, limit?: number): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) {
      return []; // No mock products in production mode
    }
    try {
      const url = limit
        ? `${ODOO_CONFIG.baseUrl}/api/products/public-category/${categoryId}?limit=${limit}`
        : `${ODOO_CONFIG.baseUrl}/api/products/public-category/${categoryId}`;
      const response = await fetch(url, { next: { revalidate: 3600, tags: [`category-${categoryId}`] } });
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products;
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return [];
    }
  },

  async fetchProductBySlug(slug: string): Promise<Product | null> {
    if (!ODOO_CONFIG.useOdoo) {
      return null;
    }
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/products/by-slug/${slug}`, { next: { revalidate: 3600, tags: [`product-${slug}`] } });
      const product = await response.json();
      if (product.error) throw new Error(product.error);
      return product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  async fetchRibbons() {
    if (!ODOO_CONFIG.useOdoo) return [];
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/ribbons`, { next: { revalidate: 86400 } }); // Cache for 24h
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ribbons:', error);
      return [];
    }
  },

  async fetchBestsellers(limit = 8): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return [];
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/products/popular/bestsellers?limit=${limit}`, { next: { revalidate: 3600 } });
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products;
    } catch (error) {
      console.error('Failed to fetch bestsellers:', error);
      return [];
    }
  },

  async fetchNewArrivals(limit = 8): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return [];
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/products/popular/new-arrivals?limit=${limit}`, { next: { revalidate: 3600 } });
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products;
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
      return [];
    }
  },

  async fetchCategoryImages(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/admin/category-images`, { next: { revalidate: 3600 } });
      const images = await response.json();
      return images || {};
    } catch (error) {
      console.error('Failed to fetch category images:', error);
      return {};
    }
  },

  async fetchHeroImages(): Promise<Array<{ url: string; alt: string }>> {
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/admin/config`, { next: { revalidate: 3600 } });
      const config = await response.json();
      return config?.heroImages || [];
    } catch (error) {
      console.error('Failed to fetch hero images:', error);
      return [];
    }
  },

  async fetchRandomFromCategory(categoryId: number, excludeProductId: number, limit = 8): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return [];
    try {
      const response = await fetch(
        `${ODOO_CONFIG.baseUrl}/api/products/random-from-category/${categoryId}?exclude=${excludeProductId}&limit=${limit}`,
        { next: { revalidate: 3600 } }
      );
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products;
    } catch (error) {
      console.error('Failed to fetch random products from category:', error);
      return [];
    }
  }
};
