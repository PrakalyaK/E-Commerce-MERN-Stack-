/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Product, Category, CartItem, Order } from './types/store';
import { fetchProducts, fetchCategories } from './services/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryDrawer } from './components/OrderHistoryDrawer';
import { MongoConsoleModal } from './components/MongoConsoleModal';
import { AddProductModal } from './components/AddProductModal';
import { Footer } from './components/Footer';
import { Filter, SlidersHorizontal, Plus, Search, Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isMongoConsoleOpen, setIsMongoConsoleOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Quick feedback state
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart]);

  // Load products and categories from MongoDB Express backend
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodData, catData] = await Promise.all([
        fetchProducts({
          category: selectedCategory,
          search: searchQuery,
          sort: sortBy,
          inStock: inStockOnly,
        }),
        fetchCategories(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend MongoDB API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, sortBy, inStockOnly]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!product.inStock || product.stock <= 0) {
      showToast(`${product.name} is currently out of stock`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prevCart.map((item) =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(product.stock, quantity) }];
    });

    setRecentlyAddedId(product._id);
    setTimeout(() => setRecentlyAddedId(null), 1800);
    showToast(`Added "${product.name}" to shopping bag`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    loadData(); // Re-fetch products to reflect the newly decremented stock in MongoDB
    showToast(`Order #${order.orderNumber} successfully registered in MongoDB!`);
  };

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const activeCategoryObject = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-lg shadow-xl border border-stone-700 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMongoConsole={() => setIsMongoConsoleOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Storefront Hero Campaign */}
      <Hero
        onExplore={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Category Description Banner */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Curated Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              {activeCategoryObject ? activeCategoryObject.name : 'All Pieces'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              {activeCategoryObject?.tagline || 'Enduring objects made by hand from honest natural materials.'}
            </p>
          </div>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-800 bg-stone-200/80 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300/80"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Catalog Item</span>
          </button>
        </div>

        {/* Filter Bar & Controls */}
        <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Segmented Category Buttons (Interactive filter tabs) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 font-mono text-[11px] opacity-70">
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>

          {/* Sort & In-Stock Controls */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs">
            <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>

            <div className="h-4 w-px bg-stone-300" />

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-stone-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-lg h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-stone-100/50 rounded-xl border border-stone-200/80 space-y-3">
            <Search className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-serif text-stone-800">No matching pieces found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't locate any products matching your current category or search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="px-4 py-2 text-xs font-medium bg-stone-900 text-stone-50 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
                onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
                isAdded={recentlyAddedId === product._id}
              />
            ))}
          </div>
        )}

        {/* Craftsmanship & Architectural Editorial Section (§2.A Story / Craftsmanship) */}
        <section className="mt-20 pt-16 border-t border-stone-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="text-xs uppercase tracking-widest text-stone-500 font-medium">
                Our Architectural Philosophy
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-snug">
                Objects that converse quietly with their surroundings.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Every piece in our catalog is an exercise in reduction and sensory truth. We reject fleeting disposable design in favor of solid Scandinavian oak, unpolished Italian travertine, hand-pleated Japanese mulberry washi, and organic French flax that deepens with life.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2 text-xs">
                <div>
                  <div className="font-semibold text-stone-900 text-sm font-mono tabular-nums">100% Traceable</div>
                  <p className="text-stone-500 mt-0.5">Sustainably forested European oak and non-toxic plant washes.</p>
                </div>
                <div>
                  <div className="font-semibold text-stone-900 text-sm font-mono tabular-nums">Zero Synthetic Resins</div>
                  <p className="text-stone-500 mt-0.5">Botanical distillations and pure cold-pressed resins.</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 border border-stone-300">
              <img
                src="/src/assets/images/prod_sculptural_chair_1794469627632.jpg"
                alt="Studio craftsmanship showcase"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onProductUpdated={(updated) => {
          setSelectedProduct(updated);
          setProducts((prev) =>
            prev.map((p) => (p._id === updated._id ? updated : p))
          );
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onContinueShopping={() => setIsCartOpen(false)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderHistoryDrawer
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      <MongoConsoleModal
        isOpen={isMongoConsoleOpen}
        onClose={() => setIsMongoConsoleOpen(false)}
        onDataChanged={loadData}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={() => {
          loadData();
          showToast('New product inserted into MongoDB collection!');
        }}
      />

    </div>
  );
}
