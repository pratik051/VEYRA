"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";

export function MobileNav() {
  const pathname = usePathname();
  const { items } = useCart();

  const totalCartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const tabs = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: "/shop",
      label: "Shop",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      href: "/request-product",
      label: "Request",
      highlight: true,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      href: "/cart",
      label: "Cart",
      count: totalCartCount,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      href: "/account",
      label: "Account",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-black/[0.04] bg-white/95 px-2 py-2 backdrop-blur-xl md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "text-veyra-gold"
                : tab.highlight
                ? "text-veyra-gold"
                : "text-veyra-muted hover:text-veyra-text"
            }`}
          >
            {tab.highlight ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-veyra-gold text-black shadow-gold -mt-3 mb-0.5 transition-all duration-200 hover:bg-veyra-gold-light hover:scale-110">
                {tab.icon}
              </div>
            ) : (
              <div className="relative">
                {tab.icon}
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-veyra-gold px-1 text-[9px] font-black text-black">
                    {tab.count}
                  </span>
                )}
              </div>
            )}
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "font-bold" : "font-medium"}`}>
              {tab.label}
            </span>
            {isActive && !tab.highlight && (
              <span className="absolute top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-veyra-gold" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
