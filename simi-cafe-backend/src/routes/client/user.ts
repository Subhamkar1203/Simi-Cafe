import { Router } from "express";
import { query, execute } from "../../db";
import { requireAuth } from "../../utils/auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

// Cart routes
router.get("/cart", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const rows = await query<RowDataPacket[]>(
      `SELECT cart_data FROM users WHERE id = ?`,
      [userId]
    );

    let cartData = [];
    if (rows.length > 0 && rows[0].cart_data) {
      cartData = typeof rows[0].cart_data === "string" 
        ? JSON.parse(rows[0].cart_data) 
        : rows[0].cart_data;
    }

    res.json({ cart: cartData });
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cart", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { cart } = req.body;

    await execute(
      `UPDATE users SET cart_data = ? WHERE id = ?`,
      [JSON.stringify(cart), userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Favorites routes
router.get("/favorites", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const favorites = await query<RowDataPacket[]>(
      `SELECT m.* 
       FROM user_favorites f
       JOIN menu_items m ON f.menu_item_id = m.id
       WHERE f.user_id = ?`,
      [userId]
    );

    res.json({ favorites });
  } catch (error) {
    console.error("Fetch favorites error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/favorites", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { menu_item_id } = req.body;

    await execute(
      `INSERT IGNORE INTO user_favorites (user_id, menu_item_id) VALUES (?, ?)`,
      [userId, menu_item_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/favorites", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const menu_item_id = req.query.menu_item_id as string;

    if (!menu_item_id) {
      return res.status(400).json({ error: "menu_item_id is required" });
    }

    await execute(
      `DELETE FROM user_favorites WHERE user_id = ? AND menu_item_id = ?`,
      [userId, menu_item_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
