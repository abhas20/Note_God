import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Prevent TypeScript errors from blocking the build:
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
}

export default nextConfig
