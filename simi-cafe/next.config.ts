import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:9092/api/admin/:path*', // Proxy to backend
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:9092/api/client/:path*', // Proxy to backend
      }
    ];
  },
};

export default nextConfig;
