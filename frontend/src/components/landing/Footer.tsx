import { Zap, MapPin, Mail, Phone, Facebook, Linkedin, Twitter, Github, Heart } from 'lucide-react';
import Link from 'next/link';

const links = {
  'Quick Links': ['Home', 'Services', 'Portfolio', 'Pricing', 'About', 'Contact'],
  Services: ['Custom Websites', 'E-commerce Stores', 'Web Applications', 'Landing Pages', 'Maintenance & Support'],
};

const socials = [
  { icon: Facebook, href: '#' },
  { icon: Linkedin, href: '#' },
  { icon: Twitter,  href: '#' },
  { icon: Github,   href: '#' },
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

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

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
                hello@mbndev.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                +212 6 12 34 56 78
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
          <p className="text-slate-600 text-sm">© 2024 MBN DEV. All rights reserved.</p>
          <p className="text-slate-600 text-sm flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in Morocco
          </p>
        </div>
      </div>
    </footer>
  );
}
