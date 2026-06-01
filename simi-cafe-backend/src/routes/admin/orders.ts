import { Router } from "express";
import { query, execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

interface OrderRow extends RowDataPacket {
  id: number;
  user_name: string;
  total_amount: number;
  status: string;
  payment_mode: string;
  payment_confirmed: boolean;
  created_at: string;
}

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const orders = await query<OrderRow[]>(
      `SELECT o.id, u.name as user_name, o.total_amount, o.status, 
              o.payment_mode, o.payment_confirmed, o.created_at 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC 
       LIMIT 100`
    );
    res.json({ orders });
  } catch (error) {
    console.error("Orders error:", error);
    res.json({ orders: [] });
  }
});

router.patch("/", requireAdminAuth, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id and status required" });
    }

    const orderResult = await query<RowDataPacket[]>("SELECT user_id, payment_confirmed FROM orders WHERE id = ?", [id]);
    if (orderResult.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult[0];

    await execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    if (status === "paid" && !order.payment_confirmed) {
      await execute(
        "UPDATE orders SET payment_confirmed = TRUE, payment_confirmed_at = NOW() WHERE id = ?",
        [id]
      );

      const userId = order.user_id;
      if (userId) {
        await execute("UPDATE users SET successful_payments = successful_payments + 1, total_visits = total_visits + 1 WHERE id = ?", [userId]);

        const userResult = await query<RowDataPacket[]>("SELECT total_visits FROM users WHERE id = ?", [userId]);
        const totalVisits = userResult[0].total_visits;

        if (totalVisits > 0 && totalVisits % 3 === 0) {
          const charmTypes = ["Totoro Charm", "Calcifer Charm", "Kodama Charm", "Susuwatari Charm"];
          const charmIndex = Math.floor((totalVisits / 3) - 1) % charmTypes.length;
          const charmType = charmTypes[charmIndex];

          await execute(
            "INSERT INTO charms (user_id, charm_type, earned_after_payment_count) VALUES (?, ?, ?)",
            [userId, charmType, totalVisits]
          );
          await execute("UPDATE users SET charm_count = charm_count + 1 WHERE id = ?", [userId]);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
