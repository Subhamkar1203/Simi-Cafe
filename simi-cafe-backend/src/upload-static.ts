import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_DIR = path.join(__dirname, "../../simi-cafe/public/images");

async function uploadImages() {
  try {
    const files = fs.readdirSync(IMAGE_DIR);
    console.log(`Found ${files.length} files in ${IMAGE_DIR}`);

    for (const file of files) {
      if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")) {
        const filePath = path.join(IMAGE_DIR, file);
        const filenameWithoutExt = path.parse(file).name;
        
        console.log(`Uploading ${file}...`);
        
        await cloudinary.uploader.upload(filePath, {
          folder: "simi-cafe/static",
          public_id: filenameWithoutExt,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });
        
        console.log(`Success: ${file}`);
      }
    }
    console.log("All uploads complete!");
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

uploadImages();
