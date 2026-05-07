'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, ArrowRight, Zap } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

const categories = ['All', 'E-Commerce', 'Web App', 'Landing Page', 'SaaS', 'Corporate'];

const projects = [
  {
    id: 1,
    title: 'Ayoub Transport',
    category: 'Corporate',
    type: 'Corporate Website',
    description: 'A full corporate website for a Moroccan transport & logistics company with fleet management portal.',
    tags: ['Next.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
    gradient: 'from-blue-600/40 to-cyan-500/20',
    accent: 'text-blue-400',
    border: 'border-blue-500/20',
    metrics: [{ label: 'Load Time', value: '0.9s' }, { label: 'Lighthouse', value: '98' }, { label: 'Uptime', value: '99.9%' }],
    result: 'Increased online inquiries by 340%',
  },
  {
    id: 2,
    title: 'Dar Marrakech',
    category: 'Corporate',
    type: 'Hotel & Booking',
    description: 'Luxury riad booking platform with reservation system, room gallery, and multilingual support.',
    tags: ['React', 'Node.js', 'Stripe', 'MongoDB'],
    gradient: 'from-amber-600/40 to-orange-500/20',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    metrics: [{ label: 'Bookings', value: '+280%' }, { label: 'Bounce Rate', value: '-42%' }, { label: 'Revenue', value: '+$12k' }],
    result: 'Fully replaced third-party booking platform',
  },
  {
    id: 3,
    title: 'Morocco Shop',
    category: 'E-Commerce',
    type: 'E-Commerce Store',
    description: 'Full-featured e-commerce platform for Moroccan artisan products with Arabic/French/English support.',
    tags: ['Next.js', 'Stripe', 'Prisma', 'Cloudinary'],
    gradient: 'from-emerald-600/40 to-green-500/20',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    metrics: [{ label: 'Products', value: '500+' }, { label: 'Orders/mo', value: '1.2k' }, { label: 'Revenue', value: '+65%' }],
    result: 'Launched in 3 weeks, profitable in month 1',
  },
  {
    id: 4,
    title: 'Atlas Real Estate',
    category: 'Web App',
    type: 'Real Estate Platform',
    description: 'Property listing and management platform with advanced search, map integration, and agent portal.',
    tags: ['React', 'Mapbox', 'Express', 'PostgreSQL'],
    gradient: 'from-rose-600/40 to-pink-500/20',
    accent: 'text-rose-400',
    border: 'border-rose-500/20',
    metrics: [{ label: 'Listings', value: '2k+' }, { label: 'Agents', value: '45' }, { label: 'Leads/mo', value: '320' }],
    result: 'Top real estate platform in the Atlas region',
  },
  {
    id: 5,
    title: 'SaaS Analytics Pro',
    category: 'SaaS',
    type: 'Analytics Dashboard',
    description: 'Multi-tenant SaaS analytics platform with real-time charts, custom reports, and team management.',
    tags: ['Next.js', 'Recharts', 'Prisma', 'Redis'],
    gradient: 'from-violet-600/40 to-purple-500/20',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    metrics: [{ label: 'Users', value: '800+' }, { label: 'MRR', value: '$4.2k' }, { label: 'Churn', value: '1.2%' }],
    result: 'Profitable SaaS in 60 days post-launch',
  },
  {
    id: 6,
    title: 'Resto Digital',
    category: 'Landing Page',
    type: 'Restaurant Landing',
    description: 'High-converting restaurant landing page with online menu, reservation form, and Google Maps embed.',
    tags: ['Next.js', 'Framer Motion', 'Resend', 'Vercel'],
    gradient: 'from-orange-600/40 to-red-500/20',
    accent: 'text-orange-400',
    border: 'border-orange-500/20',
    metrics: [{ label: 'Reservations', value: '+220%' }, { label: 'Load Time', value: '0.7s' }, { label: 'Score', value: '100' }],
    result: 'Doubled reservation rate within 2 weeks',
  },
];

export default function PortfolioPage() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" /> Our Work
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Projects That<br /><span className="gradient-text">Speak for Themselves</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Real projects, real results. Every product we ship is built to perform, scale, and convert.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active === c
                    ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`glass rounded-2xl border ${p.border} overflow-hidden group hover:scale-[1.02] transition-transform duration-300 flex flex-col`}
                >
                  {/* Preview area */}
                  <div className={`h-48 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center`}>
                    <div className="text-center">
                      <div className={`text-4xl font-black ${p.accent} opacity-20 select-none`}>
                        {p.title.split(' ').map(w => w[0]).join('')}
                      </div>
                    </div>
                    <span className="absolute top-3 right-3 text-[10px] bg-white/10 border border-white/20 rounded-full px-2.5 py-1 text-slate-300">
                      {p.type}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{p.description}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {p.metrics.map((m) => (
                        <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                          <div className={`text-sm font-bold ${p.accent}`}>{m.value}</div>
                          <div className="text-slate-600 text-[10px]">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Result */}
                    <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl mb-4">
                      <Zap className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300 text-xs">{p.result}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to be our next case study?</h2>
            <p className="text-slate-400 mb-8">Let's build something remarkable together.</p>
            <Link href="/request">
              <Button size="lg" className="group">
                Start Your Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
