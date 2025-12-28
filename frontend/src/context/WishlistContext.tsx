'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  thumbnail?: string;
  slug?: string;
  category?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: WishlistItem) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  // Compatibility aliases
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem('bella_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {
      setWishlist([]);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('bella_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isClient]);

  const addToWishlist = useCallback((product: WishlistItem) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: WishlistItem) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId: number) => wishlist.some(item => item.id === productId), [wishlist]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const value = useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,
    // Compatibility aliases
    items: wishlist,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    toggleItem: toggleWishlist,
    clearWishlist,
    count: wishlistCount,
  }), [wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, wishlistCount, clearWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
