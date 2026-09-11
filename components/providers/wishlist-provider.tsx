"use client";

import { createContext, useContext, useEffect, useState } from "react";

type WishlistContextType = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("linkova_wishlist") || localStorage.getItem("veyra_wishlist") || "[]");
      if (Array.isArray(saved)) setIds(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const save = (newIds: string[]) => {
    setIds(newIds);
    try {
      localStorage.setItem("linkova_wishlist", JSON.stringify(newIds));
    } catch (e) {
      console.error(e);
    }
  };

  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    save(next);
  };

  const has = (id: string) => ids.includes(id);

  const clear = () => {
    save([]);
  };

  return <WishlistContext.Provider value={{ ids, toggle, has, clear }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
