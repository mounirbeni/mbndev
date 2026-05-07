import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import InstallPrompt from '@/components/mobile/InstallPrompt';
import './globals.css';

export const metadata: Metadata = {
  title: 'MBN DEV — Custom Websites Built to Elevate Your Business',
  description:
    'MBN DEV is a Moroccan platform by Mounir Banni, dedicated to building modern, fast, and high-performing websites tailored to your needs.',
  keywords: ['web development', 'Morocco', 'custom websites', 'web apps', 'MBN DEV'],
  authors: [{ name: 'Mounir Banni' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MBN DEV',
  },
  openGraph: {
    title: 'MBN DEV',
    description: 'Custom Websites Built to Elevate Your Business.',
    type: 'website',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#7c3aed',
    'msapplication-tap-highlight': 'no',
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
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#141417',
                color: '#e2e8f0',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#7c3aed', secondary: '#e2e8f0' } },
            }}
          />
        </AuthProvider>
        <InstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
