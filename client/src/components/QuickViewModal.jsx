import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { MarketplaceLogo } from './MarketplaceLogos';

export function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const id = product._id || product.id || product.slug;
  const inWishlist = isInWishlist ? isInWishlist(id) : false;
  const gallery = product.gallery || (product.images && product.images.length > 0 ? product.images : [product.image]);

  const handleAddToCart = () => {
    addToCart({
      id: id,
      name: product.name,
      price: product.price,
      image: gallery[0] || product.image || '/sajilomarts-logo.png',
      source: product.source || 'SajiloMarts',
      originalPrice: product.originalPrice,
      quantity: quantity
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-900 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={gallery[selectedImage] || gallery[0] || product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                      selectedImage === idx ? 'border-neutral-950 shadow-xs' : 'border-neutral-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {product.brand || product.category}
                </span>
                {product.source && (
                  <MarketplaceLogo marketplace={product.source} className="h-4 w-auto" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-950 leading-snug">
                {product.name}
              </h2>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <Star className="h-4 w-4 fill-current" />
                <span>{product.rating}</span>
                {product.reviews && <span className="text-neutral-400">({product.reviews} customer reviews)</span>}
              </div>
            )}

            {/* Price */}
            <div className="pt-2 border-t border-neutral-100 flex items-baseline gap-3">
              <span className="text-2xl font-black text-neutral-950">
                NPR {(product.price || 0).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-semibold text-neutral-400 line-through">
                  NPR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-600 leading-relaxed">
              {product.description || "Authentic quality product sourced directly with complete doorstep delivery across Nepal."}
            </p>

            {/* Quantity and Actions */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-xs font-black text-white hover:bg-red-600 transition-colors shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add To Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist && toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-colors ${
                    inWishlist
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-neutral-700" />
                  <span>Doorstep Nepal Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% Genuine Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
