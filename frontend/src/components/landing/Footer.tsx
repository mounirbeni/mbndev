'use client';

import Link from 'next/link';
import { ArrowUpRight, Globe2, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const services = [
  { label: 'Custom Websites', href: '/services' },
  { label: 'E-Commerce Stores', href: '/services' },
  { label: 'Web Applications', href: '/services' },
  { label: 'Maintenance & Support', href: '/services' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#040408]">
      <div className="absolute inset-0 ambient-grid opacity-10 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center flex-wrap justify-center gap-3">
            <span className="font-semibold text-slate-300">Payment channels:</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">CIH Bank</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">PayPal</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">TapTapSend</span>
          </div>
          <div className="inline-flex gap-2 items-center"><ShieldCheck className="w-4 h-4 text-violet-400" aria-hidden="true" /><span>HTTPS for website connections · payment availability confirmed at checkout</span></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14">
          <div className="lg:col-span-1">
            <Link href="/" aria-label="MBN DEV homepage" className="inline-flex mb-5"><Logo3D size="md" /></Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Custom websites and digital products, with a workspace for project communication and delivery.</p>
            <div className="inline-flex items-center gap-2 text-xs text-slate-400"><MapPin className="w-4 h-4 text-violet-400" /> Based in Morocco · remote collaboration</div>
            <a href="https://github.com/mounirbeni" target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold">Developer's GitHub <ArrowUpRight className="w-3.5 h-3.5" /></a>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm mb-5">Explore</h2>
            <nav aria-label="Footer navigation" className="flex flex-col gap-3">{navigation.map((item) => <Link key={item.href} href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">{item.label}</Link>)}</nav>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm mb-5">Services</h2>
            <nav aria-label="Services" className="flex flex-col gap-3">{services.map((item) => <Link key={item.label} href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">{item.label}</Link>)}</nav>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm mb-5">Get in touch</h2>
            <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"><MessageCircle className="w-4 h-4 text-violet-400" /> WhatsApp</a>
            <a href="mailto:contact@mbndev.ma" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"><Mail className="w-4 h-4 text-violet-400" /> contact@mbndev.ma</a>
            <div className="flex items-center gap-2 text-sm text-slate-400"><Globe2 className="w-4 h-4 text-violet-400" /> Morocco · Worldwide enquiries</div>
          </div>
        </div>
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} MBN DEV. All rights reserved.</span>
          <nav aria-label="Legal" className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacy Policy</Link><Link href="/terms" className="hover:text-white">Terms of Service</Link></nav>
        </div>
      </div>
    </footer>
  );
}
