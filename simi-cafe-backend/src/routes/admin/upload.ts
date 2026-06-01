import { Router } from "express";
import multer from "multer";
import { requireAdminAuth } from "../../utils/admin-auth";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary";

const router = Router();

// Configure multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "simi-cafe/foods",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
  } as any,
});
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit (fixes mobile camera uploads)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  }
});

router.post("/", requireAdminAuth, (req, res, next) => {
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

    res.json({ 
      success: true, 
      url: file.path 
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image to Cloudinary" });
  }
});

export default router;
