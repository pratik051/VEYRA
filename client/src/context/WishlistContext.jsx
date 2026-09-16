import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sajilomarts_wishlist') || '[]');
      if (Array.isArray(saved)) setIds(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const save = (newIds) => {
    setIds(newIds);
    try {
      localStorage.setItem('sajilomarts_wishlist', JSON.stringify(newIds));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWishlist = (id) => {
    if (ids.includes(id)) {
      save(ids.filter((item) => item !== id));
    } else {
      save([...ids, id]);
    }
  };

  const isInWishlist = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider value={{ ids, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
