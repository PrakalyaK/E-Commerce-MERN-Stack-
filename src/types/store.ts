export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  description: string;
  materials: string[];
  dimensions: string;
  origin: string;
  sku: string;
  leadTime: string;
  image: string;
  featured?: boolean;
  reviews?: Review[];
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  count: number;
  tagline: string;
}

export interface Review {
  _id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  notes?: string;
  createdAt: string;
}

export interface MongoDbStats {
  connected: boolean;
  database: string;
  version: string;
  collections: Record<string, { count: number; sampleId?: string }>;
  totalDocuments: number;
  storagePath: string;
  lastSynced: string;
}
