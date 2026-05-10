import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { HtmlLangSync } from '@/components/HtmlLangSync';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import InstallPrompt from '@/components/mobile/InstallPrompt';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default:  'MBN DEV — Custom Websites Built to Elevate Your Business',
    template: '%s — MBN DEV',
  },
  description:
    'MBN DEV is a Moroccan platform by Mounir Banni, dedicated to building modern, fast, and high-performing websites and web applications tailored to your business needs.',
  keywords: [
    'web development', 'Morocco', 'custom websites', 'web apps', 'MBN DEV',
    'Mounir Banni', 'e-commerce', 'Next.js', 'SaaS', 'web design Morocco',
    'création site web Maroc',
  ],
  authors:  [{ name: 'Mounir Banni', url: 'https://mbndev.com' }],
  creator:  'Mounir Banni',
  metadataBase: new URL('https://mbndev.com'),
  manifest: '/manifest.json',
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MBN DEV',
  },
  openGraph: {
    title:       'MBN DEV — Custom Websites Built to Elevate Your Business',
    description: 'A Moroccan platform by Mounir Banni building modern, fast, and high-performing websites.',
    type:        'website',
    url:         'https://mbndev.com',
    siteName:    'MBN DEV',
    locale:      'en_US',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'MBN DEV — Custom Websites Built to Elevate Your Business',
    description: 'A Moroccan platform by Mounir Banni building modern websites and web apps.',
    creator:     '@mbndev',
  },
  other: {
    'mobile-web-app-capable':  'yes',
    'msapplication-TileColor': '#7c3aed',
    'msapplication-tap-highlight': 'no',
    'contact:phone_number':    '+212705914424',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          {/* Syncs <html lang> and <html dir> whenever the locale changes */}
          <HtmlLangSync />
        <AuthProvider>
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
