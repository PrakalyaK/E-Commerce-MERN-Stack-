import React from 'react';
import { Product } from '../types/store';
import { Plus, Check, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isAdded = false,
}) => {
  return (
    <article
      onClick={() => onSelect(product)}
      className="group cursor-pointer flex flex-col bg-stone-50 rounded-lg border border-stone-200/90 hover:border-stone-400 hover:shadow-md transition-all duration-200"
    >
      {/* Product Image Stage (65–75% visual weight) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-stone-100/80">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Subtle Text Tag (Max 1 subtle indicator) */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-stone-100 text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded">
            {product.badge}
          </div>
        )}

        {/* Quick Add Overlay on Hover */}
        <button
          onClick={(e) => onAddToCart(product, e)}
          disabled={!product.inStock}
          aria-label={`Add ${product.name} to cart`}
          className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded shadow-sm transition-all duration-200 ${
            product.inStock
              ? isAdded
                ? 'bg-stone-900 text-stone-50'
                : 'bg-stone-50/90 text-stone-900 hover:bg-stone-900 hover:text-stone-50 backdrop-blur-sm'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>{product.inStock ? 'Quick Add' : 'Out of Stock'}</span>
            </>
          )}
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Quiet Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-wider text-[11px] font-medium">{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{product.stock > 0 ? `${product.stock} in stock` : 'Restocking'}</span>
          </div>

          <h3 className="text-base font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Rating Bar */}
        <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between text-sm">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-stone-900 font-mono tabular-nums text-base">
              ${product.price}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                ${product.compareAtPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Star className="w-3.5 h-3.5 fill-stone-800 text-stone-800" />
            <span className="font-mono tabular-nums font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-stone-400 text-[11px]">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </article>
  );
};
