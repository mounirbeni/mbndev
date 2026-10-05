import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import InstallPrompt from '@/components/mobile/InstallPrompt';
import PushPrompt from '@/components/mobile/PushPrompt';
import Intro, { INTRO_HEAD_SCRIPT } from '@/components/ui/Intro';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
import './globals.css';

// Self-hosted at build time by next/font. (A CSS @import of Google Fonts is
// dropped by the bundler, so the fonts never loaded that way.)
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--font-serif' });

export const metadata: Metadata = {
  title: {
    default: 'MBN DEV — Custom Websites Built to Elevate Your Business',
    template: '%s | MBN DEV',
  },
  description:
    'MBN DEV builds custom websites, SaaS platforms, e-commerce stores, and web applications — fast, modern, and tailored to your business. Based in Morocco, serving clients worldwide.',
  keywords: [
    'web development', 'custom websites', 'web apps', 'MBN DEV',
    'Mounir Banni', 'e-commerce development', 'Next.js development',
    'SaaS development', 'web design Morocco', 'Morocco web developer',
    'landing page', 'portfolio website', 'business website',
  ],
  authors: [{ name: 'Mounir Banni', url: 'https://mbndev.ma' }],
  creator: 'Mounir Banni',
  publisher: 'MBN DEV',
  metadataBase: new URL('https://mbndev.ma'),
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/brand-icon-transparent.webp', sizes: '128x128', type: 'image/webp' }],
    apple: [{ url: '/brand-icon-transparent.webp', sizes: '128x128', type: 'image/webp' }],
    shortcut: '/brand-icon-transparent.webp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MBN DEV',
  },
  openGraph: {
    title: 'MBN DEV — Custom Websites & Web Apps',
    description: 'Custom websites, SaaS platforms, and web apps built by Mounir Banni. Fast, modern, and tailored to your business.',
    type: 'website',
    url: 'https://mbndev.ma',
    siteName: 'MBN DEV',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'MBN DEV — Custom Websites Built to Elevate Your Business',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MBN DEV — Custom Websites & Web Apps',
    description: 'Custom websites, SaaS platforms, and web apps built fast and professionally.',
    creator: '@mbndev',
    images: ['/opengraph-image'],
  },
  verification: {
    google: '6iPR0xchv0BJth7bark-LIj4vvX1djZU9hS_oWjZPYA',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#7c3aed',
    'msapplication-tap-highlight': 'no',
    'contact:phone_number': '+212705914424',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`dark ${inter.variable} ${mono.variable} ${serif.variable}`}>
      <head>
        {/* Decides before first paint whether the opening sequence plays (once per session). */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
        {/* Browser and home-screen icons share the transparent official brand mark. */}
        <link rel="icon" type="image/webp" href="/brand-icon-transparent.webp" />
        <link rel="apple-touch-icon" sizes="128x128" href="/brand-icon-transparent.webp" />

        <link rel="dns-prefetch" href="https://mbndev.ma" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MBN DEV" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#08080b" />
      </head>
      <body suppressHydrationWarning>
        <Intro />
        <LanguageProvider>
          <AuthProvider>
            <ScrollProgressBar />
            {children}
            <Toaster
              position="top-center"
              gutter={8}
              containerStyle={{ top: 'max(env(safe-area-inset-top, 0px) + 16px, 16px)' }}
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'rgba(18, 18, 22, 0.96)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(124,58,237,0.25)',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  maxWidth: '340px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                },
                success: { iconTheme: { primary: '#7c3aed', secondary: '#e2e8f0' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' } },
              }}
            />
            <PushPrompt />
          </AuthProvider>
        </LanguageProvider>
        <InstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
