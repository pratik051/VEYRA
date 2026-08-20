"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { formatNpr } from "@/lib/utils";

export default function CartPage() {
  const { items, removeFromCart, subtotal, updateQty } = useCart();
  const delivery = items.length ? 250 : 0;
  const total = subtotal + delivery;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold">Your cart is waiting.</h1>
        <p className="mt-2 text-neutral-600">Discover something you&apos;ll love.</p>
        <Link href="/shop" className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-semibold">Cart</h1>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex gap-4 rounded-2xl border border-neutral-200 p-3">
              <Image src={`${item.image}?auto=format&fit=crop&w=500&q=70`} alt={item.name} width={140} height={140} className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-neutral-600">{formatNpr(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <input type="number" min={1} value={item.quantity} onChange={(e) => updateQty(item.id, Number(e.target.value))} className="w-20 rounded-lg border border-neutral-300 px-2 py-1" />
                  <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-600">Remove</button>
                  <button className="text-sm text-neutral-700">Save for later</button>
                </div>
              </div>
              <p className="font-semibold">{formatNpr(item.price * item.quantity)}</p>
            </article>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatNpr(subtotal)}</span></p>
          <p className="flex justify-between"><span>Estimated delivery fee</span><span>{formatNpr(delivery)}</span></p>
          <p className="flex justify-between border-t border-neutral-200 pt-2 font-semibold"><span>Estimated total</span><span>{formatNpr(total)}</span></p>
        </div>
        <Link href="/checkout" className="mt-4 block rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white">Proceed to Checkout</Link>
        <Link href="/shop" className="mt-2 block rounded-xl border border-black px-4 py-3 text-center text-sm font-semibold">Continue Shopping</Link>
      </aside>
    </div>
  );
}
