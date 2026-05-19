import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import InstallPrompt from '@/components/mobile/InstallPrompt';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default:  'MBN DEV — Custom Websites Built to Elevate Your Business',
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
  authors:      [{ name: 'Mounir Banni', url: 'https://mbndev.com' }],
  creator:      'Mounir Banni',
  publisher:    'MBN DEV',
  metadataBase: new URL('https://mbndev.com'),
  manifest:     '/manifest.json',
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'MBN DEV',
  },
  openGraph: {
    title:       'MBN DEV — Custom Websites & Web Apps',
    description: 'Custom websites, SaaS platforms, and web apps built by Mounir Banni. Fast, modern, and tailored to your business.',
    type:        'website',
    url:         'https://mbndev.com',
    siteName:    'MBN DEV',
    locale:      'en_US',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'MBN DEV — Custom Websites Built to Elevate Your Business',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'MBN DEV — Custom Websites & Web Apps',
    description: 'Custom websites, SaaS platforms, and web apps built fast and professionally.',
    creator:     '@mbndev',
    images:      ['/og-image.png'],
  },
  other: {
    'mobile-web-app-capable':    'yes',
    'msapplication-TileColor':   '#7c3aed',
    'msapplication-tap-highlight': 'no',
    'contact:phone_number':       '+212705914424',
  },
};

export const viewport: Viewport = {
  themeColor:   '#7c3aed',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit:  'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="32x32"  href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="192x192" href="/images/logo.jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.mbndev.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              gutter={8}
              containerStyle={{ top: 'max(env(safe-area-inset-top, 0px) + 16px, 16px)' }}
              toastOptions={{
                duration: 3500,
                style: {
                  background:           'rgba(18, 18, 22, 0.96)',
                  backdropFilter:       'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color:                '#e2e8f0',
                  border:               '1px solid rgba(124,58,237,0.25)',
                  borderRadius:         '14px',
                  fontSize:             '14px',
                  fontWeight:           '500',
                  padding:              '12px 16px',
                  maxWidth:             '340px',
                  boxShadow:            '0 8px 32px rgba(0,0,0,0.4)',
                },
                success: { iconTheme: { primary: '#7c3aed', secondary: '#e2e8f0' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' } },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
        <InstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
