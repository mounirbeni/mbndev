'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Globe, Layout, Settings, ShoppingCart, Wrench, Check } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';

const services = [
  { icon: Globe, title: 'Custom Websites', category: 'WEB DEVELOPMENT', description: 'Websites designed around your brand, content and business requirements.', scope: ['Responsive layouts', 'Content structure', 'SEO foundations'], href: '/services/custom-websites', color: 'from-violet-500/15 to-blue-500/5' },
  { icon: ShoppingCart, title: 'E-Commerce Stores', category: 'ONLINE COMMERCE', description: 'Product browsing, checkout and store management tailored to your chosen payment methods.', scope: ['Product catalogue', 'Checkout requirements', 'Order management'], href: '/services/ecommerce', color: 'from-blue-500/15 to-cyan-500/5' },
  { icon: BarChart3, title: 'SaaS & Dashboards', category: 'DIGITAL PRODUCTS', description: 'Platforms with workflows, accounts and administration tools defined for your use case.', scope: ['User roles', 'Data management', 'Workflow planning'], href: '/request?service=dashboard', color: 'from-fuchsia-500/15 to-violet-500/5' },
  { icon: Layout, title: 'Landing Pages', category: 'CAMPAIGN WEBSITES', description: 'Focused pages that explain your offer and guide visitors toward a clear action.', scope: ['Responsive design', 'Clear calls to action', 'Lead form options'], href: '/services/landing-pages', color: 'from-emerald-500/15 to-teal-500/5' },
  { icon: Settings, title: 'Web Applications', category: 'CUSTOM SOFTWARE', description: 'Custom web tools, customer portals and booking interfaces built around agreed workflows.', scope: ['Requirements review', 'Application architecture', 'Custom interfaces'], href: '/services/web-applications', color: 'from-amber-500/15 to-orange-500/5' },
  { icon: Wrench, title: 'Maintenance & Support', category: 'AFTER LAUNCH', description: 'Technical care, updates and support under a clearly defined maintenance agreement.', scope: ['Scope assessment', 'Support arrangements', 'Optional ongoing care'], href: '/services/maintenance', color: 'from-slate-500/15 to-slate-600/5' },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 sm:px-6 pt-32 pb-20">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[800px] h-[520px] bg-violet-600/[0.08] rounded-full blur-[110px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-4xl mx-auto">
          <span className="section-label">WHAT WE BUILD</span>
          <h1 className="text-white text-5xl sm:text-6xl font-black tracking-tight leading-tight mt-6 mb-6">Digital solutions, <span className="gradient-text">built around you.</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">Explore our development services. Every project is scoped and quoted according to its features, timeline and technical requirements.</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 mt-8 text-violet-400 hover:text-violet-300 text-sm font-semibold">See current package prices <ArrowRight className="w-4 h-4" /></Link>
        </motion.div>
      </section>
      <section className="px-4 sm:px-6 pb-28">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return <motion.article key={service.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className={`glass bg-gradient-to-br ${service.color} rounded-2xl p-8 border border-white/10 flex flex-col`}>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6"><Icon className="w-6 h-6 text-violet-300" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">{service.category}</span>
              <h2 className="text-white font-bold text-2xl mb-3">{service.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-7 flex-1">{service.description}</p>
              <ul className="space-y-3 mb-8">{service.scope.map((item) => <li key={item} className="text-sm text-slate-300 flex items-center gap-2.5"><Check className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />{item}</li>)}</ul>
              <div className="pt-5 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between"><span className="text-xs text-slate-500">Scope and price confirmed in proposal</span><Link href={service.href} className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold">Details <ArrowRight className="w-4 h-4" /></Link></div>
            </motion.article>;
          })}
        </div>
      </section>
      <section className="px-4 sm:px-6 pb-24"><div className="max-w-3xl mx-auto glass rounded-3xl p-10 text-center border border-violet-500/20"><h2 className="text-3xl text-white font-black mb-4">Need a custom quote?</h2><p className="text-slate-400 mb-7">Share your goals and requirements, and we will discuss the scope before confirming a price.</p><Link href="/request" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold">Start your project <ArrowRight className="w-4 h-4" /></Link></div></section>
    </PublicLayout>
  );
}
