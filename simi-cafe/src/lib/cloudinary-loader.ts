export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If src is already a full URL (e.g., uploaded profile image or food image from DB), return it directly.
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Use the cloud name from environment, fallback to current known one
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dlupquidc";
  
  // Cloudinary transformations for performance and responsive width
  const params = [
    'f_auto',
    quality ? `q_${quality}` : 'q_auto',
    'dpr_auto',
    'c_fill',
    `w_${width}`
  ];

  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${src}`;
}
