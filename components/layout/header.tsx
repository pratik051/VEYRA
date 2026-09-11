"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { SearchModal } from "@/components/ui/search-modal";
import { usePathname } from "next/navigation";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

import { MARKETPLACE_METAS } from "@/lib/marketplace-constants";
import { MarketplaceLogo } from "@/components/ui/marketplace-logos";
import { LinkovaHeaderBrand } from "@/components/ui/linkova-brand-logo";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [marketplaceMenuOpen, setMarketplaceMenuOpen] = useState(false);
  const { items } = useCart();
  const { ids } = useWishlist();
  const pathname = usePathname();

  const totalCartCount = items ? items.reduce((acc, curr) => acc + curr.quantity, 0) : 0;
  const totalWishlistCount = ids ? ids.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Products", href: "/shop" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm"
            : "bg-white border-b border-neutral-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-4">
          {/* Brand Logo with Official Linkova Vector */}
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0">
            <LinkovaHeaderBrand theme="light" />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/70 p-1 rounded-full border border-neutral-200/60">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/request-product"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              🇮🇳 Request Link
            </Link>
          </nav>

          {/* Right Controls: Search Bar & Icons */}
          <div className="flex items-center gap-3">
            {/* Embedded Neo Search Bar */}
            <div
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center justify-between gap-3 bg-neutral-100/90 hover:bg-neutral-200/70 border border-neutral-200/80 rounded-full px-4 py-2 cursor-pointer transition w-52 md:w-64 text-xs text-neutral-500 hover:border-neutral-300"
            >
              <div className="flex items-center gap-2 truncate">
                <SearchIcon />
                <span className="truncate">Search products...</span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 bg-white rounded border border-neutral-200 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
            >
              <SearchIcon />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/dashboard?tab=wishlist"
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100/80 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition hover:scale-105"
            >
              <HeartIcon />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950 shadow-sm ring-2 ring-white">
                  {totalWishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100/80 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition hover:scale-105"
            >
              <CartIcon />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Account Icon */}
            <Link
              href="/dashboard"
              aria-label="Account Dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100/80 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition hover:scale-105"
            >
              <UserIcon />
            </Link>
          </div>
        </div>

        {/* ── Marketplace Channels Quick Bar ── */}
        <div className="border-t border-neutral-100 bg-neutral-50/80 hidden sm:block">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1.5 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none text-[11px] font-bold">
            <span className="text-neutral-400 font-extrabold uppercase tracking-wider text-[10px] flex-shrink-0 flex items-center gap-1 mr-1">
              <span>🇮🇳</span> Channels:
            </span>
            {MARKETPLACE_METAS.map((m) => {
              const isSelected =
                pathname === m.shopUrl ||
                pathname === `/marketplace/${m.id}` ||
                pathname.includes(`source=${m.id}`);
              return (
                <Link
                  key={m.id}
                  href={m.shopUrl}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                    isSelected
                      ? "bg-neutral-950 text-white shadow-xs"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-white border border-transparent hover:border-neutral-200"
                  }`}
                >
                  <div className="h-3.5 w-auto flex items-center">
                    <MarketplaceLogo marketplace={m.id} className="h-3 w-auto max-w-[40px]" />
                  </div>
                  <span>{m.shortName}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
