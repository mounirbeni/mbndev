import Navbar from './Navbar';
import Footer from './Footer';
import LandingBottomNav from './LandingBottomNav';
import FloatingSupport from '@/components/ui/FloatingSupport';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Subtle page-wide gradient */}
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" aria-hidden="true" />
      <div className="relative z-0">
        <Navbar />
        {/* Extra bottom padding on mobile so content isn't hidden behind bottom nav */}
        <main className="pb-[74px] lg:pb-0">{children}</main>
        <Footer />
      </div>
      {/* Bottom tab bar — mobile only */}
      <LandingBottomNav />
      <FloatingSupport />
    </div>
  );
}
