import { Zap, MapPin, Mail, Phone, Facebook, Linkedin, Twitter, Github, Heart } from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  { label: 'Home',      href: '/' },
  { label: 'Services',  href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'About',     href: '/about' },
  { label: 'Contact',   href: '/contact' },
];

const serviceLinks = [
  { label: 'Custom Websites',       href: '/services/custom-websites' },
  { label: 'E-Commerce Stores',     href: '/services/ecommerce' },
  { label: 'Web Applications',      href: '/services/web-applications' },
  { label: 'Landing Pages',         href: '/services/landing-pages' },
  { label: 'Maintenance & Support', href: '/services/maintenance' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const socials = [
  { icon: Facebook, href: 'https://facebook.com' },
  { icon: Linkedin, href: 'https://linkedin.com' },
  { icon: Twitter,  href: 'https://twitter.com' },
  { icon: Github,   href: 'https://github.com' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">MBN DEV</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              A Moroccan platform by Mounir Banni, building digital solutions that help businesses grow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Morocco — Available Worldwide
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <Link href="/contact" className="hover:text-slate-300 transition-colors">
                  hello@mbndev.com
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href="tel:+212705914424" className="hover:text-slate-300 transition-colors">
                  +212 705 914 424
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              {socials.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-slate-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} MBN DEV. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-400 transition-colors">{l.label}</Link>
            ))}
            <span className="flex items-center gap-1.5">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in Morocco
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
