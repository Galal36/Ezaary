import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number; // Final price (after discount)
  originalPrice?: number; // Original price before discount
  discountPercentage?: number; // Discount percentage
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  available_sizes?: string[];
  available_colors?: string[];
  stock_quantity?: number; // Available stock quantity from database
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("izaar_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("izaar_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      const stockQuantity = item.stock_quantity ?? Infinity; // Default to Infinity if not provided
      const requestedQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Check stock availability
      if (stockQuantity !== undefined && stockQuantity < Infinity && requestedQuantity > stockQuantity) {
        toast.error(`المتاح في المخزون: ${stockQuantity} قطعة فقط`);
        return prevItems; // Don't update if exceeds stock
      }

      if (existingItem) {
        // Update quantity and refresh properties (in case name, price, or available options changed)
        const updated = prevItems.map((i) =>
          i.id === item.id
            ? { ...i, ...item, quantity: i.quantity + quantity } // Merge new details + update quantity
            : i
        );
        toast.success(`تم تحديث الكمية في السلة`);
        return updated;
      } else {
        // Add new item
        toast.success("تم إضافة المنتج إلى السلة");
        return [...prevItems, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast.success("تم حذف المنتج من السلة");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === id);
      if (!item) return prevItems;
      
      const stockQuantity = item.stock_quantity ?? Infinity; // Default to Infinity if not provided
      
      // Check stock availability
      if (stockQuantity !== undefined && stockQuantity < Infinity && quantity > stockQuantity) {
        toast.error(`المتاح في المخزون: ${stockQuantity} قطعة فقط`);
        return prevItems; // Don't update if exceeds stock
      }
      
      return prevItems.map((item) => (item.id === id ? { ...item, quantity } : item));
    });
  };

  const clearCart = () => {
    setItems([]);
    toast.success("تم تفريغ السلة");
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};





