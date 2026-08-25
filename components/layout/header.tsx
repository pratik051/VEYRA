"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { SearchModal } from "@/components/ui/search-modal";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/request-product", label: "Request From India", highlight: true },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { items } = useCart();
  const { ids } = useWishlist();
  const pathname = usePathname();

  const totalCartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-all">
        {/* Top announcement bar */}
        <div className="bg-black py-1.5 px-4 text-center text-[11px] font-medium tracking-wide text-white">
          <span>🇳🇵 Discover Products from India &amp; Global Stores • Delivered Anywhere in Nepal</span>
          <Link href="/request-product" className="ml-2 font-bold text-veyra-gold hover:underline">
            Request a Quote →
          </Link>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-xl font-extrabold tracking-[0.25em] text-neutral-900 group-hover:text-black transition">
              VEYRA
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-veyra-gold"></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors py-1 relative ${
                    item.highlight
                      ? "text-veyra-gold font-semibold hover:text-veyra-gold-dark"
                      : isActive
                      ? "text-black font-semibold"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {item.label}
                  {item.highlight && (
                    <span className="ml-1 rounded-full bg-veyra-gold/15 px-1.5 py-0.2 text-[9px] font-bold text-veyra-gold-dark">
                      HOT
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-xs text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 transition"
              aria-label="Search"
            >
              <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search products...</span>
              <kbd className="hidden lg:inline-block rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Wishlist Link */}
            <Link
              href="/account?tab=Wishlist"
              className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition"
              aria-label="Wishlist"
            >
              <span>🤍</span>
              {ids.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                  {ids.length}
                </span>
              )}
            </Link>

            {/* Account Link */}
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Account</span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Cart</span>
              <span className="rounded-full bg-veyra-gold px-1.5 py-0.2 text-[11px] font-bold text-black ml-0.5">
                {totalCartCount}
              </span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-800 hover:bg-neutral-100 lg:hidden transition"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden animate-fade-in shadow-xl">
            <div className="grid gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    item.highlight
                      ? "bg-veyra-gold/10 text-veyra-gold font-semibold"
                      : "text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.highlight && <span className="text-xs font-bold">✨ Request Link</span>}
                </Link>
              ))}

              <div className="my-2 border-t border-neutral-100 pt-2 grid grid-cols-2 gap-2">
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/account"
                  className="rounded-xl border border-neutral-200 py-2.5 text-center text-xs font-semibold text-neutral-800"
                >
                  My Account
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/admin"
                  className="rounded-xl border border-neutral-200 py-2.5 text-center text-xs font-semibold text-neutral-800"
                >
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
