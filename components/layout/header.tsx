"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { SearchModal } from "@/components/ui/search-modal";
import ThemeToggle from "@/components/ui/ThemeToggle";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.2 10.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7" />
      <circle cx="10" cy="18.5" r="1.2" />
      <circle cx="17" cy="18.5" r="1.2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19c1.7-3 4.3-4.5 8-4.5s6.3 1.5 8 4.5" />
    </svg>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();

  const totalCartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "glass-header-light dark:glass-header-dark border-b border-black/[0.04] shadow-header"
            : "bg-veyra-bg/90 dark:bg-[#071018] border-b border-black/[0.04] dark:border-white/[0.04]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-display text-xl font-black tracking-[0.22em] text-veyra-text transition-all duration-300 group-hover:text-veyra-gold sm:tracking-[0.28em]">
              VEYRA
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="relative text-sm font-medium text-veyra-muted transition-colors duration-200 hover:text-veyra-text after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-veyra-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="relative text-sm font-medium text-veyra-muted transition-colors duration-200 hover:text-veyra-text after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-veyra-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              About
            </Link>
            <Link
              href="/shop"
              className="relative text-sm font-medium text-veyra-muted transition-colors duration-200 hover:text-veyra-text after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-veyra-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              Shop
            </Link>
            <Link
              href="/request-product"
              className="shimmer-gold rounded-lg bg-veyra-gold px-4 py-2 text-xs font-bold tracking-wide text-black transition-all duration-200 hover:bg-veyra-gold-light hover:shadow-gold"
            >
              Request From India
            </Link>
            <Link href="/cart" className="relative text-veyra-muted transition hover:text-veyra-text">
              <CartIcon />
              {totalCartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-veyra-gold text-[9px] font-black text-black">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="text-veyra-muted transition hover:text-veyra-text">
              <UserIcon />
            </Link>

            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
