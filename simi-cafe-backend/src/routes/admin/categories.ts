import { Router } from "express";
import { execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";

const router = Router();

router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const result = await execute(
      "INSERT INTO menu_categories (name) VALUES (?)",
      [name.trim()]
    ) as any;

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

export default router;
