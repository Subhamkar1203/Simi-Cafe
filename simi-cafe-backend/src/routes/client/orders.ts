import { Router } from "express";
import { query, execute } from "../../db";
import { requireAuth } from "../../utils/auth";
import { validate } from "../../utils/validate";
import { z } from "zod";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const orders = await query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const orderIds = orders.map(o => o.id);
    let items: RowDataPacket[] = [];
    if (orderIds.length > 0) {
      items = await query<RowDataPacket[]>(
        `SELECT oi.*, m.name, m.image_url 
         FROM order_items oi
         JOIN menu_items m ON oi.menu_item_id = m.id
         WHERE oi.order_id IN (?)`,
        [orderIds]
      );
    }

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }));

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      menu_item_id: z.number().int().positive(),
      quantity: z.number().int().positive()
    })).min(1, "Cart cannot be empty"),
    order_type: z.enum(["delivery", "pickup", "dine_in", "dine-in"]),
    delivery_address: z.string().optional().nullable(),
    payment_mode: z.enum(["cash", "card", "upi"]).optional().default("cash"),
    scheduled_time: z.string().optional().default("asap")
  })
});

router.post("/", requireAuth, validate(createOrderSchema), async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { items, order_type, delivery_address, payment_mode, scheduled_time } = req.body;

    let totalAmount = 0;
    const itemIds = items.map((i: any) => i.menu_item_id);
    const menuItems = await query<RowDataPacket[]>(
      `SELECT id, price FROM menu_items WHERE id IN (?)`,
      [itemIds]
    );

    const priceMap = new Map(menuItems.map(m => [m.id, Number(m.price)]));
    
    for (const item of items) {
      const price = priceMap.get(item.menu_item_id) || 0;
      totalAmount += price * item.quantity;
    }

    const finalTotal = totalAmount + (totalAmount * 0.05);

    const orderResult = await execute(
      `INSERT INTO orders (user_id, total_amount, order_type, delivery_address, payment_mode, scheduled_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, finalTotal, order_type, delivery_address, payment_mode || 'cash', scheduled_time || 'asap']
    ) as ResultSetHeader;

    const orderId = orderResult.insertId;

    for (const item of items) {
      const price = priceMap.get(item.menu_item_id) || 0;
      await execute(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.menu_item_id, item.quantity, price]
      );
    }

    res.json({ success: true, orderId });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const patchOrderSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    action: z.enum(["cancel"])
  })
});

router.patch("/", requireAuth, validate(patchOrderSchema), async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { orderId, action } = req.body;

    if (action === "cancel") {
      const check = await query<RowDataPacket[]>(`SELECT status FROM orders WHERE id = ? AND user_id = ?`, [orderId, userId]);
      if (check.length === 0) return res.status(404).json({ error: "Order not found" });
      if (check[0].status !== "pending") return res.status(400).json({ error: "Order cannot be cancelled at this stage" });

      await execute(`UPDATE orders SET status = 'cancelled' WHERE id = ? AND user_id = ?`, [orderId, userId]);
      return res.json({ success: true });
    }

    res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
