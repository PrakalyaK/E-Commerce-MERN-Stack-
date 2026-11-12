import React, { useState } from 'react';
import { Product, Review } from '../types/store';
import { X, Star, Check, ShieldCheck, Truck, RotateCcw, Plus, Minus, MessageSquarePlus } from 'lucide-react';
import { submitReview } from '../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductUpdated?: (updated: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onProductUpdated,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [isAdded, setIsAdded] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const reviews: Review[] = product.reviews || [];

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewContent.trim()) return;

    try {
      setSubmittingReview(true);
      const newReview = await submitReview({
        productId: product._id,
        author: authorName,
        location: authorLocation || 'Verified Client',
        rating: reviewRating,
        title: reviewTitle || 'Artisanal Review',
        content: reviewContent,
      });

      // Update local state
      const updatedReviews = [newReview, ...reviews];
      const newAvg =
        updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

      const updatedProd: Product = {
        ...product,
        reviews: updatedReviews,
        rating: Math.round(newAvg * 10) / 10,
        reviewCount: updatedReviews.length,
      };

      if (onProductUpdated) {
        onProductUpdated(updatedProd);
      }

      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setShowReviewForm(false);
        setAuthorName('');
        setAuthorLocation('');
        setReviewTitle('');
        setReviewContent('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review to MongoDB');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className="relative w-full max-w-4xl bg-stone-50 rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200 rounded-full transition-colors"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="bg-stone-100 relative min-h-[340px] md:min-h-[500px]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-stone-900 text-stone-50 text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded">
                {product.badge}
              </div>
            )}
          </div>

          {/* Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Quiet unboxed metadata */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider font-medium">{product.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-tight">
                {product.name}
              </h2>

              {/* Price & Rating */}
              <div className="mt-3 flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono tabular-nums font-semibold text-stone-900">
                    ${product.price}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm font-mono tabular-nums text-stone-400 line-through">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Star className="w-4 h-4 fill-stone-800 text-stone-800" />
                  <span className="font-mono tabular-nums font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-stone-500 underline underline-offset-2">({product.reviewCount} verified reviews)</span>
                </button>
              </div>

              {/* Tabs: Details vs Reviews */}
              <div className="mt-4 flex gap-4 text-xs font-medium border-b border-stone-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 transition-colors ${
                    activeTab === 'details'
                      ? 'text-stone-950 border-b-2 border-stone-950 font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Specifications & Craft
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-stone-950 border-b-2 border-stone-950 font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Client Reviews ({reviews.length})
                </button>
              </div>

              {/* Details Content */}
              {activeTab === 'details' ? (
                <div className="mt-4 space-y-4 text-xs text-stone-600">
                  <p className="text-stone-700 leading-relaxed text-sm">
                    {product.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-start">
                      <span className="w-28 text-stone-500 shrink-0">Materials:</span>
                      <span className="text-stone-900 font-medium">
                        {product.materials.join(' · ')}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-stone-500 shrink-0">Dimensions:</span>
                      <span className="text-stone-900 font-medium">{product.dimensions}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-stone-500 shrink-0">Origin:</span>
                      <span className="text-stone-900 font-medium">{product.origin}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-stone-500 shrink-0">Lead Time:</span>
                      <span className="text-stone-900 font-medium">{product.leadTime}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Reviews Content */
                <div className="mt-4 space-y-4 max-h-60 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">Verified Client Feedback</span>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-xs text-stone-800 hover:text-stone-950 underline flex items-center gap-1 font-medium"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>{showReviewForm ? 'Cancel' : 'Write a Review'}</span>
                    </button>
                  </div>

                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-3 bg-stone-100 rounded-lg space-y-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="e.g. Henrik Larsson"
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">City / Country</label>
                          <input
                            type="text"
                            value={authorLocation}
                            onChange={(e) => setAuthorLocation(e.target.value)}
                            placeholder="e.g. Oslo, Norway"
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">Rating</label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-500"
                          >
                            <option value={5}>5 Stars - Exceptional</option>
                            <option value={4}>4 Stars - Very Good</option>
                            <option value={3}>3 Stars - Good</option>
                            <option value={2}>2 Stars - Fair</option>
                            <option value={1}>1 Star - Poor</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">Headline</label>
                        <input
                          type="text"
                          required
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Brief summary"
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">Detailed Review</label>
                        <textarea
                          required
                          rows={2}
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          placeholder="Describe the texture, finish, and spatial presence..."
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full py-1.5 bg-stone-900 text-stone-50 font-medium rounded hover:bg-stone-800 transition-colors disabled:opacity-50"
                      >
                        {reviewSuccess ? 'Saved to MongoDB!' : submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </form>
                  )}

                  {reviews.length === 0 ? (
                    <p className="text-xs text-stone-500 italic py-2">No reviews yet. Be the first to share your thoughts.</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev._id} className="pb-3 border-b border-stone-200/70 last:border-b-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-stone-900">{rev.author}</span>
                          <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-stone-800 mb-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-stone-800 text-stone-800" />
                          ))}
                          <span className="text-[11px] text-stone-500 ml-1">{rev.location}</span>
                        </div>
                        <p className="text-xs font-medium text-stone-800">{rev.title}</p>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{rev.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Contiguous Purchase Action Controls */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-medium text-stone-600">Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-md bg-stone-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-mono tabular-nums font-semibold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-stone-500 font-mono">
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </span>
              </div>

              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`w-full py-3.5 px-6 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  product.inStock
                    ? isAdded
                      ? 'bg-emerald-800 text-stone-50'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-50'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Shopping Bag</span>
                  </>
                ) : (
                  <span>
                    {product.inStock
                      ? `Add to Bag · $${product.price * quantity}`
                      : 'Currently Unavailable'}
                  </span>
                )}
              </button>

              {/* Guarantees */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-stone-500 text-center pt-2">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-600" />
                  <span>Insured Courier</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                  <span>5-Yr Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
