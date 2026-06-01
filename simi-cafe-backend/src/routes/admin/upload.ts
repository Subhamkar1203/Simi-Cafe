import { Router } from "express";
import multer from "multer";
import { requireAdminAuth } from "../../utils/admin-auth";
import { promises as fs } from "fs";
import path from "path";

const router = Router();

// Configure multer
const storage = multer.memoryStorage();
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

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    
    let extension = file.mimetype.split("/")[1] || "jpg";
    if (extension === "jpeg") extension = "jpg";
    
    const filename = `image-${uniqueSuffix}.${extension}`;

    // Define paths for uploads
    const adminUploadsDir = path.join(process.cwd(), "..", "simi-cafe-admin", "public", "uploads");
    const mainUploadsDir = path.join(process.cwd(), "..", "simi-cafe", "public", "uploads");
    const backendUploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directories exist
    await fs.mkdir(adminUploadsDir, { recursive: true }).catch(() => {});
    await fs.mkdir(mainUploadsDir, { recursive: true }).catch(() => {});
    await fs.mkdir(backendUploadsDir, { recursive: true }).catch(() => {});

    // Write file
    await fs.writeFile(path.join(backendUploadsDir, filename), file.buffer);
    
    try { await fs.writeFile(path.join(adminUploadsDir, filename), file.buffer); } catch (e) {}
    try { await fs.writeFile(path.join(mainUploadsDir, filename), file.buffer); } catch (e) {}

    res.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
