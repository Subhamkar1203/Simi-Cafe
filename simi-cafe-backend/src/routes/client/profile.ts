import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../utils/auth";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { extractPublicId, deleteImage } from "../../config/cloudinary";
import { query, execute } from "../../db";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

// Configure multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "simi-cafe/profiles",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
  } as any,
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  }
});

router.patch("/image", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = (req as any).user.userId;

    // Fetch old profile image
    const users = await query<RowDataPacket[]>(
      "SELECT profile_image FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const newImageUrl = file.path;

    if (users.length > 0) {
      const oldImageUrl = users[0].profile_image;

      // Update DB
      await execute("UPDATE users SET profile_image = ? WHERE id = ?", [newImageUrl, userId]);

      // Delete old image from Cloudinary if it's a custom image
      if (oldImageUrl && !oldImageUrl.endsWith("Defaultpp.png")) {
        const publicId = extractPublicId(oldImageUrl);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch (delErr) {
            console.error("Failed to delete old profile image from Cloudinary:", delErr);
          }
        }
      }
    }

    res.json({ 
      success: true, 
      url: newImageUrl 
    });

  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({ error: "Failed to upload image to Cloudinary" });
  }
});

export default router;
