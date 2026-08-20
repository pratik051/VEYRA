"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/request-product", label: "Request From India" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-[0.2em]">
          VEYRA
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-neutral-700 transition hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/shop" className="rounded-lg border px-3 py-1.5 text-sm">
            Search
          </Link>
          <Link href="/account" className="hidden rounded-lg border px-3 py-1.5 text-sm sm:block">
            Account
          </Link>
          <Link href="/cart" className="rounded-lg bg-black px-3 py-1.5 text-sm text-white">
            Cart ({items.length})
          </Link>
          <button className="rounded-lg border px-2 py-1 md:hidden" onClick={() => setOpen((v) => !v)}>
            ☰
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-neutral-200 px-4 py-3 md:hidden">
          <div className="grid gap-2">
            {nav.map((item) => (
              <Link key={item.href} onClick={() => setOpen(false)} href={item.href} className="rounded-lg px-3 py-2 text-sm hover:bg-neutral-100">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
