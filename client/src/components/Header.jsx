import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield, Sun, Moon, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SearchModal } from './SearchModal';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
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
    { name: 'Support', href: '/support' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0b1437]/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-[#1b2559] shadow-md'
            : 'bg-white dark:bg-[#0b1437] border-b border-neutral-200/80 dark:border-[#1b2559]'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2.5 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-neutral-100 dark:bg-[#111c44] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-[#1b2559] hover:bg-neutral-200 dark:hover:bg-[#1b254b] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
              <img
                src="/sajilomarts-logo.png"
                alt="SajiloMarts Logo"
                className="h-8 sm:h-10 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent group-hover:opacity-90 transition shrink-0 whitespace-nowrap">
                  SajiloMarts
                </span>
                <span className="text-[9px] font-bold text-neutral-400 dark:text-[#a3aed0] tracking-wider uppercase -mt-1 hidden md:block">
                  Shop Easy • Live Better
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/90 dark:bg-[#111c44] p-1.5 rounded-full border border-neutral-200/90 dark:border-[#1b2559] shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 shadow-xs'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#1b254b]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              to="/request-product"
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-neutral-950 hover:opacity-95 transition-opacity shadow-xs"
            >
              🇮🇳 Sourcing Portal
            </Link>
          </nav>

          {/* Right Action Icons: Search, Theme Toggle, Wishlist, Cart, Account */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-neutral-100 dark:bg-[#111c44] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-[#1b2559] hover:bg-neutral-200 dark:hover:bg-[#1b254b] text-xs font-medium transition"
              aria-label="Search catalog"
              title="Search products"
            >
              <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-300" />
              <span className="hidden md:inline text-neutral-500 dark:text-neutral-300">Search products...</span>
            </button>

            {/* Theme Toggle Button (Light/Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#111c44] hover:bg-neutral-200 dark:hover:bg-[#1b254b] text-neutral-800 dark:text-amber-400 border border-neutral-200 dark:border-[#1b2559] transition"
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-300" /> : <Moon className="h-4 w-4 text-neutral-700 animate-in spin-in-180 duration-300" />}
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/account?tab=wishlist"
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#111c44] hover:bg-neutral-200 dark:hover:bg-[#1b254b] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-[#1b2559] transition"
              aria-label="Wishlist"
              title="Wishlist"
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
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#111c44] hover:bg-neutral-200 dark:hover:bg-[#1b254b] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-[#1b2559] transition"
              aria-label="Shopping Cart"
              title="Shopping Cart"
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
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full bg-neutral-900 dark:bg-amber-400 hover:bg-neutral-800 dark:hover:bg-amber-300 text-white dark:text-neutral-950 text-xs font-bold transition shadow-2xs shrink-0"
              title={user ? user.fullName : 'Login'}
            >
              {user && user.role === 'admin' ? (
                <>
                  <Shield className="h-4 w-4" />
                  <span className="hidden md:inline">Admin</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {user ? user.fullName?.split(' ')[0] || 'Account' : 'Login'}
                  </span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#111c44] transition"
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/support"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#111c44] transition"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-500" />
                <span>AI Support &amp; Help Desk</span>
              </span>
              <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                24/7 AI
              </span>
            </Link>

            <Link
              to="/request-product"
              className="block py-2.5 px-3 rounded-xl text-xs font-black bg-amber-400 text-neutral-950 shadow-xs"
            >
              🇮🇳 Request India Product
            </Link>

            {/* Mobile Theme Toggle Row */}
            <div className="pt-2 border-t border-neutral-100 dark:border-[#1b2559] flex items-center justify-between px-3 py-1">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Theme Mode</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#111c44] text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-[#1b2559]"
              >
                {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-neutral-700" />}
                <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Header;
