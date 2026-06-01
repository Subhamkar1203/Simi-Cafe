"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "./auth-context";

export interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menu_item_id: number) => void;
  updateQuantity: (menu_item_id: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  taxAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track if a cart sync is pending to avoid race conditions
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncCartToDB = useCallback(async (cartItems: CartItem[]) => {
    try {
      await fetch("/api/user/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems })
      });
    } catch {
      console.error("Failed to sync cart to DB", e);
    }
  }, []);

  // Load cart from DB if logged in, else LocalStorage
  useEffect(() => {
    async function loadCart() {
      if (user) {
        try {
          const res = await fetch("/api/user/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.cart && Array.isArray(data.cart)) {
              // Optionally merge local cart with DB cart if needed, but for now we just load DB cart
              // If DB cart is empty but local is not, we might want to sync local -> DB.
              const localCart = localStorage.getItem("simi-cart");
              let initialItems = data.cart;
              
              if (data.cart.length === 0 && localCart) {
                try {
                  const parsed = JSON.parse(localCart);
                  if (parsed.length > 0) {
                    initialItems = parsed;
                    // Trigger a sync back to DB
                    syncCartToDB(initialItems);
                  }
                } catch {}
              }
              
              setItems(initialItems);
            }
          }
        } catch {
          console.error("Failed to load cart from DB", e);
        }
      } else {
        const savedCart = localStorage.getItem("simi-cart");
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch {
            console.error("Failed to parse cart", e);
          }
        }
      }
      setIsInitialized(true);
    }

    // Only load if not initialized or user state changed
    loadCart();
  }, [user, syncCartToDB]);


  // Save to local storage AND sync to DB if logged in
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("simi-cart", JSON.stringify(items));
      
      if (user) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          syncCartToDB(items);
        }, 1000); // Debounce DB sync
      }
    }
  }, [items, isInitialized, user, syncCartToDB]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.menu_item_id === item.menu_item_id);
      if (existing) {
        return current.map((i) =>
          i.menu_item_id === item.menu_item_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...current, item];
    });
    toaster.create({
      title: "Added to Cart",
      description: `${item.quantity}x ${item.name} has been added.`,
      type: "success"
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((menu_item_id: number) => {
    setItems((current) => current.filter((i) => i.menu_item_id !== menu_item_id));
  }, []);

  const updateQuantity = useCallback((menu_item_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menu_item_id);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.menu_item_id === menu_item_id ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const taxAmount = totalAmount * 0.05; // 5% tax
  const finalTotal = totalAmount + taxAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        taxAmount,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
