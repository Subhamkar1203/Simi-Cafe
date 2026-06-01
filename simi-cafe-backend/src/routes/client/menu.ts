import { Router } from "express";
import { query } from "../../db";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const items = await query<RowDataPacket[]>(
      `SELECT m.*, c.name as category_name, d.name as diet_type_name,
       GROUP_CONCAT(t.name) as tag_names
       FROM menu_items m
       JOIN menu_categories c ON m.category_id = c.id
       LEFT JOIN menu_diet_types d ON m.diet_type_id = d.id
       LEFT JOIN menu_item_tags mit ON m.id = mit.item_id
       LEFT JOIN menu_tags t ON mit.tag_id = t.id
       GROUP BY m.id
       ORDER BY c.id, m.name`
    );
    const dietTypes = await query<RowDataPacket[]>("SELECT name FROM menu_diet_types ORDER BY name ASC");
    res.json({ items, dietTypes: dietTypes.map(d => d.name) });
  } catch (error) {
    console.error("Fetch menu error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
