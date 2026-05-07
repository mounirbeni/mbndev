'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const projects = [
  {
    title: 'CarryLink',
    url: 'https://carrylink.vercel.app/',
    type: 'P2P Logistics Platform',
    desc: 'Connects senders with travelers for cost-effective worldwide package delivery.',
    tag: 'blue',
    gradient: 'from-sky-500/25 to-blue-600/15',
    initial: 'CL',
  },
  {
    title: 'Lueur Skin',
    url: 'https://lueurskin.vercel.app/',
    type: 'Premium Skincare Store',
    desc: 'Luxury skincare brand with AI-powered skin consultation and personalized product recommendations.',
    tag: 'red',
    gradient: 'from-rose-500/25 to-pink-600/15',
    initial: 'LS',
  },
  {
    title: 'TyyMaroc',
    url: 'https://tyymaroc.vercel.app/',
    type: 'Online Parapharmacie',
    desc: 'Moroccan wellness e-commerce in French & Arabic with certified products and 24–48h delivery.',
    tag: 'green',
    gradient: 'from-teal-500/25 to-emerald-600/15',
    initial: 'TM',
  },
  {
    title: 'Emll',
    url: 'https://emll.vercel.app/',
    type: 'Travel Experience Booking',
    desc: 'Book guided tours in Marrakech — desert trips, cooking classes, and mountain adventures.',
    tag: 'yellow',
    gradient: 'from-amber-500/25 to-orange-500/15',
    initial: 'EM',
  },
  {
    title: 'RiadConnect',
    url: 'https://www.riadconnect.com/',
    type: 'Hospitality SaaS',
    desc: 'Commission-free booking platform for Moroccan Riads with AI guest assistant and WhatsApp integration.',
    tag: 'purple',
    gradient: 'from-violet-500/25 to-purple-600/15',
    initial: 'RC',
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            Our Work
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Recent <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Live products built for real clients — from Moroccan e-commerce to global platforms.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl overflow-hidden group border border-white/5 hover:border-primary-500/30 transition-all"
            >
              {/* Preview */}
              <div className={`h-44 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl font-black text-white/8 select-none tracking-tighter">{p.initial}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100/70 to-transparent" />

                {/* Live badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] bg-green-500/20 border border-green-500/25 rounded-full px-2.5 py-1 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </div>

                {/* External link — visible on hover */}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </a>
              </div>

              <div className="p-5">
                <Badge color={p.tag as any} className="mb-3">{p.type}</Badge>
                <h3 className="text-white font-semibold text-lg mb-1.5">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* View all card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: projects.length * 0.08 }}
          >
            <Link href="/portfolio" className="block h-full">
              <div className="glass rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all h-full min-h-[220px] flex flex-col items-center justify-center gap-4 p-8 text-center group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">View Full Portfolio</p>
                  <p className="text-slate-500 text-sm">See all projects with details</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
