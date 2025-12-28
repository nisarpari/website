'use client';

import { ODOO_CONFIG, MOCK_PRODUCTS, MOCK_CATEGORIES } from './config';

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
    if (!ODOO_CONFIG.useOdoo) return MOCK_PRODUCTS;
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', String(filters.category));
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.search) params.append('q', filters.search);

      const url = filters.category || filters.minPrice || filters.maxPrice || filters.search
        ? `${ODOO_CONFIG.baseUrl}/api/search?${params.toString()}`
        : `${ODOO_CONFIG.baseUrl}/api/products`;

      const response = await fetch(url);
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return MOCK_PRODUCTS;
    }
  },

  async fetchPublicCategories(): Promise<Category[]> {
    if (!ODOO_CONFIG.useOdoo) return MOCK_CATEGORIES;
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/public-categories`);
      const categories = await response.json();
      if (categories.error) throw new Error(categories.error);
      return categories;
    } catch (error) {
      console.error('Failed to fetch public categories:', error);
      return MOCK_CATEGORIES;
    }
  },

  async fetchProductsByPublicCategory(categoryId: number, limit?: number): Promise<Product[]> {
    // Helper to get mock products for category
    const getMockProducts = () => {
      const category = MOCK_CATEGORIES.find(c => c.id === categoryId);
      const childIds = category?.childIds || [];
      const allCategoryIds = [categoryId, ...childIds];
      const filtered = MOCK_PRODUCTS.filter(p => allCategoryIds.includes(p.categoryId || 0));
      const result = filtered.length > 0 ? filtered : MOCK_PRODUCTS.slice(0, 6);
      return limit ? result.slice(0, limit) : result;
    };

    if (!ODOO_CONFIG.useOdoo) {
      return getMockProducts();
    }
    try {
      const url = limit
        ? `${ODOO_CONFIG.baseUrl}/api/products/public-category/${categoryId}?limit=${limit}`
        : `${ODOO_CONFIG.baseUrl}/api/products/public-category/${categoryId}`;
      const response = await fetch(url);
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products.length > 0 ? products : getMockProducts();
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return getMockProducts();
    }
  },

  async fetchProductBySlug(slug: string): Promise<Product | null> {
    if (!ODOO_CONFIG.useOdoo) {
      const match = slug.match(/-(\d+)$/);
      const id = match ? parseInt(match[1]) : 0;
      return MOCK_PRODUCTS.find(p => p.id === id) || null;
    }
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/products/by-slug/${slug}`);
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
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/ribbons`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ribbons:', error);
      return [];
    }
  },

  async fetchBestsellers(limit = 8): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return MOCK_PRODUCTS.slice(0, limit);
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/products/popular/bestsellers?limit=${limit}`);
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products.length > 0 ? products : MOCK_PRODUCTS.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch bestsellers:', error);
      return MOCK_PRODUCTS.slice(0, limit);
    }
  },

  async fetchNewArrivals(limit = 8): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return MOCK_PRODUCTS.slice(0, limit);
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/products/popular/new-arrivals?limit=${limit}`);
      const products = await response.json();
      if (products.error) throw new Error(products.error);
      return products.length > 0 ? products : MOCK_PRODUCTS.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
      return MOCK_PRODUCTS.slice(0, limit);
    }
  },

  async fetchCategoryImages(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/admin/category-images`);
      const images = await response.json();
      return images || {};
    } catch (error) {
      console.error('Failed to fetch category images:', error);
      return {};
    }
  },

  async fetchHeroImages(): Promise<Array<{ url: string; alt: string }>> {
    try {
      const response = await fetch(`${ODOO_CONFIG.baseUrl}/api/admin/config`);
      const config = await response.json();
      return config?.heroImages || [];
    } catch (error) {
      console.error('Failed to fetch hero images:', error);
      return [];
    }
  },

  async fetchRandomFromCategory(categoryId: number, excludeProductId: number, limit = 8): Promise<Product[]> {
    if (!ODOO_CONFIG.useOdoo) return MOCK_PRODUCTS.slice(0, limit);
    try {
      const response = await fetch(
        `${ODOO_CONFIG.baseUrl}/api/products/random-from-category/${categoryId}?exclude=${excludeProductId}&limit=${limit}`
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
