import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Link2, ShoppingBag, User, Menu, X, Shield, ArrowRight, Calculator } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Paste Link & Quote', href: '/request-product' },
    { name: 'Rate Calculator', href: '/#calculator' },
    { name: 'Supported Stores', href: '/#stores' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Track Order', href: '/track-order' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 bg-white border-b border-neutral-200 transition-shadow duration-200 ${
        scrolled ? 'shadow-xs' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/sajilomarts-logo.png"
              alt="SajiloMarts Logo"
              className="h-6 sm:h-7 w-auto object-contain"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 group-hover:text-amber-600 transition">
              SajiloMarts
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? location.pathname === '/' && !location.hash
                : link.href.startsWith('/#')
                ? location.hash === link.href.replace('/', '')
                : location.pathname === link.href;

            return (
              <a
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-amber-900 bg-amber-50 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right Actions: Paste Link CTA, Cart & User */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Direct CTA */}
          <Link
            to="/request-product"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-bold transition shadow-xs"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Paste Link & Order</span>
          </Link>

          {/* Cart Link (if orders in cart) */}
          {totalItems > 0 && (
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-neutral-950 px-1">
                {totalItems}
              </span>
            </Link>
          )}

          {/* User / Login Link */}
          {loading && !user ? (
            <div className="w-16 h-8 rounded-lg bg-neutral-100 animate-pulse" />
          ) : user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/account'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold transition"
              title={user.fullName || user.email}
            >
              {user.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              <span className="max-w-[100px] truncate">{user.fullName?.split(' ')[0] || 'Account'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition shadow-xs"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block py-2 px-3 rounded-md text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-neutral-100">
            <Link
              to="/request-product"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs"
            >
              <Link2 className="h-4 w-4" />
              <span>Paste Link & Get Quote</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
