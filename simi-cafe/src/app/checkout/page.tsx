"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroContentCard } from "@/components/ui/hero-content-card";

export default function CheckoutPage() {
  const { items, totalAmount, taxAmount, finalTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderTime, setOrderTime] = useState("asap");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/account/login?redirect=/checkout");
    }
  }, [user, router]);

  if (user === null) {
    return null;
  }

  // Redirect if cart empty
  if (items.length === 0) {
    return (
      <div className="site-page px-5 pb-32 pt-6 sm:pt-8 md:pt-32 sm:px-8 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-4xl font-bold">Your cart is empty</h1>
        <Button className="mt-6" onClick={() => router.push("/menu")}>Back to Menu</Button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      setError("Please provide a delivery address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
          order_type: orderType,
          delivery_address: orderType === "delivery" ? deliveryAddress : null,
          payment_mode: paymentMode,
          scheduled_time: orderTime
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();
      router.push("/orders?orderSuccess=true");
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-page px-5 pb-32 pt-6 sm:pt-8 md:pt-32 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <HeroContentCard title="Checkout" className="mb-10" />
        
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {/* Order Summary */}
          <div className="rounded-3xl border bg-[rgb(var(--surface-raised)_/_0.5)] p-6 shadow-sm flex flex-col h-fit">
            <h2 className="mb-4 text-xl font-bold uppercase tracking-widest text-[rgb(var(--forest))]">Order Summary</h2>
            <ul className="flex flex-col gap-4 flex-1">
              {items.map(item => (
                <li key={item.menu_item_id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative size-16 shrink-0">
                      <Image 
                        src={item.image_url || "/images/placeholder.jpg"} 
                        alt="" 
                        fill
                        sizes="64px"
                        className={`rounded-xl object-cover ${!item.image_url ? 'opacity-75 mix-blend-luminosity saturate-50' : ''}`} 
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t pt-4 space-y-3">
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
          </div>

          {/* Checkout Form */}
          <div>
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-8 rounded-3xl border bg-[rgb(var(--surface-raised)_/_0.5)] p-6 shadow-sm">
              {error && (
                <div className="rounded-lg bg-red-100 p-4 text-sm font-bold text-red-700">{error}</div>
              )}

              <div>
                <h2 className="mb-4 text-lg font-bold">Order Type</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 h-14 font-semibold transition has-[:checked]:border-[rgb(var(--accent))] has-[:checked]:bg-[rgb(var(--accent)_/_0.1)]">
                    <input type="radio" name="orderType" value="pickup" checked={orderType === "pickup"} onChange={() => setOrderType("pickup")} className="sr-only" />
                    Pickup
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 h-14 font-semibold transition has-[:checked]:border-[rgb(var(--accent))] has-[:checked]:bg-[rgb(var(--accent)_/_0.1)]">
                    <input type="radio" name="orderType" value="delivery" checked={orderType === "delivery"} onChange={() => setOrderType("delivery")} className="sr-only" />
                    Delivery
                  </label>
                </div>
              </div>

              {orderType === "pickup" && (
                <div>
                  <h2 className="mb-2 text-lg font-bold">Pickup Time</h2>
                  <select 
                    value={orderTime}
                    onChange={(e) => setOrderTime(e.target.value)}
                    className="w-full rounded-xl border bg-transparent p-3 outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                  >
                    <option value="asap">As soon as possible (15-20 mins)</option>
                    <option value="30m">In 30 minutes</option>
                    <option value="1h">In 1 hour</option>
                    <option value="schedule">Schedule for later today</option>
                  </select>
                </div>
              )}

              {orderType === "delivery" && (
                <div>
                  <h2 className="mb-2 text-lg font-bold">Delivery Address</h2>
                  <textarea 
                    rows={3} 
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full address..."
                    className="w-full rounded-xl border bg-transparent p-3 outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                    required
                  />
                  <div className="mt-4">
                    <h2 className="mb-2 text-sm font-bold">Delivery Time</h2>
                    <select 
                      value={orderTime}
                      onChange={(e) => setOrderTime(e.target.value)}
                      className="w-full rounded-xl border bg-transparent p-3 outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                    >
                      <option value="asap">As soon as possible (30-45 mins)</option>
                      <option value="1h">In 1 hour</option>
                      <option value="schedule">Schedule for later today</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <h2 className="mb-4 text-lg font-bold">Payment Method</h2>
                <div className="flex gap-4">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 font-semibold transition has-[:checked]:border-[rgb(var(--accent))] has-[:checked]:bg-[rgb(var(--accent)_/_0.1)]">
                    <input type="radio" name="paymentMode" value="cash" checked={paymentMode === "cash"} onChange={() => setPaymentMode("cash")} className="sr-only" />
                    Cash on {orderType === "pickup" ? "Pickup" : "Delivery"}
                  </label>
                  {/* Future integration: <label>Online Payment</label> */}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full text-lg shadow-md transition-transform active:scale-95" disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : `Place Order (₹${finalTotal.toFixed(2)})`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
