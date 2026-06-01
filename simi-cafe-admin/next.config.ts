import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9092/api/admin/:path*', // Proxy to backend
      },
    ];
  },
};

export default nextConfig;
