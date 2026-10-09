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
  // Project files upload straight from the browser to Vercel Blob.
  'https://vercel.com',
  'https://*.blob.vercel-storage.com',
  API_ORIGIN,
  // Google Analytics 4 (loaded only after consent)
  'https://www.googletagmanager.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  !isProd && 'http://localhost:5000',
  !isProd && 'ws://localhost:*',        // HMR websocket
].filter(Boolean).join(' ');

const scriptSrc = isProd
  ? "'self' 'unsafe-inline' https://www.googletagmanager.com"            // Next.js inline scripts are hashed/nonce'd at runtime; GA4 after consent
  : "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"; // dev: eval needed for fast-refresh

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

// The MBN Support AI chat widget (/widget/*) runs in an iframe on customers'
// websites, so it is the one place that may be framed. Everything else keeps
// frame-ancestors 'none' + X-Frame-Options DENY.
const widgetCsp = csp.replace("frame-ancestors 'none'", 'frame-ancestors *');

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
    // Sales demo sites: static files in public/demos/*, served on clean URLs.
    const demos = [
      { source: '/demo/coffee',       destination: '/demos/coffee/index.html' },
      { source: '/demo/coffee/admin', destination: '/demos/coffee/admin.html' },
      { source: '/demo/barber',       destination: '/demos/barber/index.html' },
      { source: '/demo/barber/admin', destination: '/demos/barber/admin.html' },
      { source: '/demo/beauty',       destination: '/demos/beauty/index.html' },
      { source: '/demo/beauty/admin', destination: '/demos/beauty/admin.html' },
      { source: '/demo/law',          destination: '/demos/law/index.html' },
      { source: '/demo/law/admin',    destination: '/demos/law/admin.html' },
      { source: '/demo/law/secretary', destination: '/demos/law/secretary.html' },
    ];
    return isProd
      ? demos // /api is handled by vercel.json rewrites in prod
      : [
          {
            source:      '/api/:path*',
            destination: 'http://localhost:5000/api/:path*',
          },
          ...demos,
        ];
  },
  async headers() {
    return [
      {
        source: '/((?!widget/).*)',
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
      {
        source: '/widget/:path*',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: widgetCsp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
