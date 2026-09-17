import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const { ids } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();

  const totalCartCount = items ? items.reduce((acc, curr) => acc + curr.quantity, 0) : 0;
  const totalWishlistCount = ids ? ids.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/shop' },
    { name: 'India Sourcing', href: '/request-product' },
    { name: 'Track Order', href: '/track-order' },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 shadow-md' : 'bg-neutral-950 border-b border-neutral-850'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800"
          >
            ☰
          </button>
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/sajilomarts-logo.png" alt="SajiloMarts Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
            <div className="flex flex-col justify-center">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent group-hover:opacity-95 transition">
                SajiloMarts
              </span>
              <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase -mt-1 hidden sm:block">
                Shop Easy • Live Better
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1.5 rounded-full border border-neutral-800">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/request-product"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-red-500 text-neutral-950 hover:opacity-95 transition-opacity"
          >
            🇮🇳 Request Link
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 transition"
          >
            🛒
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-neutral-950">
                {totalCartCount}
              </span>
            )}
          </Link>

          <Link
            to="/account"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-200 transition"
          >
            👤 <span>{user ? (user.role === 'admin' ? 'Admin Dashboard' : user.fullName.split(' ')[0]) : 'Account'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
