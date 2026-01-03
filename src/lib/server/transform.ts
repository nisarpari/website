// Transform Odoo data to website format
import { ODOO_CONFIG } from './odoo';

interface OdooProduct {
  id: number;
  name: string;
  list_price?: number;
  categ_id?: [number, string] | false;
  public_categ_ids?: number[];
  image_1920?: string;
  description_sale?: string;
  website_description?: string;
  default_code?: string;
  qty_available?: number;
  website_url?: string;
  website_ribbon_id?: [number, string] | false;
  allow_out_of_stock_order?: boolean;
  out_of_stock_message?: string;
  show_availability?: boolean;
  available_threshold?: number;
  product_template_image_ids?: number[];
  accessory_product_ids?: number[];
  alternative_product_ids?: number[];
  barcode?: string;
  product_variant_ids?: number[];
}

export interface TransformedProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  categoryId: number | null;
  publicCategoryIds: number[];
  image: string;
  thumbnail: string;
  additionalImageIds: number[];
  description: string;
  ecommerceDescription: string;
  sku: string;
  rating: number;
  color: string;
  inStock: boolean;
  allowOutOfStock: boolean;
  outOfStockMessage: string;
  showAvailability: boolean;
  availableThreshold: number;
  qtyAvailable: number;
  ribbonId: number | null;
  ribbonName: string | null;
  accessoryProductIds: number[];
  alternativeProductIds: number[];
  documentIds: number[];
  barcode: string;
  url: string;
  slug: string;
  variantIds: number[];
}

// Extract color from product attributes
function extractColor(): string {
  return 'Chrome'; // Default color
}

// Transform Odoo product to website format
export function transformProduct(product: OdooProduct): TransformedProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.list_price || 0,
    // Internal category (for backwards compatibility)
    category: product.categ_id ? product.categ_id[1] : 'Uncategorized',
    categoryId: product.categ_id ? product.categ_id[0] : null,
    // eCommerce public categories
    publicCategoryIds: product.public_categ_ids || [],
    // Images (use CDN URL for caching via Cloudflare)
    image: `${ODOO_CONFIG.imageBaseUrl}/web/image/product.template/${product.id}/image_1920`,
    thumbnail: `${ODOO_CONFIG.imageBaseUrl}/web/image/product.template/${product.id}/image_512`,
    additionalImageIds: product.product_template_image_ids || [],
    // Description
    description: product.description_sale || '',
    ecommerceDescription: product.website_description || '',
    sku: product.default_code || '',
    rating: 4.5 + Math.random() * 0.5,
    color: extractColor(),
    // Stock & Availability
    inStock: (product.qty_available || 0) > 0 || !!product.allow_out_of_stock_order,
    allowOutOfStock: product.allow_out_of_stock_order || false,
    outOfStockMessage: product.out_of_stock_message || '',
    showAvailability: product.show_availability || false,
    availableThreshold: product.available_threshold || 0,
    qtyAvailable: product.qty_available || 0,
    // Ribbon (e.g., "Sale", "Sold out", "New!")
    ribbonId: product.website_ribbon_id ? product.website_ribbon_id[0] : null,
    ribbonName: product.website_ribbon_id ? product.website_ribbon_id[1] : null,
    // Related products (IDs only - fetch details separately)
    accessoryProductIds: product.accessory_product_ids || [],
    alternativeProductIds: product.alternative_product_ids || [],
    // Documents
    documentIds: [],
    // Barcode (unique identifier for document matching)
    barcode: product.barcode || '',
    // SEO-friendly URL from Odoo
    url: product.website_url || `/shop/${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
    slug: product.website_url ? product.website_url.replace('/shop/', '') : `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.id}`,
    // Product variant IDs for order creation
    variantIds: product.product_variant_ids || [],
  };
}
