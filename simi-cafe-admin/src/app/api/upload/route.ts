import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Check type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Check size limit (20MB)
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 20MB." }, { status: 413 });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let extension = file.type.split("/")[1] || "jpg";
    if (extension === "jpeg") extension = "jpg";
    
    const filename = `image-${uniqueSuffix}.${extension}`;

    // Define paths for uploads
    const adminUploadsDir = path.join(process.cwd(), "public", "uploads");
    const mainUploadsDir = path.join(process.cwd(), "..", "simi-cafe", "public", "uploads");
    const backendUploadsDir = path.join(process.cwd(), "..", "simi-cafe-backend", "public", "uploads");

    // Ensure directories exist
    await fs.mkdir(adminUploadsDir, { recursive: true }).catch(() => {});
    await fs.mkdir(mainUploadsDir, { recursive: true }).catch(() => {});
    await fs.mkdir(backendUploadsDir, { recursive: true }).catch(() => {});

    // Write file
    await fs.writeFile(path.join(adminUploadsDir, filename), buffer);
    try { await fs.writeFile(path.join(mainUploadsDir, filename), buffer); } catch {}
    try { await fs.writeFile(path.join(backendUploadsDir, filename), buffer); } catch {}

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
