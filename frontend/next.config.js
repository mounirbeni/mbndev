/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com'],
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/api/:path*',
        // In production (Vercel): route to the backend service via its routePrefix
        // In development: proxy to local Express server
        destination: isProd
          ? '/_/backend/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
