"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { SearchModal } from "@/components/ui/search-modal";
import { usePathname } from "next/navigation";

const navLinks = [{ href: "/about", label: "About" }];

function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V20h14V9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function ShopIcon({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16l-1 11H5L4 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6.5A3 3 0 0 1 12 3.5a3 3 0 0 1 3 3V8" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();
  const { ids } = useWishlist();
  const pathname = usePathname();

  const totalCartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileNavItems = [
    { href: "/", label: "Home", icon: <HomeIcon active={pathname === "/"} /> },
    { href: "/shop", label: "Shop", icon: <ShopIcon active={pathname.startsWith("/shop")} /> },
    { href: "/request-product", label: "Request", icon: <RequestIcon />, highlight: true },
    { href: "/cart", label: "Cart", icon: <CartIcon />, badge: totalCartCount },
    { href: "/account", label: "Account", icon: <UserIcon /> }
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "glass-header-light border-b border-black/[0.04] shadow-header"
            : "bg-veyra-bg/90 border-b border-black/[0.04]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-display text-xl font-black tracking-[0.22em] text-veyra-text transition-all duration-300 group-hover:text-veyra-gold sm:tracking-[0.28em]">
              VEYRA
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-veyra-gold animate-glow-pulse" />
          </Link>

          {/* Desktop Right Nav */}
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
          </div>

          {/* Mobile: just logo visible, nav below */}
          <Link href="/about" className="lg:hidden text-sm font-medium text-veyra-muted hover:text-veyra-text transition">
            About
          </Link>
        </div>

        {/* Mobile Bottom Nav Bar */}
        <nav className="border-t border-black/[0.04] bg-white/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
            {mobileNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center"
                    aria-label={item.label}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-veyra-gold text-black shadow-gold ring-4 ring-veyra-bg transition-all duration-200 hover:bg-veyra-gold-light hover:scale-105">
                      {item.icon}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors"
                  aria-label={item.label}
                >
                  <span className={isActive ? "text-veyra-gold" : "text-veyra-muted"}>{item.icon}</span>
                  <span className={isActive ? "text-veyra-gold font-semibold" : "text-veyra-muted"}>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute right-2 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-veyra-gold px-1 text-[9px] font-black text-black">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-black/[0.04] bg-white px-4 py-4 lg:hidden animate-slide-down shadow-modal">
            <div className="grid gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-veyra-text hover:bg-black/5 transition"
                >
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="my-2 border-t border-black/[0.04] pt-2 grid grid-cols-2 gap-2">
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/account"
                  className="rounded-xl border border-black/5 py-2.5 text-center text-xs font-semibold text-veyra-text hover:bg-black/5 transition"
                >
                  My Account
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/admin"
                  className="rounded-xl border border-black/5 py-2.5 text-center text-xs font-semibold text-veyra-muted hover:bg-black/5 transition"
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
