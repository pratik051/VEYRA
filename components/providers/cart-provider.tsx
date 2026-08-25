"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";

type CartItem = Product & { quantity: number };
type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("veyra_cart") || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const save = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("veyra_cart", JSON.stringify(newItems));
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = items.find((i) => i.id === product.id);
    let next: CartItem[];
    if (existing) {
      next = items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      next = [...items, { ...product, quantity }];
    }
    save(next);
  };

  const removeFromCart = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    save(next);
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    const next = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    save(next);
  };

  const clearCart = () => {
    save([]);
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
