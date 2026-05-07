'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Globe, ShoppingCart, BarChart3, Rocket, Settings, Wrench,
  Check, ArrowRight, Zap, Shield, Clock
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

const services = [
  {
    icon: Globe,
    title: 'Custom Websites',
    tagline: 'Your brand, perfectly built.',
    description: 'Fully custom, responsive websites designed and developed from scratch to match your brand identity and business goals.',
    features: ['Pixel-perfect responsive design', 'SEO-optimized structure', 'Performance-first development', 'CMS integration', 'Google Analytics setup', 'Custom domain & hosting support'],
    price: 'From $299',
    slug: 'websites',
    color: 'from-primary-500/20 to-blue-500/10',
    border: 'border-primary-500/30',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    tagline: 'Sell smarter, scale faster.',
    description: 'Full-featured online stores with secure payment integration, inventory management, and optimized checkout flows.',
    features: ['Stripe & PayPal integration', 'Product catalog & filtering', 'Cart & checkout optimization', 'Order management dashboard', 'Inventory tracking', 'Email notifications'],
    price: 'From $699',
    slug: 'ecommerce',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
  },
  {
    icon: BarChart3,
    title: 'SaaS Dashboards',
    tagline: 'Complex apps, clean interfaces.',
    description: 'Complex web applications with user authentication, real-time data, admin panels, and scalable backend architecture.',
    features: ['JWT authentication system', 'Role-based access control', 'Real-time data updates', 'REST API development', 'Database design & optimization', 'CI/CD deployment pipeline'],
    price: 'From $1,299',
    slug: 'saas',
    color: 'from-purple-500/20 to-primary-500/10',
    border: 'border-purple-500/30',
  },
  {
    icon: Rocket,
    title: 'Landing Pages',
    tagline: 'Convert visitors into clients.',
    description: 'High-converting landing pages with compelling copy structure, animated sections, and CTA optimization.',
    features: ['Conversion-optimized layout', 'A/B testing ready', 'Fast load time (<2s)', 'Lead capture forms', 'Social proof sections', 'Mobile-first design'],
    price: 'From $199',
    slug: 'landing-pages',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/30',
  },
  {
    icon: Settings,
    title: 'Web Applications',
    tagline: 'Custom software, zero compromise.',
    description: 'Tailored web applications built for your specific business workflow — from internal tools to customer-facing platforms.',
    features: ['Custom business logic', 'Third-party API integration', 'File upload & management', 'Notifications system', 'Reporting & analytics', 'Scalable architecture'],
    price: 'From $999',
    slug: 'web-apps',
    color: 'from-orange-500/20 to-yellow-500/10',
    border: 'border-orange-500/30',
  },
  {
    icon: Wrench,
    title: 'Support & Maintenance',
    tagline: 'We stay after delivery.',
    description: 'Ongoing technical support, security updates, performance monitoring, and feature enhancements for existing projects.',
    features: ['Monthly performance reports', 'Security patches & updates', 'Bug fixes & hotfixes', 'Feature add-ons', 'Uptime monitoring', 'Priority response time'],
    price: 'From $99/mo',
    slug: 'maintenance',
    color: 'from-slate-500/20 to-slate-600/10',
    border: 'border-slate-500/30',
  },
];

const highlights = [
  { icon: Zap, label: 'Fast Delivery', desc: 'On-time, every time' },
  { icon: Shield, label: 'Secure & Modern', desc: 'Best practices always' },
  { icon: Clock, label: '24h Response', desc: 'Quick communication' },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" /> What We Build
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Every Service You Need<br />
              <span className="gradient-text">Under One Roof</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              From landing pages to full SaaS platforms — we design, build, and launch digital products that perform.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-2 text-slate-400">
                  <h.icon className="w-4 h-4 text-primary-400" />
                  <span className="text-sm"><span className="text-white font-medium">{h.label}</span> — {h.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass rounded-2xl p-8 border ${s.border} bg-gradient-to-br ${s.color} flex flex-col group hover:scale-[1.02] transition-transform duration-300`}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-primary-400 text-sm mb-3 font-medium">{s.tagline}</p>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1">{s.description}</p>

                  <ul className="space-y-2 mb-6">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="w-3.5 h-3.5 text-primary-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <span className="text-white font-bold">{s.price}</span>
                    <Link href={`/request?service=${s.slug}`}>
                      <button className="flex items-center gap-1.5 text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors group-hover:gap-2.5">
                        Get Started <ArrowRight className="w-3.5 h-3.5 transition-all" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 text-center border border-primary-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Not sure which service?</h2>
            <p className="text-slate-400 mb-8 relative z-10">Tell us about your project and we'll recommend the best approach.</p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link href="/request">
                <Button size="lg" className="group">
                  Start a Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">Talk to Us First</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
