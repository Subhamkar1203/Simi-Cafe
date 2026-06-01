import { Router } from "express";
import { query, execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const dietTypes = await query<RowDataPacket[]>("SELECT * FROM menu_diet_types ORDER BY name ASC");
    res.json({ dietTypes });
  } catch (error) {
    console.error("Fetch diet types error:", error);
    res.status(500).json({ error: "Failed to fetch diet types" });
  }
});

router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Diet type name is required" });
    }

    const result = await execute(
      "INSERT INTO menu_diet_types (name) VALUES (?)",
      [name.trim()]
    ) as any;

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Create diet type error:", error);
    res.status(500).json({ error: "Failed to create diet type" });
  }
});

export default router;
