import type {
  Product,
  Category,
  CategoryTree,
  Ribbon,
  QuotationRequest,
  QuotationResponse,
  TrackSearchResult,
} from "./types";
import { getApiUrl } from "./config";

const API_BASE_URL = getApiUrl();

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Products API
export const productsApi = {
  getAll: (limit = 500, offset = 0): Promise<Product[]> =>
    fetchApi(`/api/products?limit=${limit}&offset=${offset}`),

  getById: (id: number): Promise<Product> =>
    fetchApi(`/api/products/${id}`),

  getBySlug: (slug: string): Promise<Product> =>
    fetchApi(`/api/product/by-slug/${slug}`),

  getByCategory: (categoryId: number): Promise<Product[]> =>
    fetchApi(`/api/products/category/${categoryId}`),

  getByPublicCategory: (categoryId: number): Promise<Product[]> =>
    fetchApi(`/api/products/public-category/${categoryId}`),

  search: (query: string, filters?: {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    sort?: "price-low" | "price-high" | "name";
  }): Promise<Product[]> => {
    const params = new URLSearchParams({ q: query });
    if (filters?.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters?.category) params.set("category", filters.category);
    if (filters?.sort) params.set("sort", filters.sort);
    return fetchApi(`/api/search?${params.toString()}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: (): Promise<Category[]> =>
    fetchApi("/api/categories"),

  getTree: (): Promise<CategoryTree[]> =>
    fetchApi("/api/categories/tree"),

  getPublic: (): Promise<Category[]> =>
    fetchApi("/api/public-categories"),

  getPublicTree: (): Promise<CategoryTree[]> =>
    fetchApi("/api/public-categories/tree"),
};

// Ribbons API
export const ribbonsApi = {
  getAll: (): Promise<Ribbon[]> =>
    fetchApi("/api/ribbons"),
};

// Quotation API
export const quotationApi = {
  submit: (data: QuotationRequest): Promise<QuotationResponse> =>
    fetchApi("/api/quotation/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getStatus: (orderRef: string): Promise<{ success: boolean; quotation: unknown }> =>
    fetchApi(`/api/quotation/status/${orderRef}`),
};

// Track Order API
export const trackApi = {
  search: (query: string): Promise<TrackSearchResult> =>
    fetchApi(`/api/track/search?query=${encodeURIComponent(query)}`),

  getOrderDetails: (orderId: number): Promise<{ success: boolean; order: unknown }> =>
    fetchApi(`/api/track/order/${orderId}`),

  getDeliveryDetails: (deliveryId: number): Promise<{ success: boolean; delivery: unknown }> =>
    fetchApi(`/api/track/delivery/${deliveryId}`),
};

// Contact API
export const contactApi = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<{ success: boolean; leadId: number }> =>
    fetchApi("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Admin API
export const adminApi = {
  getConfig: (): Promise<unknown> =>
    fetchApi("/api/admin/config"),

  login: (password: string): Promise<{ success: boolean; token: string }> =>
    fetchApi("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};

// Cache API
export const cacheApi = {
  clear: (): Promise<{ success: boolean; message: string }> =>
    fetchApi("/api/cache/clear", { method: "POST" }),
};
