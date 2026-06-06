import Navbar from './Navbar';
import Footer from './Footer';
import LandingBottomNav from './LandingBottomNav';
import FloatingSupport from '@/components/ui/FloatingSupport';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#06060a' }}>
      {/* Page-wide cinematic depth gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.08) 0%, transparent 60%)',
        }}
      />
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
