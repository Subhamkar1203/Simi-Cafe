import { Router } from "express";
import { query, execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

interface ReservationRow extends RowDataPacket {
  id: number;
  name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: string;
  created_at: string;
}

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const reservations = await query<ReservationRow[]>(
      `SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC`
    );
    res.json({ reservations });
  } catch (error) {
    console.error("Reservations error:", error);
    res.json({ reservations: [] });
  }
});

router.patch("/", requireAdminAuth, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id and status required" });
    }

    const reservationResult = await query<RowDataPacket[]>("SELECT user_id, status FROM reservations WHERE id = ?", [id]);
    if (reservationResult.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    const reservation = reservationResult[0];

    await execute("UPDATE reservations SET status = ? WHERE id = ?", [status, id]);

    if (status === "completed" && reservation.status !== "completed") {
       const userId = reservation.user_id;
       if (userId) {
         await execute("INSERT INTO visits (user_id, confirmed_by_staff) VALUES (?, TRUE)", [userId]);
       }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update reservation error:", error);
    res.status(500).json({ error: "Failed to update reservation" });
  }
});

export default router;
