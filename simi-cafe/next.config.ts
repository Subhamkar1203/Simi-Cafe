import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'process.env.NEXT_PUBLIC_API_URL/api/admin/:path*', // Proxy to backend
      },
      {
        source: '/api/:path*',
        destination: 'process.env.NEXT_PUBLIC_API_URL/api/client/:path*', // Proxy to backend
      }
    ];
  },
};

export default nextConfig;
