"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";

interface Reservation {
  id: number;
  name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: string;
  created_at: string;
}

const statuses = ["pending", "confirmed", "completed", "cancelled"];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchReservations = () => {
    fetch("/api/reservations")
      .then((res) => res.json())
      .then((data) => {
        setReservations(data.reservations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchReservations();
  };

  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);
  const paginatedReservations = reservations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Reservations</h1>
        <p>Manage table reservations</p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr className="desktop-table-header">
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>Loading...</td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No reservations</td>
              </tr>
            ) : (
              paginatedReservations.map((r) => (
                <tr key={r.id}>
                  <td data-label="ID">#{r.id}</td>
                  <td data-label="Name" style={{ fontWeight: 500 }}>{r.name}</td>
                  <td data-label="Phone">{r.phone}</td>
                  <td data-label="Date">{new Date(r.reservation_date).toLocaleDateString()}</td>
                  <td data-label="Time">{r.reservation_time}</td>
                  <td data-label="Guests">{r.guests}</td>
                  <td data-label="Status">
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </td>
                  <td data-label="Action">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
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
                        <option key={s} value={s}>{s}</option>
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
