import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, ArrowLeft, CheckCircle2, RotateCcw, MapPin, Sparkles } from 'lucide-react';
import { sampleProducts, sampleReviews } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { MarketplaceLogo } from '../components/MarketplaceLogos';
import { ProductCard } from '../components/ProductCard';

export function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = useMemo(() => {
    return (
      sampleProducts.find((p) => p.slug === slug || p.id === slug) ||
      sampleProducts[0]
    );
  }, [slug]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  const id = product._id || product.id || product.slug;
  const inWishlist = isInWishlist ? isInWishlist(id) : false;
  const gallery = product.gallery || [product.image];

  const handleAddToCart = () => {
    addToCart({
      id: id,
      name: product.name,
      price: product.price,
      image: gallery[0] || product.image,
      source: product.source || 'SajiloMarts',
      originalPrice: product.originalPrice,
      selectedColor,
      selectedSize,
      quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleCheckPostalCode = (e) => {
    e.preventDefault();
    if (!postalCode.trim()) return;

    if (postalCode.trim() === '854331' || postalCode.length >= 4) {
      setDeliveryStatus({
        available: true,
        message: '✓ Express Delivery Available! Estimated 2–4 business days.'
      });
    } else {
      setDeliveryStatus({
        available: false,
        message: 'Standard delivery takes 3–5 business days.'
      });
    }
  };

  const relatedProducts = useMemo(() => {
    return sampleProducts.filter((p) => (p.slug || p.id) !== id).slice(0, 4);
  }, [id]);

  return (
    <div className="space-y-12 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 dark:text-[#a3aed0]">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {product.category || 'Product Details'}
        </span>
        <span>/</span>
        <span className="text-neutral-900 dark:text-white font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-neutral-100 dark:bg-[#0b1437] border border-neutral-200/80 dark:border-[#1b2559] shadow-xs">
            <img
              src={gallery[selectedImage] || gallery[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 rounded-lg bg-neutral-950 dark:bg-amber-400 px-3 py-1 text-xs font-extrabold uppercase text-white dark:text-neutral-950 shadow-md">
                {product.badge}
              </span>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-20 w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx
                      ? 'border-neutral-950 dark:border-amber-400 shadow-sm scale-105'
                      : 'border-neutral-200 dark:border-[#1b2559] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 dark:text-[#a3aed0]">
                {product.brand} • {product.category}
              </span>
              {product.source && (
                <MarketplaceLogo marketplace={product.source} className="h-5 w-auto" />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-neutral-200 dark:text-neutral-700'}`}
                  />
                ))}
              </div>
              <span className="text-neutral-900 dark:text-white">{product.rating || 4.8}</span>
              <span className="text-neutral-400 dark:text-[#a3aed0] font-normal">
                ({product.reviews || 42} verified reviews)
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> In Stock ({product.stock || 20} available)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#111c44] border border-neutral-200/80 dark:border-[#1b2559] space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-950 dark:text-amber-400">
                NPR {(product.price || 0).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-base font-bold text-neutral-400 line-through">
                  NPR {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-xs font-black">
                  Save NPR {(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>
            {product.indianPriceINR && (
              <p className="text-xs text-neutral-500 dark:text-[#a3aed0] font-medium">
                Original Indian Sourcing Cost: ₹{product.indianPriceINR} INR (Includes customs, transit & duty)
              </p>
            )}
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-900 dark:text-white">
                Select Color: <span className="text-neutral-500 dark:text-[#a3aed0] font-normal">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedColor === color
                        ? 'border-neutral-950 dark:border-amber-400 bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 shadow-xs'
                        : 'border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-amber-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-900 dark:text-white">
                Select Size: <span className="text-neutral-500 dark:text-[#a3aed0] font-normal">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 w-12 rounded-xl text-xs font-bold border flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'border-neutral-950 dark:border-amber-400 bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 shadow-xs'
                        : 'border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-amber-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral-200 dark:border-[#1b2559] rounded-2xl overflow-hidden bg-white dark:bg-[#0b1437]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1b254b] font-bold"
                >
                  -
                </button>
                <span className="px-4 py-3 text-xs font-black text-neutral-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-3 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1b254b] font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 dark:bg-amber-400 px-6 py-3.5 text-xs font-black text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-300 transition-colors shadow-sm active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add To Cart</span>
              </button>

              <button
                onClick={() => toggleWishlist && toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  inWishlist
                    ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-500'
                    : 'border-neutral-200 dark:border-[#1b2559] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#111c44]'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded-2xl bg-red-600 text-white text-xs font-black hover:bg-red-700 transition-colors shadow-md active:scale-95"
            >
              Buy Now with Instant Checkout ➔
            </button>
          </div>

          {/* Postal Code Delivery Checker */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
              <MapPin className="h-4 w-4 text-red-600" />
              <span>Check Nepal Delivery Pin / Postal Code</span>
            </div>
            <form onSubmit={handleCheckPostalCode} className="flex gap-2">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code (e.g. 854331 or 44600)"
                className="flex-1 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-neutral-400 dark:placeholder:text-[#a3aed0]"
              />
              <button
                type="submit"
                className="rounded-xl bg-neutral-950 dark:bg-amber-400 px-4 py-2 text-xs font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-300"
              >
                Check
              </button>
            </form>
            {deliveryStatus && (
              <p className={`text-xs font-semibold ${deliveryStatus.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-[#a3aed0]'}`}>
                {deliveryStatus.message}
              </p>
            )}
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-neutral-700 dark:text-neutral-200">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#111c44] border border-neutral-200/60 dark:border-[#1b2559]">
              <Truck className="h-4 w-4 text-red-600 shrink-0" />
              <span>Doorstep Delivery Across Nepal</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#111c44] border border-neutral-200/60 dark:border-[#1b2559]">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Verified Item</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-neutral-200 dark:border-[#1b2559]">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-black text-neutral-950 dark:text-white">Product Description</h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.specs && (
            <div className="space-y-3">
              <h3 className="text-lg font-black text-neutral-950 dark:text-white">Technical Specifications</h3>
              <div className="rounded-2xl border border-neutral-200 dark:border-[#1b2559] overflow-hidden divide-y divide-neutral-100 dark:divide-[#1b2559] text-xs">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 p-3 bg-white dark:bg-[#111c44]">
                    <span className="font-bold text-neutral-500 dark:text-[#a3aed0]">{k}</span>
                    <span className="col-span-2 font-medium text-neutral-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-neutral-950 dark:text-white">Verified Customer Reviews</h3>
          <div className="space-y-3">
            {sampleReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111c44] border border-neutral-100 dark:border-[#1b2559] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white">{rev.author}</span>
                  <span className="text-[10px] text-neutral-400 dark:text-[#a3aed0]">{rev.date}</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">{rev.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="space-y-6 pt-8 border-t border-neutral-200 dark:border-[#1b2559]">
        <h3 className="text-2xl font-black text-neutral-950 dark:text-white">You May Also Like</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id || p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
