import { Product, Category, Order, Review, MongoDbStats } from '../types/store';

export async function fetchProducts(params: {
  category?: string;
  search?: string;
  sort?: string;
  inStock?: boolean;
} = {}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.sort) query.set('sort', params.sort);
  if (params.inStock) query.set('inStock', 'true');

  const res = await fetch(`/api/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const json = await res.json();
  return json.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  const json = await res.json();
  return json.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  const json = await res.json();
  return json.data;
}

export async function createOrder(payload: {
  customer: any;
  items: { productId: string; quantity: number }[];
  paymentMethod: string;
  notes?: string;
}): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to place order');
  return json.data;
}

export async function submitReview(payload: {
  productId: string;
  author: string;
  location?: string;
  rating: number;
  title: string;
  content: string;
}): Promise<Review> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to submit review');
  return json.data;
}

export async function fetchMongoStats(): Promise<MongoDbStats> {
  const res = await fetch('/api/mongodb/stats');
  if (!res.ok) throw new Error('Failed to fetch MongoDB stats');
  const json = await res.json();
  return json.data;
}

export async function executeMongoQuery(collection: string, action: string, filter?: any) {
  const res = await fetch('/api/mongodb/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, action, filter }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Mongo query failed');
  return json.data;
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch('/api/mongodb/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset MongoDB');
}
