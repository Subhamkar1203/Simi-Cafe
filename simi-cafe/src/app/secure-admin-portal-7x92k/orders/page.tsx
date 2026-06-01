"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Clock, ChefHat, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AdminOrderItem { id: number; quantity: number; name: string; price: number; }
interface AdminOrder {
  id: number; status: string; created_at: string; total_amount: number; user_name: string;
  user_phone: string; order_type: string; scheduled_time?: string; delivery_address?: string;
  rejection_reason?: string; items?: AdminOrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  const router = useRouter();
  const previousOrdersRef = useRef<AdminOrder[]>([]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const fetchOrders = async (showLoading = true) => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) {
        router.push("/secure-admin-portal-7x92k/login");
        return;
      }
      const data = await res.json();
      const newOrdersData: AdminOrder[] = data.orders || [];

      // Check for new orders if not initial load
      if (!showLoading && previousOrdersRef.current.length > 0) {
        const currentPendingIds = previousOrdersRef.current.filter(o => o.status === "pending").map(o => o.id);
        const incomingPending = newOrdersData.filter(o => o.status === "pending");

        const hasNewOrder = incomingPending.some(o => !currentPendingIds.includes(o.id));
        if (hasNewOrder) {
          showNotification("New order received!");
          // Optional: play sound
          try {
            new Audio('/notification.mp3').play().catch(() => { });
          } catch {
            // ignore
          }
        }
      }

      setOrders(newOrdersData);
      previousOrdersRef.current = newOrdersData;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };
  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchOrders moved up

  const updateOrderStatus = async (orderId: number, status: string, reason?: string) => {
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, rejection_reason: reason })
      });
      fetchOrders(false);
      showNotification(`Order #${orderId} marked as ${status}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-10">Loading orders...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  const newOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => ["preparing", "ready"].includes(o.status));
  const pastOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status));

  const renderOrderCard = (order: AdminOrder, isNew: boolean) => (
    <div key={order.id} className={`mb-4 rounded-xl border p-6 shadow-sm ${isNew ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
      <div className="flex justify-between border-b pb-4 mb-4 border-gray-100">
        <div>
          <h3 className="text-xl font-bold">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold uppercase ${order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
            }`}>
            {order.status}
          </span>
          <p className="mt-1 font-bold text-lg">₹{order.total_amount}</p>
        </div>
      </div>

      <div className="mb-4 text-sm bg-gray-50 p-3 rounded-lg">
        <p><strong>Customer:</strong> {order.user_name} ({order.user_phone})</p>
        <p><strong>Type:</strong> <span className="uppercase">{order.order_type}</span></p>
        <p><strong>Timing:</strong> <span className="font-semibold text-blue-600">{order.scheduled_time || 'asap'}</span></p>
        {order.order_type === "delivery" && <p><strong>Address:</strong> {order.delivery_address}</p>}
        {order.rejection_reason && <p className="text-red-600 mt-2"><strong>Reason:</strong> {order.rejection_reason}</p>}
      </div>

      <ul className="mb-6 space-y-2">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between border-b border-gray-100 pb-2 text-sm">
            <span><span className="font-bold">{item.quantity}x</span> {item.name}</span>
            <span>₹{item.price * item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        {order.status === "pending" && (
          <>
            <Button onClick={() => updateOrderStatus(order.id, "preparing")} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 size-4" /> Accept & Prepare
            </Button>
            <Button onClick={() => {
              const reason = prompt("Reason for cancellation:");
              if (reason !== null) updateOrderStatus(order.id, "cancelled", reason);
            }} variant="secondary">
              <XCircle className="mr-2 size-4" /> Reject
            </Button>
          </>
        )}

        {order.status === "preparing" && (
          <Button onClick={() => updateOrderStatus(order.id, "ready")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ChefHat className="mr-2 size-4" /> Mark as Ready
          </Button>
        )}

        {order.status === "ready" && (
          <Button onClick={() => updateOrderStatus(order.id, "completed")} className="bg-gray-800 hover:bg-gray-900 text-white">
            <CheckCircle className="mr-2 size-4" /> Complete Order
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen text-gray-900 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl">
          <Bell className="size-5 text-yellow-400 animate-bounce" />
          <p className="font-bold">{notification}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cafe Orders Dashboard</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" /> Live Updates On
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* New Orders */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600">
            <Clock className="size-5" /> New Requests ({newOrders.length})
          </h2>
          {newOrders.map(o => renderOrderCard(o, true))}
          {newOrders.length === 0 && <p className="text-gray-500 bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center">No new orders waiting.</p>}
        </div>

        {/* Active Orders */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
            <ChefHat className="size-5" /> In Kitchen / Ready ({activeOrders.length})
          </h2>
          {activeOrders.map(o => renderOrderCard(o, false))}
          {activeOrders.length === 0 && <p className="text-gray-500 bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center">No active orders.</p>}
        </div>

        {/* Past Orders */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-600">
            <CheckCircle className="size-5" /> Completed ({pastOrders.length})
          </h2>
          {pastOrders.map(o => renderOrderCard(o, false))}
        </div>
      </div>
    </div>
  );
}
