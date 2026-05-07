import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
