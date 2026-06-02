import { NextResponse } from "next/server";
import { uploadImageStream } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 413 }
      );
    }

    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const result = await uploadImageStream(
      buffer,
      "simi-cafe/menu-items",
      `image-${uniqueSuffix}`
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload image",
      },
      {
        status: 500,
      }
    );
  }
}