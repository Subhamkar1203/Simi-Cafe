import { z } from "zod";
import mysql from "mysql2/promise";

const menuItemUpdateSchema = z.object({
  body: z.object({
    id: z.number().int().positive(),
    category_id: z.number().int().positive().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    price: z.number().positive().optional(),
    image_url: z.string().optional().nullable(),
    diet_type_id: z.number().int().positive().optional(),
    is_available: z.boolean().optional(),
    is_seasonal: z.boolean().optional(),
    tags: z.array(z.number().int().positive()).optional()
  })
});

import dotenv from "dotenv";
dotenv.config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "simi_cafe"
  });

  const [rows] = await db.query(`SELECT m.*, GROUP_CONCAT(t.id) as tags FROM menu_items m LEFT JOIN menu_item_tags mit ON m.id = mit.item_id LEFT JOIN menu_tags t ON mit.tag_id = t.id GROUP BY m.id`);
  
  for (const item of rows as any[]) {
    // simulate frontend form initialization
    const form = {
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      image_url: item.image_url || "",
      category_id: String(item.category_id),
      diet_type_id: String(item.diet_type_id || ""),
      is_available: Boolean(item.is_available),
      is_seasonal: Boolean(item.is_seasonal),
      tags: item.tags ? String(item.tags).split(",") : [],
    };

    // simulate frontend submit
    const body = {
      id: item.id,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      category_id: parseInt(form.category_id),
      diet_type_id: parseInt(form.diet_type_id),
      is_available: form.is_available,
      is_seasonal: form.is_seasonal,
      tags: form.tags.map((t: any) => parseInt(t)),
    };

    // test zod validation
    const result = menuItemUpdateSchema.safeParse({ body });
    if (!result.success) {
      console.log("Failed item ID:", item.id);
      console.log("Payload:", body);
      console.log("Errors:", JSON.stringify(result.error.issues, null, 2));
    }
  }
  
  db.end();
}

run().catch(console.error);
