"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  referred_by: number | null;
  total_visits: number;
  successful_payments: number;
  charm_count: number;
  charms_redeemed: number;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [redeemAmounts, setRedeemAmounts] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRedeem = async (userId: number) => {
    setRedeemingId(userId);
    const amount = redeemAmounts[userId] || 1;
    
    try {
      const res = await fetch("/api/users/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, amount }),
      });
      if (res.ok) {
        fetchUsers();
        setRedeemAmounts((prev) => ({ ...prev, [userId]: 1 }));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to redeem");
      }
    } catch {
      alert("Error redeeming charm");
    }
    setRedeemingId(null);
  };

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Users</h1>
        <p>Registered customers</p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr className="desktop-table-header">
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Referral</th>
              <th>Stats</th>
              <th>Charms (Owned / Redeemed)</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No users yet</td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">#{user.id}</td>
                  <td data-label="Name" style={{ fontWeight: 500 }}>{user.name}</td>
                  <td data-label="Contact">
                    <div style={{ fontSize: "0.8rem" }}>{user.email}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>{user.phone}</div>
                  </td>
                  <td data-label="Referral">
                    <div style={{ fontSize: "0.8rem" }}>Code: <strong>{user.referral_code || "N/A"}</strong></div>
                    {user.referred_by && <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Referred by #{user.referred_by}</div>}
                  </td>
                  <td data-label="Stats">
                    <div style={{ fontSize: "0.8rem" }}>Visits: {user.total_visits}</div>
                    <div style={{ fontSize: "0.8rem" }}>Payments: {user.successful_payments}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>Charm Progress: {user.total_visits % 3}/3</div>
                  </td>
                  <td data-label="Charms">
                    <span style={{
                      background: user.charm_count > 0 ? "#fef3c7" : "#f3f4f6",
                      color: user.charm_count > 0 ? "#92400e" : "#6b7280",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}>
                      {user.charm_count} ✨
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginLeft: "0.5rem" }}>
                      ({user.charms_redeemed} redeemed)
                    </span>
                  </td>
                  <td data-label="Joined">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td data-label="Action">
                    {user.charm_count > user.charms_redeemed ? (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {(user.charm_count - user.charms_redeemed) > 1 && (
                          <select
                            style={{ padding: "0.2rem", fontSize: "0.75rem", borderRadius: "0.25rem", border: "1px solid var(--admin-border)" }}
                            value={redeemAmounts[user.id] || 1}
                            onChange={(e) => setRedeemAmounts({ ...redeemAmounts, [user.id]: parseInt(e.target.value) })}
                            disabled={redeemingId === user.id}
                          >
                            {Array.from({ length: user.charm_count - user.charms_redeemed }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        )}
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          disabled={redeemingId === user.id}
                          onClick={() => handleRedeem(user.id)}
                        >
                          {redeemingId === user.id ? "..." : "Redeem"}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>None Available</span>
                    )}
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
