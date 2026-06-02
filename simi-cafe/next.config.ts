import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return [
      {
        source: "/api/admin/:path*",
        destination: `${apiUrl}/api/admin/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/client/:path*`,
      },
    ];
  },
};

export default nextConfig;