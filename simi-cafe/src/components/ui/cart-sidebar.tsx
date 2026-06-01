"use client";

import { X, Trash2, Plus, Minus, ShoppingBag, Bookmark } from "lucide-react";
import { Button } from "./button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";

export function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, totalAmount, taxAmount, finalTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      router.push("/account/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[rgb(var(--surface))] p-6 pb-24 md:pb-6 shadow-2xl transition-transform flex flex-col">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border-soft))] pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-[rgb(var(--forest))]" />
              <h2 className="font-serif text-2xl font-bold">Your Cart</h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="rounded-full bg-[rgb(var(--surface-muted)_/_0.5)] p-2 transition hover:bg-[rgb(var(--surface-raised))]"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 pr-2">
            {items.length === 0 ? (
              <div className="relative flex h-full flex-col items-center justify-center text-center text-[rgb(var(--foreground))] overflow-hidden rounded-[2rem] mx-2 p-6 shadow-inner border border-[rgb(var(--border-soft))]">
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dlupquidc/image/upload/f_auto,q_auto,c_fill,w_800/simi-cafe/static/spirited_away_flowers')] bg-cover bg-center opacity-30 blur-[2px] pointer-events-none" />
                <div className="absolute inset-0 bg-[rgb(var(--surface)_/_0.6)] backdrop-blur-md pointer-events-none" />
                
                <div className="relative z-10 mb-4 rounded-full bg-[rgb(var(--surface-raised)_/_0.8)] p-4 shadow-sm border border-[rgb(var(--border-soft))]">
                  <ShoppingBag className="size-8 text-[rgb(var(--forest))]" />
                </div>
                <p className="relative z-10 font-serif text-2xl font-bold">Your cart is empty.</p>
                <p className="relative z-10 mt-1 text-sm font-semibold opacity-80">Looks like you haven&apos;t made your choice yet.</p>
                <Button 
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/menu");
                  }}
                  className="mt-6"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.menu_item_id} className="group relative flex gap-4 rounded-2xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.4)] p-3 transition hover:border-[rgb(var(--forest)_/_0.3)] hover:shadow-md">
                      <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border shadow-sm">
                        <Image 
                          src={item.image_url || "simi-cafe/static/placeholder"} 
                          alt="" 
                          fill
                          sizes="64px"
                          className={`object-cover ${!item.image_url ? 'opacity-75 mix-blend-luminosity saturate-50' : ''}`} 
                          loader={cloudinaryLoader}
                        />
                      </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold leading-tight">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item.menu_item_id)}
                          className="text-red-400 transition hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-[rgb(var(--forest))]">₹{item.price}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full bg-[rgb(var(--surface-muted)_/_0.6)] px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                            className="rounded-full p-1 transition hover:bg-white hover:shadow-sm"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                            className="rounded-full p-1 transition hover:bg-white hover:shadow-sm"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[rgb(var(--border-soft))] pt-6">
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax & Service Charge (5%)</span>
                  <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[rgb(var(--border-soft))] pt-3 text-xl font-bold">
                  <span>Final Total</span>
                  <span className="text-[rgb(var(--forest))]">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid gap-3">
                <Button 
                  className="w-full text-lg shadow-md transition-transform active:scale-95" 
                  size="lg" 
                  onClick={handleCheckout}
                >
                  {user ? "Proceed to Checkout" : "Login to Checkout"}
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/menu");
                    }}
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={clearCart}
                  >
                    <Trash2 className="mr-2 size-4" /> Clear
                  </Button>
                </div>
                
                {user && (
                  <div className="mt-2 text-center text-xs font-bold text-muted-foreground flex items-center justify-center gap-1">
                    <Bookmark className="size-3" /> Your cart is automatically saved.
                  </div>
                )}
                {!user && (
                  <div className="mt-2 text-center text-xs font-bold text-muted-foreground">
                    Items will be saved temporarily on this device.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
