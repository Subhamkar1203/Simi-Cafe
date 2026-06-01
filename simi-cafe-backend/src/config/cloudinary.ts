import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file stream to Cloudinary
 * @param fileBuffer The buffer of the file to upload
 * @param folder The folder path in Cloudinary
 * @param filename Optional filename (without extension)
 */
export const uploadImageStream = (fileBuffer: Buffer, folder: string, filename?: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: "image",
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (result) return resolve(result);
        reject(new Error("Unknown error during upload"));
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public_id
 * @param publicId The public ID of the image in Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Extracts public ID from a Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/simi-cafe/foods/image1.jpg 
 * Returns: simi-cafe/foods/image1
 */
export const extractPublicId = (url: string): string | null => {
  try {
    if (!url.includes("res.cloudinary.com")) return null;
    
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    // The path after 'upload/' and 'v<version>/'
    // E.g., [..., 'upload', 'v123456', 'folder', 'image.jpg']
    let pathParts = parts.slice(uploadIndex + 1);
    
    // Remove version string if present (starts with 'v' followed by numbers)
    if (pathParts[0].match(/^v\d+$/)) {
      pathParts = pathParts.slice(1);
    }
    
    const publicIdWithExt = pathParts.join("/");
    // Remove file extension
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf(".")) || publicIdWithExt;
    
    return publicId;
  } catch (e) {
    return null;
  }
};

export default cloudinary;
