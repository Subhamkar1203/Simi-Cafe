import { Router } from "express";
import { query, execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

interface UserRow extends RowDataPacket {
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

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const users = await query<UserRow[]>(
      `SELECT 
         u.id, u.name, u.email, u.phone, u.referral_code, u.referred_by, u.created_at,
         u.total_visits,
         u.successful_payments,
         u.charm_count,
         u.charms_redeemed
       FROM users u
       ORDER BY u.created_at DESC`
    );
    res.json({ users });
  } catch (error) {
    console.error("Users error:", error);
    res.json({ users: [] });
  }
});

router.post("/redeem", requireAdminAuth, async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    if (!user_id || !amount || amount <= 0) {
      return res.status(400).json({ error: "user_id and valid amount required" });
    }

    const userResult = await query<RowDataPacket[]>("SELECT charm_count, charms_redeemed FROM users WHERE id = ?", [user_id]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult[0];
    if (user.charm_count - user.charms_redeemed < amount) {
      return res.status(400).json({ error: "Not enough charms to redeem" });
    }

    await execute("UPDATE users SET charms_redeemed = charms_redeemed + ? WHERE id = ?", [amount, user_id]);
    await execute(`UPDATE charms SET redeemed = TRUE, redeemed_at = NOW() WHERE user_id = ? AND redeemed = FALSE LIMIT ${Number(amount)}`, [user_id]);

    res.json({ success: true });
  } catch (error) {
    console.error("Redeem error:", error);
    res.status(500).json({ error: "Failed to redeem charms" });
  }
});

export default router;
