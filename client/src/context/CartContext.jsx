import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sajilomarts_cart') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const save = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem('sajilomarts_cart', JSON.stringify(newItems));
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existing = items.find((i) => i.id === product.id);
    let next;
    if (existing) {
      next = items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      next = [...items, { ...product, quantity }];
    }
    save(next);
  };

  const removeFromCart = (id) => {
    const next = items.filter((i) => i.id !== id);
    save(next);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    const next = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    save(next);
  };

  const clearCart = () => {
    save([]);
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
