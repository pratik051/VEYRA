import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { MarketplaceLogo } from './MarketplaceLogos';

export function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-900 transition-all duration-300 hover:shadow-xl overflow-hidden">
      {/* Top Media Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug || id}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.source && product.source !== 'SajiloMarts' && (
            <div className="bg-white/95 backdrop-blur-xs rounded-md px-1.5 py-0.5 shadow-2xs border border-neutral-100">
              <MarketplaceLogo marketplace={product.source} className="h-3.5 w-auto" />
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-all hover:scale-110 z-10 ${
            inWishlist ? "text-red-500 fill-red-500" : "text-neutral-600 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current text-red-500" : ""}`} />
        </button>

        {/* Quick View Button (Desktop Hover) */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex items-center gap-1.5 rounded-full bg-neutral-950/80 backdrop-blur-sm text-white px-3.5 py-1.5 text-xs font-semibold shadow-md hover:bg-neutral-950"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Content Info */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 space-y-2 justify-between">
        <div className="space-y-1">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
            <span className="truncate">{product.brand || product.category || "General"}</span>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-3 w-3 fill-current" />
                <span>{product.rating}</span>
                {product.reviews && <span className="text-neutral-400 text-[10px]">({product.reviews})</span>}
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || id}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-2 hover:text-red-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-neutral-950">
                NPR {(product.price || 0).toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] font-medium text-neutral-400 line-through">
                  NPR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.indianPriceINR && (
              <span className="text-[10px] text-neutral-400 font-medium">
                (₹{product.indianPriceINR} INR)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-neutral-900 text-white hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-xs"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
