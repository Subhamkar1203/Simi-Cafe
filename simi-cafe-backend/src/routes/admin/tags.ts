import { Router } from "express";
import { query, execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const tags = await query<RowDataPacket[]>("SELECT * FROM menu_tags ORDER BY name ASC");
    res.json({ tags });
  } catch (error) {
    console.error("Fetch tags error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const result = await execute(
      "INSERT INTO menu_tags (name) VALUES (?)",
      [name.trim()]
    ) as any;

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

export default router;
