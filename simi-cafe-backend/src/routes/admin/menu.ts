import { Router } from "express";
import { query, execute } from "../../db";
import { requireAdminAuth } from "../../utils/admin-auth";
import { validate } from "../../utils/validate";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { extractPublicId, deleteImage } from "../../config/cloudinary";

const router = Router();

interface MenuItemRow extends RowDataPacket {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  diet_type_id: number | null;
  diet_type_name: string | null;
  is_available: boolean;
  is_seasonal: boolean;
  tags: string; 
  tag_names: string;
}

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
}

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const items = await query<MenuItemRow[]>(
      `SELECT m.*, c.name as category_name, d.name as diet_type_name,
       GROUP_CONCAT(t.id) as tags, GROUP_CONCAT(t.name) as tag_names
       FROM menu_items m 
       LEFT JOIN menu_categories c ON m.category_id = c.id
       LEFT JOIN menu_diet_types d ON m.diet_type_id = d.id
       LEFT JOIN menu_item_tags mit ON m.id = mit.item_id
       LEFT JOIN menu_tags t ON mit.tag_id = t.id
       GROUP BY m.id
       ORDER BY c.id, m.name`
    );

    const categories = await query<CategoryRow[]>("SELECT * FROM menu_categories");

    res.json({ items, categories });
  } catch (error) {
    console.error("Menu error:", error);
    res.json({ items: [], categories: [] });
  }
});

const menuItemSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    price: z.number().positive(),
    image_url: z.string().optional().nullable(),
    diet_type_id: z.number().int().positive().optional().nullable(),
    is_available: z.boolean().optional().default(true),
    is_seasonal: z.boolean().optional().default(false),
    tags: z.array(z.number().int().positive()).optional().default([])
  })
});

router.post("/", requireAdminAuth, validate(menuItemSchema), async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, diet_type_id, is_available, is_seasonal, tags = [] } = req.body;

    const result = await execute(
      `INSERT INTO menu_items (category_id, name, description, price, image_url, diet_type_id, is_available, is_seasonal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, description || null, price, image_url || null, diet_type_id, is_available ? 1 : 0, is_seasonal ? 1 : 0]
    ) as any;

    if (tags && tags.length > 0) {
      const itemId = result.insertId;
      for (const tagId of tags) {
        await execute("INSERT INTO menu_item_tags (item_id, tag_id) VALUES (?, ?)", [itemId, tagId]);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Create menu item error:", error);
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

const menuItemUpdateSchema = z.object({
  body: z.object({
    id: z.number().int().positive(),
    category_id: z.number().int().positive().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    price: z.number().positive().optional(),
    image_url: z.string().optional().nullable(),
    diet_type_id: z.number().int().positive().optional().nullable(),
    is_available: z.boolean().optional(),
    is_seasonal: z.boolean().optional(),
    tags: z.array(z.number().int().positive()).optional()
  })
});

router.put("/", requireAdminAuth, validate(menuItemUpdateSchema), async (req, res) => {
  try {
    const { id, category_id, name, description, price, image_url, diet_type_id, is_available, is_seasonal, tags } = req.body;

    const updates = [];
    const values = [];

    if (image_url !== undefined) {
      // Fetch existing item to get old image URL
      const existingItems = await query<MenuItemRow[]>("SELECT image_url FROM menu_items WHERE id = ?", [id]);
      if (existingItems.length > 0 && existingItems[0].image_url && existingItems[0].image_url !== image_url) {
        // Different image URL provided (or cleared), try to delete old one from Cloudinary
        const publicId = extractPublicId(existingItems[0].image_url);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch (delErr) {
            console.error("Failed to delete old image from Cloudinary:", delErr);
          }
        }
      }
      updates.push("image_url = ?"); 
      values.push(image_url || null);
    }

    if (category_id !== undefined) { updates.push("category_id = ?"); values.push(category_id); }
    if (name !== undefined) { updates.push("name = ?"); values.push(name); }
    if (description !== undefined) { updates.push("description = ?"); values.push(description); }
    if (price !== undefined) { updates.push("price = ?"); values.push(price); }
    if (diet_type_id !== undefined) { updates.push("diet_type_id = ?"); values.push(diet_type_id); }
    if (is_available !== undefined) { updates.push("is_available = ?"); values.push(is_available ? 1 : 0); }
    if (is_seasonal !== undefined) { updates.push("is_seasonal = ?"); values.push(is_seasonal ? 1 : 0); }

    if (updates.length > 0) {
      values.push(id);
      await execute(`UPDATE menu_items SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    if (tags !== undefined) {
      await execute("DELETE FROM menu_item_tags WHERE item_id = ?", [id]);
      for (const tagId of tags) {
        await execute("INSERT INTO menu_item_tags (item_id, tag_id) VALUES (?, ?)", [id, tagId]);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

const deleteMenuSchema = z.object({
  body: z.object({
    id: z.number().int().positive()
  })
});

router.delete("/", requireAdminAuth, validate(deleteMenuSchema), async (req, res) => {
  try {
    const { id } = req.body;

    // Fetch existing item to get old image URL before deleting
    const existingItems = await query<MenuItemRow[]>("SELECT image_url FROM menu_items WHERE id = ?", [id]);
    
    await execute("DELETE FROM menu_items WHERE id = ?", [id]);

    // Delete image from Cloudinary if it exists
    if (existingItems.length > 0 && existingItems[0].image_url) {
      const publicId = extractPublicId(existingItems[0].image_url);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (delErr) {
          console.error("Failed to delete image from Cloudinary:", delErr);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

export default router;
