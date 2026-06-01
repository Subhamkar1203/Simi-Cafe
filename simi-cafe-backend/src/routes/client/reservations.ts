import { Router } from "express";
import { query, execute } from "../../db";
import { requireAuth } from "../../utils/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import jwt from "jose"; // or similar, but the user ID comes from requireAuth anyway.

const router = Router();

// In original Next.js route, POST didn't strictly require session but used it if available.
// We'll use a custom middleware or just read the cookie directly to mimic it.
router.post("/", async (req, res) => {
  try {
    const { name, phone, date, time, guests, special_requests } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: "Name is required." });
    if (!phone?.trim() || phone.trim().length < 10) return res.status(400).json({ error: "A valid phone number is required." });
    if (!date) return res.status(400).json({ error: "Reservation date is required." });
    if (!time) return res.status(400).json({ error: "Reservation time is required." });
    if (!guests || guests < 1) return res.status(400).json({ error: "At least 1 guest is required." });

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 10);
    
    if (parsedDate < today || parsedDate > maxDate) {
      return res.status(400).json({ error: "Reservations are available only for today through the next 10 days." });
    }

    // Try to get userId from token if it exists
    let userId = null;
    const token = req.cookies["simi-session"];
    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        try {
          const { jwtVerify } = await import("jose");
          const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
          userId = payload.userId as number;
        } catch (e) {
          // ignore
        }
      }
    }

    const result = await execute(
      `INSERT INTO reservations (user_id, name, phone, reservation_date, reservation_time, guests, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), phone.trim(), date, time, Number(guests), special_requests || null]
    ) as ResultSetHeader;

    res.json({
      reservation: {
        id: result.insertId,
        name: name.trim(),
        phone: phone.trim(),
        date,
        time,
        guests: Number(guests),
        special_requests: special_requests || null,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/user", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const reservations = await query<RowDataPacket[]>(
      `SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ reservations });
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    
    const checkRes = await query<RowDataPacket[]>(
      `SELECT * FROM reservations WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!checkRes || checkRes.length === 0) {
      return res.status(404).json({ error: "Reservation not found or unauthorized." });
    }

    const reservation = checkRes[0];
    if (reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'rejected') {
      return res.status(400).json({ error: "Reservation cannot be cancelled." });
    }

    await execute(
      `UPDATE reservations SET status = 'cancelled' WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({ success: true, message: "Reservation cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
