'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Layers } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';

type Category = 'All' | 'E-Commerce' | 'Web App' | 'SaaS' | 'Hospitality';
const categories: Category[] = ['All', 'E-Commerce', 'Web App', 'SaaS', 'Hospitality'];

// This gallery represents selected builds and concepts. It is not a list of
// verified paying clients, live commercial operations or measured outcomes.
// Links and permission to identify client work require periodic owner review.
const projects: { title: string; category: Exclude<Category, 'All'>; image: string; url: string; description: string }[] = [
  { title: 'Lueur Skin', category: 'E-Commerce', image: '/images/portfolio/lueur-skin.png', url: 'https://lueurskin.vercel.app/', description: 'Skincare storefront design and product browsing.' },
  { title: 'EMLL', category: 'Hospitality', image: '/images/portfolio/emll.png', url: 'https://emll.vercel.app/', description: 'A travel experiences website focused on Marrakech.' },
  { title: 'RiadConnect', category: 'SaaS', image: '/images/portfolio/riadconnect.png', url: 'https://riadconnect.vercel.app/', description: 'A hospitality platform concept with a booking-focused interface.' },
  { title: 'EmpowerFit', category: 'Web App', image: '/images/portfolio/empowerfit.png', url: 'https://empowerfiit.netlify.app/', description: 'A fitness-oriented progressive web app concept.' },
  { title: 'EDU Platform', category: 'SaaS', image: '/images/portfolio/edu-platform.png', url: 'https://edumaroc.vercel.app', description: 'A learning platform interface with student and administration areas.' },
  { title: 'VitaCore', category: 'E-Commerce', image: '/images/portfolio/vitacore.png', url: 'https://vitapara.vercel.app/fr', description: 'A health and wellness storefront concept.' },
  { title: 'Sitey & AndK', category: 'SaaS', image: '/images/portfolio/sitey-andk.png', url: 'https://siteyandk.vercel.app', description: 'A marketplace concept for showcasing and discovering websites.' },
  { title: 'Transo', category: 'Web App', image: '/images/portfolio/transo.png', url: 'https://transomaroc.vercel.app', description: 'An interface for sender and courier coordination.' },
  { title: 'ChronoCraft', category: 'E-Commerce', image: '/images/portfolio/chronocraft.png', url: 'https://watchstoremaroc.vercel.app', description: 'A watch catalogue and shopping experience.' },
  { title: 'Riad Dar Kader', category: 'Hospitality', image: '/images/portfolio/riad-dar-kader.png', url: 'https://riadkader.vercel.app/fr', description: 'A riad website and direct booking interface.' },
  { title: 'Caramelio', category: 'Hospitality', image: '/images/portfolio/caramelio.png', url: 'https://caramelio.vercel.app', description: 'A restaurant website concept with menu and booking interfaces.' },
  { title: 'MBN Health', category: 'Web App', image: '/images/portfolio/mbn-health.png', url: 'https://mbnhealth.vercel.app', description: 'A wellness-oriented web application concept.' },
];

export default function PortfolioPage() {
  const [category, setCategory] = useState<Category>('All');
  const filtered = category === 'All' ? projects : projects.filter((project) => project.category === category);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 sm:px-6 pt-36 pb-16">
        <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 -top-40 w-[850px] h-[600px] rounded-full bg-violet-600/[0.08] blur-[110px]" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto relative z-10 text-center">
          <span className="section-label">SELECTED WORK</span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mt-6 tracking-tight">Designed. Built. <span className="gradient-text">Explored.</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mt-6 leading-relaxed">A selection of product concepts, platforms and web experiences. These examples do not imply verified client engagements or commercial results. Contact us for project-specific references and availability.</p>
        </motion.div>
      </section>
      <section className="px-4 sm:px-6 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10" role="group" aria-label="Filter projects by type">
            {categories.map((item) => (
              <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full text-sm px-5 py-2.5 border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 ${category === item ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/25'}`}>{item}</button>
            ))}
          </div>
          <p className="flex items-center gap-2 text-slate-500 text-xs mb-6"><Layers className="w-4 h-4" /> Showing {filtered.length} of {projects.length} selected projects</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project, index) => (
              <motion.article key={project.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index, 5) * 0.04 }} className="premium-surface rounded-2xl overflow-hidden group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#100d1b]"><Image src={project.image} alt={`${project.title} project preview`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-6 flex flex-col flex-1"><span className="text-violet-400 text-[11px] font-semibold uppercase tracking-widest mb-2">{project.category}</span><h2 className="text-white font-bold text-xl mb-2">{project.title}</h2><p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">{project.description}</p><a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">Open project website <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></a></div>
              </motion.article>
            ))}
          </div>
          <div className="premium-surface-featured rounded-3xl text-center p-8 sm:p-12 mt-16"><h2 className="text-white font-black text-3xl sm:text-4xl mb-4">Your project could be next.</h2><p className="text-slate-400 mb-8 max-w-lg mx-auto">Tell us what you need. We will discuss your requirements and propose an appropriate scope.</p><Link href="/request" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-3.5 transition-colors">Start a project <ArrowRight className="w-4 h-4" /></Link></div>
        </div>
      </section>
    </PublicLayout>
  );
}
