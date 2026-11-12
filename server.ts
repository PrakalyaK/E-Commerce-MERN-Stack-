import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db, generateObjectId } from './src/server/db/mongodb';
import { ensureSeededDatabase, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_REVIEWS, INITIAL_ORDERS } from './src/server/db/seed';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize DB seed
ensureSeededDatabase().catch(err => {
  console.error('Error during MongoDB initialization:', err);
});

// ==========================================
// 1. PRODUCTS API (MongoDB 'products')
// ==========================================

// GET /api/products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, inStock, sort } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = String(category);
    }

    if (search && String(search).trim() !== '') {
      filter.$or = [
        { name: { $regex: String(search).trim(), $options: 'i' } },
        { description: { $regex: String(search).trim(), $options: 'i' } },
        { categoryLabel: { $regex: String(search).trim(), $options: 'i' } },
        { 'materials.0': { $regex: String(search).trim(), $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const products = await db.collection('products').find(filter, { sort: sortOption });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let product = await db.collection('products').findOne({ _id: id });
    if (!product) {
      product = await db.collection('products').findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Fetch related customer reviews for this product
    const reviews = await db.collection('reviews').find(
      { productId: (product as any)._id },
      { sort: { date: -1 } }
    );

    res.json({
      success: true,
      data: {
        ...product,
        reviews,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products (Admin / Inventory creation)
app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name || !body.price || !body.category) {
      return res.status(400).json({ success: false, error: 'Name, price, and category are required' });
    }

    const newProduct = {
      _id: generateObjectId(),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: body.category,
      categoryLabel: body.categoryLabel || body.category,
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      stock: Number(body.stock ?? 10),
      inStock: (Number(body.stock ?? 10)) > 0,
      rating: 5.0,
      reviewCount: 0,
      badge: body.badge || 'New Arrival',
      description: body.description || '',
      materials: Array.isArray(body.materials) ? body.materials : [body.materials || 'Artisanal Materials'],
      dimensions: body.dimensions || 'Standard architectural dimensions',
      origin: body.origin || 'Studio Craft Workshop',
      sku: body.sku || `AUR-${Math.floor(100 + Math.random() * 900)}`,
      leadTime: body.leadTime || 'Ready to ship',
      image: body.image || '/src/assets/images/prod_sculptural_chair_1794469627632.jpg',
      featured: Boolean(body.featured),
    };

    const inserted = await db.collection('products').insertOne(newProduct);
    res.status(201).json({ success: true, data: inserted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updateResult = await db.collection('products').updateOne(
      { _id: id },
      { $set: body }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updated = await db.collection('products').findOne({ _id: id });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.collection('products').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted from MongoDB collection' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. CATEGORIES API (MongoDB 'categories')
// ==========================================

app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await db.collection('categories').find();
    // Recalculate dynamic counts from products
    const products = await db.collection('products').find();
    const enriched = categories.map((cat: any) => {
      if (cat.slug === 'all') {
        return { ...cat, count: products.length };
      }
      const count = products.filter((p: any) => p.category === cat.slug).length;
      return { ...cat, count };
    });
    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ORDERS API (MongoDB 'orders')
// ==========================================

// GET /api/orders
app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await db.collection('orders').find({}, { sort: { createdAt: -1 } });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders (Place order + inventory decrement in MongoDB)
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { customer, items, paymentMethod, notes } = req.body;

    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({ success: false, error: 'Full customer name, email, and delivery address are required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one product item' });
    }

    // Calculate subtotal and verify items
    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = await db.collection('products').findOne({ _id: item.productId });
      if (!product) {
        return res.status(400).json({ success: false, error: `Product not found: ${item.productId}` });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      if ((product as any).stock < qty) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${(product as any).name}. Only ${(product as any).stock} remaining.`,
        });
      }

      subtotal += (product as any).price * qty;
      validatedItems.push({
        productId: (product as any)._id,
        name: (product as any).name,
        price: (product as any).price,
        quantity: qty,
        image: (product as any).image,
      });

      // Decrement stock in MongoDB
      await db.collection('products').updateOne(
        { _id: (product as any)._id },
        {
          $inc: { stock: -qty },
          $set: { inStock: (product as any).stock - qty > 0 },
        }
      );
    }

    const shipping = subtotal >= 150 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const orderNumber = `AUR-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `AUR-TRK-${Date.now().toString().slice(-8)}`;

    const newOrder = {
      _id: generateObjectId(),
      orderNumber,
      customer,
      items: validatedItems,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'Processing',
      trackingNumber,
      carrier: 'Global Courier Express',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    const insertedOrder = await db.collection('orders').insertOne(newOrder);

    res.status(201).json({
      success: true,
      data: insertedOrder,
      message: `Order #${orderNumber} confirmed and persisted to MongoDB!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updateRes = await db.collection('orders').updateOne(
      { _id: id },
      { $set: { status } }
    );

    if (updateRes.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updated = await db.collection('orders').findOne({ _id: id });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. REVIEWS API (MongoDB 'reviews')
// ==========================================

// POST /api/reviews
app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { productId, author, location, rating, title, content } = req.body;
    if (!productId || !author || !rating || !content) {
      return res.status(400).json({ success: false, error: 'Missing required review fields' });
    }

    const product = await db.collection('products').findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const newReview = {
      _id: generateObjectId(),
      productId,
      author: String(author).trim(),
      location: location || 'Verified Buyer',
      rating: Math.min(5, Math.max(1, Number(rating))),
      date: new Date().toISOString().split('T')[0],
      title: title || 'Customer Review',
      content: String(content).trim(),
      verified: true,
    };

    const inserted = await db.collection('reviews').insertOne(newReview);

    // Recalculate average rating for product in MongoDB
    const allReviews = await db.collection('reviews').find({ productId });
    const avgRating =
      allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;

    await db.collection('products').updateOne(
      { _id: productId },
      {
        $set: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      }
    );

    res.status(201).json({ success: true, data: inserted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. MONGODB DATABASE METRICS & DEV CONSOLE
// ==========================================

app.get('/api/mongodb/stats', async (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mongodb/reset', async (_req: Request, res: Response) => {
  try {
    await db.resetData({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      reviews: INITIAL_REVIEWS,
      orders: INITIAL_ORDERS,
    });
    res.json({ success: true, message: 'MongoDB collections successfully reset to pristine state' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mongodb/query', async (req: Request, res: Response) => {
  try {
    const { collection, action, filter, update, options } = req.body;
    if (!collection) {
      return res.status(400).json({ success: false, error: 'Collection name required' });
    }

    const col = db.collection(collection);
    let result: any;

    if (action === 'find') {
      result = await col.find(filter || {}, options || {});
    } else if (action === 'findOne') {
      result = await col.findOne(filter || {});
    } else if (action === 'count') {
      result = await col.countDocuments(filter || {});
    } else if (action === 'updateOne') {
      result = await col.updateOne(filter || {}, update || {});
    } else {
      result = await col.find({}, { limit: 20 });
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express + MongoDB] Store backend running at http://localhost:${PORT}`);
  });
}

startServer();
