import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { coupons } from '../data/mockData';

export function Cart() {
  const { items, removeFromCart, updateQty, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const deliveryFee = subtotal > 0 ? (subtotal > 3000 ? 0 : 150) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code === clean);

    if (found) {
      if (subtotal >= found.minOrder) {
        const disc =
          found.discountType === 'percentage'
            ? Math.round((subtotal * found.amount) / 100)
            : found.amount;
        setDiscount(disc);
        setCouponMsg(`✓ Coupon ${clean} applied! Saved NPR ${disc.toLocaleString()}`);
      } else {
        setCouponMsg(`✕ Minimum subtotal of NPR ${found.minOrder.toLocaleString()} required for this coupon`);
      }
    } else {
      setCouponMsg('✕ Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#111c44] text-neutral-400 mx-auto">
          <ShoppingBag className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-neutral-950 dark:text-white">Your Cart is Empty</h2>
          <p className="text-xs text-neutral-500 dark:text-[#a3aed0] max-w-sm mx-auto">
            Looks like you haven't added any items to your shopping cart yet.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 dark:bg-amber-400 px-6 py-3.5 text-xs font-black text-white dark:text-neutral-950 hover:bg-amber-400 hover:text-neutral-950 transition shadow-md"
          >
            <span>Browse Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/request-product"
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-100 dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] px-6 py-3.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 transition"
          >
            <span>Request Indian Sourcing</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-[#1b2559] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">Shopping Cart</h1>
          <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">
            {items.length} unique items in your basket
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-neutral-400 hover:text-red-500 transition self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] divide-y divide-neutral-100 dark:divide-[#1b2559] overflow-hidden shadow-2xs">
            {items.map((item) => (
              <div
                key={item._id || item.id || item.slug}
                className="p-3.5 sm:p-6 flex gap-3 sm:gap-5 items-start"
              >
                <img
                  src={item.image || '/sajilomarts-logo.png'}
                  alt={item.name}
                  className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl object-cover bg-neutral-100 dark:bg-[#0b1437] shrink-0 border border-neutral-200 dark:border-[#1b2559]"
                />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      {item.source || 'SajiloMarts'}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id || item.id || item.slug)}
                      className="text-neutral-400 hover:text-red-500 transition p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <Link
                    to={`/product/${item.slug || item.id}`}
                    className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 hover:text-amber-500 transition block"
                  >
                    {item.name}
                  </Link>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-black text-neutral-950 dark:text-amber-400">
                        NPR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-neutral-400 dark:text-[#a3aed0]">
                          ({item.price.toLocaleString()} ea)
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-neutral-200 dark:border-[#1b2559] rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#0b1437]">
                      <button
                        onClick={() => updateQty(item._id || item.id || item.slug, (item.quantity || 1) - 1)}
                        className="px-2.5 py-1 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1b254b] font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-black text-neutral-900 dark:text-white">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQty(item._id || item.id || item.slug, (item.quantity || 1) + 1)}
                        className="px-2.5 py-1 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1b254b] font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-5 sm:p-6 space-y-6 shadow-2xs">
            <h3 className="text-lg font-black text-neutral-950 dark:text-white">Order Summary</h3>

            {/* Price Lines */}
            <div className="space-y-3 text-xs border-b border-neutral-100 dark:border-[#1b2559] pb-4">
              <div className="flex justify-between text-neutral-600 dark:text-[#a3aed0]">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900 dark:text-white">NPR {subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied</span>
                  <span>- NPR {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 dark:text-[#a3aed0]">
                <span>Estimated Nepal Delivery</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `NPR ${deliveryFee}`}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. REF10)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-neutral-900 dark:bg-amber-400 px-4 py-2 text-xs font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 transition"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className="text-[11px] font-semibold text-neutral-600 dark:text-[#a3aed0]">{couponMsg}</p>
              )}
            </form>

            {/* Total */}
            <div className="pt-2 border-t border-neutral-100 dark:border-[#1b2559] flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-neutral-500 dark:text-[#a3aed0]">Total Payable</span>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Includes all taxes &amp; duties</p>
              </div>
              <span className="text-2xl font-black text-neutral-950 dark:text-white">
                NPR {total.toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-red-600 dark:hover:bg-amber-300 transition shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Proceed to 6-Step Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-[#a3aed0] text-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Secure Encrypted Nepal Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
