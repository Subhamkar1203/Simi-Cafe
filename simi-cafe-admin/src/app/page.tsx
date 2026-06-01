"use client";

import { useEffect, useState } from "react";
import { BagCheck, CurrencyDollar, Calendar3, People } from "react-bootstrap-icons";
import { Pagination } from "@/components/pagination";

interface DashboardStats {
  totalOrders: number;
  todayRevenue: number;
  pendingReservations: number;
  totalUsers: number;
  recentOrders: Array<{
    id: number;
    user_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  const recentOrders = stats?.recentOrders || [];
  const totalPages = Math.ceil(recentOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = recentOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&apos;s your café overview.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
            <BagCheck size={20} />
          </div>
          <div className="stat-value">{stats?.totalOrders ?? 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#d1fae5", color: "#059669" }}>
            <CurrencyDollar size={20} />
          </div>
          <div className="stat-value">₹{Number(stats?.todayRevenue ?? 0).toFixed(2)}</div>
          <div className="stat-label">Today&apos;s Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Calendar3 size={20} />
          </div>
          <div className="stat-value">{stats?.pendingReservations ?? 0}</div>
          <div className="stat-label">Pending Reservations</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}>
            <People size={20} />
          </div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
      </div>

      <div className="page-header">
        <h1 style={{ fontSize: "1.25rem" }}>Recent Orders</h1>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr className="desktop-table-header">
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Order ID">#{order.id}</td>
                  <td data-label="Customer">{order.user_name}</td>
                  <td data-label="Amount">₹{Number(order.total_amount).toFixed(2)}</td>
                  <td data-label="Status">
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>
                  No orders yet
                </td>
              </tr>
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
