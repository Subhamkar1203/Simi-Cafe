import { Router } from "express";
import { query } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

interface CountRow extends RowDataPacket {
  count: number;
}

interface RevenueRow extends RowDataPacket {
  revenue: number;
}

interface OrderRow extends RowDataPacket {
  id: number;
  user_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const [orderCount] = await query<CountRow[]>(
      "SELECT COUNT(*) as count FROM orders"
    );

    const [revenueResult] = await query<RevenueRow[]>(
      "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'"
    );

    const [reservationCount] = await query<CountRow[]>(
      "SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'"
    );

    const [userCount] = await query<CountRow[]>(
      "SELECT COUNT(*) as count FROM users"
    );

    const recentOrders = await query<OrderRow[]>(
      `SELECT o.id, u.name as user_name, o.total_amount, o.status, o.created_at 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC 
       LIMIT 10`
    );

    res.json({
      totalOrders: orderCount?.count || 0,
      todayRevenue: revenueResult?.revenue || 0,
      pendingReservations: reservationCount?.count || 0,
      totalUsers: userCount?.count || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.json({
      totalOrders: 0,
      todayRevenue: 0,
      pendingReservations: 0,
      totalUsers: 0,
      recentOrders: [],
    });
  }
});

export default router;
