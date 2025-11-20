
import type { NextConfig } from 'next';
import path from 'path'; // Import the path module

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // ADD THIS WEBPACK CONFIGURATION
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'), // Explicitly map @ to your src directory
    };
    return config;
  },
  // Increase server action timeout for video generation
  serverActions: {
    bodySizeLimit: '4.5mb',
    // Timeout in seconds
    timeout: 120,
  },
};

export default nextConfig;
