import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'MBN DEV — Custom Websites Built to Elevate Your Business',
  description:
    'MBN DEV is a Moroccan platform by Mounir Banni, dedicated to building modern, fast, and high-performing websites tailored to your needs.',
  keywords: ['web development', 'Morocco', 'custom websites', 'web apps', 'MBN DEV'],
  authors: [{ name: 'Mounir Banni' }],
  openGraph: {
    title: 'MBN DEV',
    description: 'Custom Websites Built to Elevate Your Business.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#141417',
                color: '#e2e8f0',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#7c3aed', secondary: '#e2e8f0' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
