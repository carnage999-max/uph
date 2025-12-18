import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Support dynamic S3 bucket domains (any bucket.s3.region.amazonaws.com)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Image size optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    proxyClientMaxBodySize: 1024 * 1024 * 500,
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || '',
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || '',
  },
  // Increase payload size limits for file uploads
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
