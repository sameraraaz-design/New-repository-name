import React, { useState } from 'react';
import { Star, ShoppingCart, Zap, Heart, Check } from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatIndianRupees } from '../utils/pricing.ts';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onBuyNow: (product: Product, e?: React.MouseEvent) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string, e?: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product, e);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id, e);
    }
  };

  const inStock = product.stock > 0;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Slot (65% height feel with aspect ratio) */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {!imgError && product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <ShoppingCart className="w-8 h-8 mb-2 text-slate-300" />
            <span className="text-xs font-medium text-slate-500 line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-600 shadow-xs transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
          />
        </button>

        {/* Quiet Discount Notice */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            {product.discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-4">
        {/* Unboxed Metadata: Brand · Category */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            {product.brand}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{product.category}</span>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating & Verified Reviews */}
        <div className="flex items-center gap-2 mt-2 text-xs">
          <div className="flex items-center gap-1 text-amber-600 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-400">({product.reviewsCount} reviews)</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className={`text-[11px] font-medium ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
            {inStock ? (product.stock < 10 ? `Only ${product.stock} left` : 'In Stock') : 'Out of Stock'}
          </span>
        </div>

        {/* Price Row (Tabular Numerals) */}
        <div className="flex items-baseline gap-2 mt-3 font-mono">
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {formatIndianRupees(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through tabular-nums">
              {formatIndianRupees(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Interactive Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
              justAdded
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : inStock
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold text-white transition-all ${
              inStock
                ? 'bg-blue-600 hover:bg-blue-700 shadow-2xs'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
