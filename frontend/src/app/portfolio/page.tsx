'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, ArrowRight, Zap } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

// Project category IDs (language-agnostic, used for filtering)
type Category = 'All' | 'E-Commerce' | 'Web App' | 'SaaS' | 'Hospitality';

const projects: {
  id: number;
  title: string;
  url: string;
  category: Category;
  type: string;
  description: string;
  tags: string[];
  gradient: string;
  accent: string;
  border: string;
  stats: { label: string; value: string }[];
  highlight: string;
}[] = [
  {
    id: 1,
    title: 'CarryLink',
    url: 'https://carrylink.vercel.app/',
    category: 'Web App',
    type: 'P2P Logistics Platform',
    description: 'Peer-to-peer delivery platform that connects senders with travelers for cost-effective package delivery worldwide. Features user authentication, shipment tracking, and a matching engine.',
    tags: ['Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    gradient: 'from-sky-600/40 to-blue-500/20',
    accent: 'text-sky-400',
    border: 'border-sky-500/20',
    stats: [
      { label: 'Type',     value: 'P2P'        },
      { label: 'Auth',     value: 'Full'        },
      { label: 'Delivery', value: 'Worldwide'   },
    ],
    highlight: 'Connects senders & travelers for affordable worldwide delivery',
  },
  {
    id: 2,
    title: 'Lueur Skin',
    url: 'https://lueurskin.vercel.app/',
    category: 'E-Commerce',
    type: 'Premium Skincare Store',
    description: 'Luxury skincare e-commerce brand selling sea moss gummies and herbal teas. Features an AI-powered skin consultation that gives personalized product recommendations.',
    tags: ['Next.js', 'E-Commerce', 'AI Skin Analysis', 'Stripe'],
    gradient: 'from-rose-600/30 to-pink-400/20',
    accent: 'text-rose-400',
    border: 'border-rose-500/20',
    stats: [
      { label: 'AI Feature', value: 'Skin Quiz'  },
      { label: 'Style',      value: 'Luxury'     },
      { label: 'Market',     value: 'Global'     },
    ],
    highlight: 'AI skin consultation drives personalized product discovery',
  },
  {
    id: 3,
    title: 'TyyMaroc',
    url: 'https://tyymaroc.vercel.app/',
    category: 'E-Commerce',
    type: 'Online Parapharmacie',
    description: 'Moroccan e-commerce platform for certified beauty, health, wellness, and orthopedic products. Bilingual (FR/AR) with 24–48hr local delivery and a clean product catalog.',
    tags: ['Next.js', 'Bilingual FR/AR', 'Product Catalog', 'Vercel'],
    gradient: 'from-teal-600/35 to-emerald-500/20',
    accent: 'text-teal-400',
    border: 'border-teal-500/20',
    stats: [
      { label: 'Languages', value: 'FR / AR'    },
      { label: 'Delivery',  value: '24–48h'     },
      { label: 'Market',    value: 'Morocco'    },
    ],
    highlight: 'Certified wellness products with fast Moroccan delivery',
  },
  {
    id: 4,
    title: 'Emll',
    url: 'https://emll.vercel.app/',
    category: 'Hospitality',
    type: 'Travel Experience Booking',
    description: 'Marrakech travel experience platform for booking guided tours and activities — desert trips, cooking classes, and mountain adventures with local guides.',
    tags: ['Next.js', 'Booking System', 'Email Automation', 'Payments'],
    gradient: 'from-amber-600/35 to-orange-400/20',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    stats: [
      { label: 'City',       value: 'Marrakech' },
      { label: 'Activities', value: '10+'       },
      { label: 'Style',      value: 'Moroccan'  },
    ],
    highlight: 'Authentic Marrakech experiences — desert, mountains & culture',
  },
  {
    id: 5,
    title: 'RiadConnect',
    url: 'https://www.riadconnect.com/',
    category: 'SaaS',
    type: 'Hospitality SaaS Platform',
    description: 'Commission-free booking platform for Moroccan Riads. Provides AI guest assistant, custom riad websites, SEO optimization, and WhatsApp integration — giving riads full ownership of their bookings.',
    tags: ['Next.js', 'AI Assistant', 'WhatsApp API', 'SEO'],
    gradient: 'from-violet-600/35 to-purple-400/20',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    stats: [
      { label: 'AI',         value: 'Guest Bot' },
      { label: 'Fees',       value: '0%'        },
      { label: 'Market',     value: 'Riads'     },
    ],
    highlight: 'Commission-free direct bookings with AI guest assistant',
  },
  {
    id: 6,
    title: 'RiadDemo',
    url: 'https://riaddemo.vercel.app',
    category: 'Hospitality',
    type: 'Riad Booking Website',
    description: 'Elegant booking website for a Moroccan Riad featuring room showcases, availability management, and a seamless direct reservation flow — built to convert visitors into guests.',
    tags: ['Next.js', 'Booking System', 'Tailwind CSS', 'Vercel'],
    gradient: 'from-orange-600/35 to-amber-400/20',
    accent: 'text-orange-400',
    border: 'border-orange-500/20',
    stats: [
      { label: 'Type',    value: 'Hospitality' },
      { label: 'Market',  value: 'Morocco'     },
      { label: 'Booking', value: 'Direct'      },
    ],
    highlight: 'Elegant riad showcase with direct booking and room availability',
  },
  {
    id: 7,
    title: 'WatchStoreMaroc',
    url: 'https://watchstoremaroc.vercel.app',
    category: 'E-Commerce',
    type: 'Luxury Watch Store',
    description: 'Premium e-commerce store for luxury and fashion watches in Morocco. Features a curated product catalog, smart filtering by brand and price range, and a polished shopping experience.',
    tags: ['Next.js', 'E-Commerce', 'Product Catalog', 'Tailwind CSS'],
    gradient: 'from-yellow-600/30 to-amber-500/15',
    accent: 'text-yellow-400',
    border: 'border-yellow-500/20',
    stats: [
      { label: 'Style',   value: 'Luxury'  },
      { label: 'Market',  value: 'Morocco' },
      { label: 'Product', value: 'Watches' },
    ],
    highlight: 'Premium watch catalog with brand filtering and sleek checkout',
  },
];

// Map category IDs to translation keys
const CATEGORY_KEYS: Record<string, string> = {
  'All':         'portfolio.cat.all',
  'E-Commerce':  'portfolio.cat.ecommerce',
  'Web App':     'portfolio.cat.webapp',
  'SaaS':        'portfolio.cat.saas',
  'Hospitality': 'portfolio.cat.hospitality',
};

const CATEGORY_IDS: Category[] = ['All', 'E-Commerce', 'Web App', 'SaaS', 'Hospitality'];

export default function PortfolioPage() {
  const { t } = useLanguage();
  const [active, setActive] = useState<Category>('All');

  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" /> {t('portfolio.badge')}
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              {t('portfolio.pageTitle')}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t('portfolio.pageSub')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORY_IDS.map((catId) => (
              <button
                key={catId}
                onClick={() => setActive(catId)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active === catId
                    ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {t(CATEGORY_KEYS[catId])}
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
                  className={`glass rounded-2xl border ${p.border} overflow-hidden group hover:scale-[1.015] transition-transform duration-300 flex flex-col`}
                >
                  {/* Preview area */}
                  <div className={`h-44 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center overflow-hidden`}>
                    <div className={`text-6xl font-black ${p.accent} opacity-10 select-none tracking-tighter`}>
                      {p.title.replace(/\s/g, '')}
                    </div>
                    {/* Type badge */}
                    <span className="absolute top-3 right-3 text-[10px] bg-black/30 backdrop-blur-sm border border-white/15 rounded-full px-2.5 py-1 text-slate-300">
                      {p.type}
                    </span>
                    {/* Live badge */}
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] bg-green-500/20 border border-green-500/30 rounded-full px-2.5 py-1 text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      {t('portfolio.live')}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-bold text-lg">{p.title}</h3>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`shrink-0 ${p.accent} opacity-60 hover:opacity-100 transition-opacity`}
                        aria-label={`Visit ${p.title}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{p.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {p.stats.map((s) => (
                        <div key={s.label} className="bg-white/5 rounded-lg p-2 text-center">
                          <div className={`text-xs font-bold ${p.accent}`}>{s.value}</div>
                          <div className="text-slate-600 text-[10px] mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Highlight */}
                    <div className="flex items-start gap-2 p-3 bg-white/4 rounded-xl mb-4">
                      <Zap className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300 text-xs leading-snug">{p.highlight}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-400">
                          {tag}
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
            <h2 className="text-3xl font-bold text-white mb-3">{t('portfolio.cta.title')}</h2>
            <p className="text-slate-400 mb-8">{t('portfolio.cta.sub')}</p>
            <Link href="/request">
              <Button size="lg" className="group">
                {t('hero.cta.primary')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
