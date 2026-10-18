import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Check,
  ChevronRight,
  PackageCheck,
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatIndianRupees, lookupPincode, PincodeDeliveryInfo } from '../utils/pricing.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, options: { color?: string; size?: string; quantity: number }) => void;
  onBuyNow: (product: Product, options: { color?: string; size?: string; quantity: number }) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.availableColors?.[0]
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.availableSizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('560001');
  const [pincodeInfo, setPincodeInfo] = useState<PincodeDeliveryInfo>(() => lookupPincode('560001'));
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const info = lookupPincode(pincode);
    setPincodeInfo(info);
    setPincodeChecked(true);
  };

  const handleAdd = () => {
    onAddToCart(product, {
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuy = () => {
    onBuyNow(product, {
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    onClose();
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/src/assets/images/skirz_product_headphones_1792340275712.jpg'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Bar with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span>{product.category}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-slate-800 truncate max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close product view"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 relative">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  {product.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust highlights */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Free Express Delivery on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{product.returnPolicy || '7 Days Replacement Policy'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{product.warranty || '1 Year Brand Manufacturer Warranty'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Supplier Fulfillment with Real-Time Tracking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module & Specs (7 cols) */}
          <div className="md:col-span-7 flex flex-col space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-700 tracking-wider uppercase">
                  {product.brand}
                </span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-md font-bold text-xs border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {product.reviewsCount} verified customer ratings & reviews
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-baseline gap-3 font-mono">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatIndianRupees(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-slate-400 line-through tabular-nums">
                  {formatIndianRupees(product.originalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Save {product.discountPercent}%
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto font-sans">
                Inclusive of all taxes
              </span>
            </div>

            {/* Available Color Selector */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Color: <span className="text-blue-600 font-bold">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedColor === color
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Size Selector */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Size: <span className="text-blue-600 font-bold">{selectedSize}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery by PIN Code Checker */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Check Delivery & COD Availability
              </label>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN code"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Check
                </button>
              </form>

              {pincodeChecked && pincodeInfo.valid && (
                <div className="mt-2.5 text-xs text-slate-600 flex flex-col gap-0.5">
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Delivery available to {pincodeInfo.city}, {pincodeInfo.state}
                  </p>
                  <p className="text-slate-500">
                    Estimated Delivery by <span className="font-semibold text-slate-800">{pincodeInfo.deliveryDate}</span> (in {pincodeInfo.estimatedDays} business days).
                  </p>
                  <p className="text-slate-500">Cash on Delivery (COD) is available for this location.</p>
                </div>
              )}
              {pincodeChecked && !pincodeInfo.valid && (
                <p className="mt-2 text-xs text-rose-600">
                  Please enter a valid 6-digit Indian PIN code.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                About this item
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Key Features
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Specifications
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {product.specifications.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-2.5">
                      <span className="font-medium text-slate-500">{s.name}</span>
                      <span className="col-span-2 font-medium text-slate-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Contiguous Sticky Purchase Bar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Qty:</label>
            <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <span className="px-3 py-1 text-xs font-bold font-mono text-slate-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>

            <div className="hidden sm:flex flex-col ml-2 font-mono">
              <span className="text-xs text-slate-400">Total Price</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formatIndianRupees(product.price * quantity)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                addedToast
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              {addedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-slate-600" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuy}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
