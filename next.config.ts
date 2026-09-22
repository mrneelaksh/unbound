import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode for better error detection
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['framer-motion', 'recharts', 'lucide-react'],
  },
};

export default nextConfig;
