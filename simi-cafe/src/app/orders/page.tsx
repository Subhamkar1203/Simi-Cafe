"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock, CheckCircle, ChefHat, XCircle, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Polling for live updates
  useEffect(() => {
    if (user === null) {
      router.push("/account/login?redirect=/orders");
      return;
    }

    if (!user) return;

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, router]);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "cancel" })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Could not cancel order");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReorder = async (orderId: number) => {
    try {
      const res = await fetch("/api/orders/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      if (res.ok) {
        const data = await res.json();
        data.items.forEach((item: any) => {
          addItem({
            menu_item_id: item.menu_item_id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image_url: item.image_url
          });
        });
        setIsCartOpen(true);
      }
    } catch (e) {
      console.error("Reorder failed", e);
    }
  };

  const handlePrintReceipt = (orderId: number) => {
    // In a real app, open a new window with a printable receipt view.
    // For now, we just use window.print() conceptually.
    alert(`Generating receipt for Order #${orderId}...`);
    window.print();
  };

  if (isLoading) {
    return (
      <div className="site-page px-5 pb-32 pt-32 sm:px-8 flex justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-[rgb(var(--border-soft))] border-t-[rgb(var(--accent))]" />
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending": return { label: "Order Received", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "preparing": return { label: "Preparing", icon: ChefHat, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "ready": return { label: "Ready for Pickup", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" };
      case "completed": return { label: "Completed", icon: CheckCircle, color: "text-gray-500", bg: "bg-gray-500/10" };
      case "cancelled": return { label: "Cancelled", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" };
      default: return { label: status, icon: Clock, color: "text-gray-500", bg: "bg-gray-500/10" };
    }
  };

  return (
    <div className="site-page px-5 pb-32 pt-32 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--forest))] site-eyebrow">Your Tracking</p>
            <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Orders</h1>
          </div>
          <Button variant="secondary" onClick={() => fetchOrders()} className="w-fit">
            <RefreshCw className="mr-2 size-4" /> Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border bg-[rgb(var(--surface-raised)_/_0.5)] p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">No orders found</h2>
            <p className="mt-2 text-muted-foreground">You haven't placed any orders yet.</p>
            <Button className="mt-6" onClick={() => router.push("/menu")}>Browse Menu</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {orders.map(order => {
              const statusDisplay = getStatusDisplay(order.status);
              const StatusIcon = statusDisplay.icon;
              
              return (
                <div key={order.id} className="rounded-3xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.6)] p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-col gap-4 border-b border-[rgb(var(--border-soft))] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold">Order #{order.id}</h2>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    
                    <div className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${statusDisplay.bg} ${statusDisplay.color}`}>
                      <StatusIcon className="size-4" />
                      {statusDisplay.label}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div>
                      <ul className="flex flex-col gap-3">
                        {order.items?.map((item: any) => (
                          <li key={item.id} className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0">
                              <Image 
                                src={item.image_url || "/images/placeholder.jpg"} 
                                alt="" 
                                fill
                                sizes="48px"
                                className={`rounded-lg object-cover ${!item.image_url ? 'opacity-75 mix-blend-luminosity saturate-50' : ''}`} 
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{item.price * item.quantity}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl bg-[rgb(var(--surface)_/_0.5)] p-4">
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-semibold uppercase">{order.order_type}</span></p>
                        <p className="flex justify-between"><span className="text-muted-foreground">Timing:</span> <span className="font-semibold">{order.scheduled_time}</span></p>
                        <p className="flex justify-between"><span className="text-muted-foreground">Payment:</span> <span className="font-semibold uppercase">{order.payment_mode}</span></p>
                        {order.order_type === "delivery" && (
                          <p className="flex justify-between"><span className="text-muted-foreground">Address:</span> <span className="font-semibold text-right max-w-[200px] truncate">{order.delivery_address}</span></p>
                        )}
                        <p className="flex justify-between pt-2 border-t text-lg font-bold"><span className="text-muted-foreground">Total:</span> <span className="text-[rgb(var(--forest))]">₹{order.total_amount}</span></p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.status === "pending" && (
                          <Button variant="secondary" size="sm" onClick={() => handleCancel(order.id)}>
                            <XCircle className="mr-2 size-4" /> Cancel Order
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => handleReorder(order.id)}>
                          <RefreshCw className="mr-2 size-4" /> Reorder
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handlePrintReceipt(order.id)}>
                          <FileText className="mr-2 size-4" /> Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
