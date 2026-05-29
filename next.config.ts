import type { NextConfig } from "next";

function toRemotePattern(rawUrl?: string | null){
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

const storageRemotePatterns = [
  process.env.S3_PUBLIC_URL_BASE,
  process.env.UPH_S3_PUBLIC_URL_BASE,
  process.env.S3_ENDPOINT,
  process.env.UPH_S3_ENDPOINT,
]
  .map((value)=> toRemotePattern(value))
  .filter((value): value is NonNullable<ReturnType<typeof toRemotePattern>> => Boolean(value));

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
      },
      ...storageRemotePatterns,
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
  // Increase payload size limits for file uploads
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
