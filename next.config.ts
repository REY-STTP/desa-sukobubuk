import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Localhost
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

export default nextConfig