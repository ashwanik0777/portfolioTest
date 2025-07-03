/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Allow importing from the client and server directories
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },

  // Configure image domains for external images
  images: {
    domains: ['localhost'],
  },

  // Handle API routes that should be forwarded to the Express backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? '/api/:path*'  // In production, use Next.js API routes
          : 'http://localhost:5000/api/:path*', // In development, proxy to Express
      },
    ]
  },
}

module.exports = nextConfig