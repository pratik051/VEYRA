import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { SearchModal } from './SearchModal';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();

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
    { name: 'How It Works', href: '/how-it-works' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-neutral-950/95 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-neutral-950 border-b border-neutral-900'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800 hover:bg-neutral-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/sajilomarts-logo.png"
                alt="SajiloMarts Logo"
                className="h-10 w-auto object-contain rounded-lg shadow-sm"
              />
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/80 p-1.5 rounded-full border border-neutral-800 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              to="/request-product"
              className="px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-neutral-950 hover:opacity-95 transition-opacity shadow-xs"
            >
              🇮🇳 Sourcing Portal
            </Link>
          </nav>

          {/* Right Action Icons: Search, Wishlist, Cart, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-xs font-medium transition"
              aria-label="Search catalog"
            >
              <Search className="h-4 w-4 text-neutral-400" />
              <span className="hidden sm:inline text-neutral-400">Search products...</span>
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/account?tab=wishlist"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white px-1 shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-neutral-950 px-1 shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Account / Admin Button */}
            <Link
              to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-200 transition"
            >
              {user && user.role === 'admin' ? (
                <>
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="hidden sm:inline">
                    {user ? user.fullName?.split(' ')[0] || 'Account' : 'Login'}
                  </span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-900 bg-neutral-950 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/request-product"
              className="block py-2.5 px-3 rounded-xl text-xs font-black bg-amber-400 text-neutral-950"
            >
              🇮🇳 Request India Product
            </Link>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
