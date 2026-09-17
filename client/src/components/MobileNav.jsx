import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function MobileNav() {
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/shop', label: 'Shop', icon: Compass },
    { to: '/request-product', label: 'Request', icon: PlusCircle, highlight: true },
    { to: '/cart', label: 'Cart', icon: ShoppingBag, badge: totalItems },
    { to: user ? '/account' : '/login', label: user ? 'Account' : 'Login', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                  isActive ? 'text-neutral-950 font-black' : 'text-neutral-400 font-semibold'
                } ${item.highlight ? 'text-red-600' : ''}`
              }
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${item.highlight ? 'stroke-[2.5]' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
