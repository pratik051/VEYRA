import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sajilomarts_wishlist') || '[]');
      if (Array.isArray(saved)) setWishlist(saved);
    } catch (e) {
      console.error("Failed to load wishlist:", e);
    }
  }, []);

  const save = (items) => {
    setWishlist(items);
    try {
      localStorage.setItem('sajilomarts_wishlist', JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  };

  const toggleWishlist = (productOrId) => {
    const targetId = typeof productOrId === 'object'
      ? (productOrId._id || productOrId.id || productOrId.slug)
      : productOrId;

    const exists = wishlist.some((item) => {
      const itemId = typeof item === 'object' ? (item._id || item.id || item.slug) : item;
      return itemId === targetId;
    });

    if (exists) {
      save(wishlist.filter((item) => {
        const itemId = typeof item === 'object' ? (item._id || item.id || item.slug) : item;
        return itemId !== targetId;
      }));
    } else {
      save([...wishlist, productOrId]);
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => {
      const itemId = typeof item === 'object' ? (item._id || item.id || item.slug) : item;
      return itemId === id;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        ids: wishlist.map((item) => (typeof item === 'object' ? item._id || item.id || item.slug : item)),
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
