import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/blockchain/:path*',
        destination: 'http://localhost:3099/:path*'
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3099',
        pathname: '/local-storage/**'
      }
    ]
  },
  // Explicitly add environment variables to be accessible in the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_MINIO_URL: process.env.NEXT_PUBLIC_MINIO_URL,
    NEXT_PUBLIC_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
    NEXT_PUBLIC_SOLANA_PROGRAM_ID: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID,
    NEXT_PUBLIC_SOLANA_ADMIN_WALLET: process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET,
    NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS: process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS,
    NEXT_PUBLIC_SOLANA_PROTOCOL_PDA: process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA
  }
};

export default nextConfig;
