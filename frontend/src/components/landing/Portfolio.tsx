'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// Selected portfolio entries include proprietary products and prototypes.
// Do not claim an entry is a paying client, commissioned work, or currently
// live without owner-approved evidence and a checked public destination.
const projects = [
  { title: 'Transo', category: 'Logistics platform', image: '/images/portfolio/transo.png', url: 'https://transomaroc.vercel.app', gradient: 'from-sky-600/20 to-blue-700/10' },
  { title: 'Lueur Skin', category: 'E-commerce concept', image: '/images/portfolio/lueur-skin.png', url: 'https://lueurskin.vercel.app/', gradient: 'from-purple-500/20 to-violet-700/10' },
  { title: 'VitaCore', category: 'Storefront project', image: '/images/portfolio/vitacore.png', url: 'https://vitapara.vercel.app/fr', gradient: 'from-rose-500/20 to-pink-700/10' },
  { title: 'EMLL', category: 'Travel platform', image: '/images/portfolio/emll.png', url: 'https://emll.vercel.app/', gradient: 'from-violet-400/20 to-indigo-600/10' },
  { title: 'RiadConnect', category: 'Hospitality platform', image: '/images/portfolio/riadconnect.png', url: 'https://riadconnect.vercel.app/', gradient: 'from-purple-600/20 to-violet-500/10' },
  { title: 'ChronoCraft', category: 'Watch storefront', image: '/images/portfolio/chronocraft.png', url: 'https://watchstoremaroc.vercel.app', gradient: 'from-yellow-500/20 to-amber-700/10' },
  { title: 'Tarique / طريق', category: 'Digital platform', image: '/images/portfolio/tarique.png', url: 'https://www.tarique.ma', gradient: 'from-amber-500/20 to-orange-700/10' },
];

export default function Portfolio() {
  const [featured, ...rest] = projects;
  return (
    <section id="portfolio" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 ambient-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="mb-14 sm:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div><span className="section-label">SELECTED WORK</span><h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mt-6">Explore our <span className="gradient-text">projects.</span></h2></div>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed lg:text-right">A selection of product concepts, platforms and web experiences. Project status and engagement details are available on request.</p>
        </div>
        <motion.a href={featured.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group relative premium-surface rounded-3xl overflow-hidden flex flex-col md:flex-row mb-5 hover:border-violet-500/30 transition-colors">
          <div className={`relative md:w-5/12 h-60 md:h-80 bg-gradient-to-br ${featured.gradient} shrink-0`}><Image src={featured.image} alt={`${featured.title} preview`} fill priority sizes="(max-width: 768px) 100vw, 42vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#090713]/70 to-transparent" /></div>
          <div className="p-8 md:p-12 flex-1 flex flex-col justify-center"><span className="text-violet-400 text-xs font-semibold tracking-widest uppercase mb-4">{featured.category}</span><h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5">{featured.title}</h3><p className="text-slate-400 mb-7 text-sm leading-relaxed">View the project website for additional details.</p><span className="text-violet-400 inline-flex items-center gap-2 font-semibold text-sm">Open project <ArrowUpRight className="w-4 h-4" /></span></div>
        </motion.a>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {rest.map((project, index) => (
            <motion.a key={project.title} href={project.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="group premium-surface rounded-2xl overflow-hidden hover:border-violet-500/25 transition-colors">
              <div className={`relative h-44 bg-gradient-to-br ${project.gradient}`}><Image src={project.image} alt={`${project.title} preview`} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#090713]/50 to-transparent" /></div>
              <div className="p-5"><p className="text-violet-400 text-[10px] font-semibold uppercase tracking-widest mb-2">{project.category}</p><h3 className="text-white text-lg font-bold mb-4">{project.title}</h3><span className="text-slate-400 group-hover:text-violet-300 text-xs inline-flex items-center gap-1 transition-colors">Open project <ArrowUpRight className="w-3.5 h-3.5" /></span></div>
            </motion.a>
          ))}
          <Link href="/portfolio" className="premium-surface rounded-2xl min-h-[220px] p-7 flex flex-col justify-center items-center text-center group hover:border-violet-500/25 transition-colors"><ArrowUpRight className="w-9 h-9 text-violet-400 mb-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /><span className="text-white font-bold">Full portfolio</span><span className="text-slate-400 text-xs mt-2">Explore more work</span></Link>
        </div>
      </div>
    </section>
  );
}
