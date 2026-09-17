import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { MarketplaceLogo } from './MarketplaceLogos';

export function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const id = product._id || product.id || product.slug;
  const inWishlist = isInWishlist ? isInWishlist(id) : false;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: id,
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || '/sajilomarts-logo.png',
      source: product.source || 'SajiloMarts',
      originalPrice: product.originalPrice,
      quantity: 1
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product);
    }
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const displayImage =
    product.image ||
    (product.images && product.images[0]) ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

  const subline =
    product.subline ||
    product.brand ||
    product.category ||
    'Indian Store Sourced';

  return (
    <div className="group relative flex flex-col rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm overflow-hidden">
      {/* Top Media Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50">
        <Link to={`/product/${product.slug || id}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-neutral-950">
              {discountPercent}% OFF
            </span>
          )}
          {product.source && product.source !== 'SajiloMarts' && (
            <div className="bg-white/95 rounded px-1.5 py-0.5 shadow-2xs border border-neutral-200">
              <MarketplaceLogo marketplace={product.source} className="h-3 w-auto" />
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-xs border border-neutral-200 transition-colors z-10 ${
            inWishlist ? "text-red-500 fill-red-500" : "text-neutral-500 hover:text-red-500"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${inWishlist ? "fill-current text-red-500" : ""}`} />
        </button>

        {/* Quick View Button (Desktop Hover) */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-1 rounded bg-neutral-900 text-white px-3 py-1 text-xs font-medium shadow-sm hover:bg-neutral-800 z-10"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Content Info */}
      <div className="flex flex-1 flex-col p-3 justify-between bg-white space-y-2">
        <div className="space-y-1">
          {/* Subline & Rating */}
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
            <span className="truncate">{subline}</span>
            {product.rating && (
              <div className="flex items-center gap-0.5 text-amber-600 font-semibold shrink-0">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{product.rating}</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug || id}`} className="block hover:text-amber-700 transition-colors">
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 flex items-end justify-between border-t border-neutral-100">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-neutral-900">
                NPR {(product.price || 0).toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-400 line-through">
                  NPR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.indianPriceINR && (
              <span className="text-[10px] text-neutral-500 font-normal block">
                Approx. ₹{product.indianPriceINR} INR
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors shadow-2xs active:scale-95 cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 hover:bg-amber-500 text-neutral-950'
            }`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
