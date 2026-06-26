/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,

  // Proxy all /api/* requests to the Render backend
  // This eliminates CORS completely — browser talks to same origin (Vercel),
  // Vercel server-side forwards to Render backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://task-management-2-vaxa.onrender.com'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
