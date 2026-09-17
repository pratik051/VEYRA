import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function MobileNav() {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/shop', label: 'Shop', icon: Compass },
    { to: '/request-product', label: 'Quote', icon: PlusCircle, highlight: true },
    { to: '/cart', label: 'Cart', icon: ShoppingBag, badge: totalItems },
    {
      to: user ? (user.role === 'admin' ? '/admin' : '/account') : (loading ? '#' : '/login'),
      label: user ? (user.role === 'admin' ? 'Admin' : 'Account') : (loading ? '...' : 'Login'),
      icon: User
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-1.5 shadow-sm"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 rounded-lg transition-all relative ${
                  isActive
                    ? 'text-neutral-900 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 font-medium'
                } ${item.highlight ? 'text-amber-700 font-bold' : ''}`
              }
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-neutral-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
