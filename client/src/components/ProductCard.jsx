import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { MarketplaceLogo } from './MarketplaceLogos';

export function ProductCard({ product, onQuickView, layoutMode = 'fashion' }) {
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
    'Original Piece';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-900 transition-all duration-300 hover:shadow-xl overflow-hidden">
      {/* Top Media Container (Fashion 4:5 aspect ratio) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug || id}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="rounded-md bg-neutral-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
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
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs shadow-xs transition-all hover:scale-110 z-10 ${
            inWishlist ? "text-red-500 fill-red-500" : "text-neutral-700 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current text-red-500" : ""}`} />
        </button>

        {/* Available Sizes Bar Overlay on Hover */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="absolute inset-x-2 bottom-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-xl shadow-md z-10">
            <span className="text-[9px] font-black uppercase text-neutral-400 mr-1">Sizes:</span>
            {product.sizes.map((sz) => (
              <span
                key={sz}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-neutral-800 bg-neutral-100"
              >
                {sz}
              </span>
            ))}
          </div>
        )}

        {/* Quick View Button (Desktop Hover) */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex items-center gap-1.5 rounded-full bg-neutral-950/90 backdrop-blur-sm text-white px-3.5 py-1.5 text-xs font-bold shadow-md hover:bg-neutral-950 z-10 hover:scale-105 active:scale-95"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Content Info matching Figma Fashion Store layout */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 justify-between bg-white space-y-3">
        <div className="space-y-1">
          {/* Subline & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-neutral-400">
            <span className="truncate">{subline}</span>
            {product.rating && (
              <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                <Star className="h-3 w-3 fill-current" />
                <span>{product.rating}</span>
                {product.reviews && (
                  <span className="text-neutral-400 text-[9px]">({product.reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug || id}`} className="block group-hover:text-neutral-600 transition-colors">
            <h3 className="text-xs sm:text-sm font-black text-neutral-950 line-clamp-1 tracking-tight">
              {product.name}
            </h3>
          </Link>

          {/* Color Dots indicator if present */}
          {product.colorHexes && product.colorHexes.length > 0 && (
            <div className="flex items-center gap-1 pt-1">
              {product.colorHexes.slice(0, 4).map((hex, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-neutral-300 shadow-2xs"
                  style={{ backgroundColor: hex }}
                  title={product.colors?.[i] || 'Color'}
                />
              ))}
              {product.colorHexes.length > 4 && (
                <span className="text-[9px] text-neutral-400 font-bold">+{product.colorHexes.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-neutral-950 tracking-tight">
                NPR {(product.price || 0).toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] font-semibold text-neutral-400 line-through">
                  NPR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.indianPriceINR && (
              <span className="text-[9px] text-neutral-400 font-medium block">
                (₹{product.indianPriceINR} INR)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all duration-200 shadow-xs active:scale-95 cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-950 text-white hover:bg-neutral-800 hover:scale-105'
            }`}
            aria-label={`Add ${product.name} to bag`}
          >
            {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
