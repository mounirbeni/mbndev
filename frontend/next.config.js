/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

// ─── Content Security Policy ──────────────────────────────────────────────────
// In development, Next.js fast-refresh uses eval() — 'unsafe-eval' is required.
// In production, drop it entirely for a strict CSP.

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : null;

const connectSrc = [
  "'self'",
  'https://mbndev.ma',
  'wss://mbndev.ma',
  'https://api.mbndev.ma',
  'https://fonts.googleapis.com',
  API_ORIGIN,
  !isProd && 'http://localhost:5000',
  !isProd && 'ws://localhost:*',        // HMR websocket
].filter(Boolean).join(' ');

const scriptSrc = isProd
  ? "'self' 'unsafe-inline'"            // Next.js inline scripts are hashed/nonce'd at runtime
  : "'self' 'unsafe-inline' 'unsafe-eval'"; // dev: eval needed for fast-refresh

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

// ─── Next.js config ───────────────────────────────────────────────────────────
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.mbndev.ma' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  async rewrites() {
    return isProd
      ? [] // handled by vercel.json rewrites in prod
      : [
          {
            source:      '/api/:path*',
            destination: 'http://localhost:5000/api/:path*',
          },
        ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key:   'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
