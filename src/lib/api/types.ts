export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  categoryId: number | null;
  publicCategoryIds: number[];
  image: string;
  thumbnail: string;
  additionalImageIds: number[];
  additionalImages?: ProductImage[];
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
  accessoryProducts?: RelatedProduct[];
  alternativeProductIds: number[];
  alternativeProducts?: RelatedProduct[];
  documentIds: number[];
  documents?: ProductDocument[];
  url: string;
  slug: string;
  variantIds: number[];
}

export interface ProductImage {
  id: number;
  name: string;
  url: string;
}

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

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName: string | null;
  childIds: number[];
  sequence: number;
  count: number;
  totalCount: number;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface Ribbon {
  id: number;
  name: string;
  html: string;
  bg_color: string;
  text_color: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface QuotationRequest {
  customer: Customer;
  cart: CartItemRequest[];
  country: string;
}

export interface CartItemRequest {
  id: number;
  name: string;
  price: number;
  quantity: number;
  variantIds?: number[];
}

export interface QuotationResponse {
  success: boolean;
  quotationId: number;
  quotationName: string;
  orderRef: string;
  message: string;
}

export interface TrackSearchResult {
  success: boolean;
  query: string;
  searchType: "phone" | "reference";
  totalResults: number;
  customer: {
    name: string;
    phone?: string;
    email?: string;
  } | null;
  orders: OrderResult[];
  deliveries: DeliveryResult[];
  helpdesk: HelpdeskResult[];
  repairs: RepairResult[];
}

export interface OrderResult {
  id: number;
  reference: string;
  clientRef: string;
  status: string;
  statusKey: string;
  date: string;
  total: number;
  customerName: string;
  itemCount: number;
}

export interface DeliveryResult {
  id: number;
  reference: string;
  origin: string;
  status: string;
  statusKey: string;
  scheduledDate: string;
  doneDate: string | null;
  customerName: string;
  itemCount: number;
}

export interface HelpdeskResult {
  id: number;
  reference: string;
  subject: string;
  status: string;
  date: string;
  customerName: string;
  priority: string;
}

export interface RepairResult {
  id: number;
  reference: string;
  status: string;
  statusKey: string;
  date: string;
  customerName: string;
  product: string;
  total: number;
}
