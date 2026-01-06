import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  discount?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  getTotalItems: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("izaar_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("izaar_wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist = (item: WishlistItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        // Already in wishlist, remove it
        const updated = prevItems.filter((i) => i.id !== item.id);
        toast.success("تم حذف المنتج من المفضلة");
        return updated;
      } else {
        // Add new item
        toast.success("تم إضافة المنتج إلى المفضلة");
        return [...prevItems, item];
      }
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast.success("تم حذف المنتج من المفضلة");
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const getTotalItems = () => {
    return items.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getTotalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};

