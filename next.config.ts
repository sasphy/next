import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/blockchain/:path*',
        destination: 'http://localhost:3002/:path*'
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/local-storage/**'
      }
    ]
  }
};

export default nextConfig;
