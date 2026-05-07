import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Subtle page-wide gradient */}
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" aria-hidden="true" />
      <div className="relative z-0">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
