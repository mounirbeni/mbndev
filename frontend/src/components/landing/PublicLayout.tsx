import Navbar from './Navbar';
import Footer from './Footer';
import LandingBottomNav from './LandingBottomNav';
import FloatingSupport from '@/components/ui/FloatingSupport';
import SmoothScroll from '@/components/ui/SmoothScroll';
import SilkBackdrop from '@/components/ui/SilkBackdrop';
import CinemaLayer from '@/components/ui/CinemaLayer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
    <div className="min-h-screen text-white" style={{ background: '#06060a' }}>
      {/* Page-wide cinematic depth gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.08) 0%, transparent 60%)',
        }}
      />
      <div className="relative isolate">
        {/* Silk ribbon behind every page's hero — same signature as the home page */}
        <SilkBackdrop className="absolute inset-x-0 top-0 h-[110vh] max-h-[1100px]" anchor={[0.6, 0.62]} />
        <Navbar />
        {/* Extra bottom padding on mobile so content isn't hidden behind bottom nav */}
        <main className="pb-[74px] lg:pb-0">{children}</main>
        <Footer />
      </div>
      {/* Bottom tab bar — mobile only */}
      <LandingBottomNav />
      <FloatingSupport />
      <CinemaLayer />
    </div>
    </SmoothScroll>
  );
}
