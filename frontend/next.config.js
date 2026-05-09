/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com'],
  },
  async rewrites() {
    return process.env.NODE_ENV === 'production'
      ? [] // handled by vercel.json rewrites in prod
      : [
          {
            source: '/api/:path*',
            destination: 'http://localhost:5000/api/:path*',
          },
        ];
  },
};

module.exports = nextConfig;
