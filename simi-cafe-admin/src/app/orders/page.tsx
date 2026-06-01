"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { toaster } from "@/components/toaster";

interface Order {
  id: number;
  user_name: string;
  total_amount: number;
  status: string;
  payment_mode: string;
  payment_confirmed: boolean;
  created_at: string;
}

const statuses = ["pending", "paid", "preparing", "ready", "completed", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    if (res.ok) {
      toaster.create({ title: "Status Updated", description: `Order #${orderId} is now ${newStatus}.`, type: "success" });
      fetchOrders();
    } else {
      toaster.create({ title: "Update Failed", description: "Could not update order status.", type: "error" });
    }
  };

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage and track all customer orders</p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr className="desktop-table-header">
              <th>ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td data-label="ID">#{order.id}</td>
                  <td data-label="Customer">{order.user_name}</td>
                  <td data-label="Amount">₹{Number(order.total_amount).toFixed(2)}</td>
                  <td data-label="Payment">
                    <span className={`badge ${order.payment_confirmed ? "badge-confirmed" : "badge-pending"}`}>
                      {order.payment_confirmed ? "Confirmed" : order.payment_mode}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td data-label="Action">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{
                        padding: "0.3rem 0.5rem",
                        borderRadius: "0.375rem",
                        border: "1px solid var(--admin-border)",
                        fontSize: "0.75rem",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </main>
  );
}
