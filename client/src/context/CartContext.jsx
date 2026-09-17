import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sajilomarts_cart') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch (e) {
      console.error("Failed to load cart:", e);
    }
  }, []);

  const save = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem('sajilomarts_cart', JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const qty = product.quantity || quantity || 1;
    const prodId = product._id || product.id || product.slug;

    const existingIndex = items.findIndex((i) => (i._id || i.id || i.slug) === prodId);
    let next;
    if (existingIndex > -1) {
      next = items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + qty } : item
      );
    } else {
      next = [...items, { ...product, id: prodId, quantity: qty }];
    }
    save(next);
  };

  const removeFromCart = (id) => {
    const next = items.filter((i) => (i._id || i.id || i.slug) !== id);
    save(next);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    const next = items.map((i) => ((i._id || i.id || i.slug) === id ? { ...i, quantity: qty } : i));
    save(next);
  };

  const clearCart = () => {
    save([]);
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
