'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Check, Globe, ShoppingCart, Settings, Rocket, Wrench } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';

type ServiceDetail = {
  icon: typeof Globe;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  requestType: string | null;
};

// Service possibilities, not an unconditional bundle. The accepted proposal
// establishes included functionality, pricing, delivery and ongoing support.
const services: Record<string, ServiceDetail> = {
  'custom-websites': {
    icon: Globe,
    title: 'Custom Websites',
    tagline: 'An online presence built around your brand.',
    description: 'We can design and develop a business website based on your audience, content, visual identity and functional requirements.',
    features: ['Responsive layouts', 'Brand-aligned design', 'Page and content planning', 'Search-friendly structure', 'Contact forms', 'Content management options', 'Hosting and domain guidance'],
    requestType: 'website',
  },
  ecommerce: {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    tagline: 'Your products and shopping experience, clearly presented.',
    description: 'Plan a storefront with a product catalogue, order management and checkout options appropriate to your market and chosen providers.',
    features: ['Product catalogue', 'Product search and filters', 'Cart and checkout design', 'Order management', 'Stock tracking options', 'Payment-provider assessment', 'Responsive shopping experience'],
    requestType: 'ecommerce',
  },
  'web-applications': {
    icon: Settings,
    title: 'Web Applications',
    tagline: 'Software tailored to the way your business works.',
    description: 'Custom portals, booking interfaces and internal tools designed around a documented set of user roles, workflows and integrations.',
    features: ['Requirements and architecture review', 'Account and role options', 'Business workflows', 'Database and API integration', 'Administration interfaces', 'Testing and handover planning'],
    requestType: 'custom',
  },
  'landing-pages': {
    icon: Rocket,
    title: 'Landing Pages',
    tagline: 'One clear page. One clear objective.',
    description: 'Focused campaign and product pages with a clear message, accessible calls to action and lead-collection options as needed.',
    features: ['Brand-aligned layout', 'Responsive sections', 'Call-to-action design', 'Lead form options', 'Analytics options', 'Publication and domain guidance'],
    requestType: 'website',
  },
  maintenance: {
    icon: Wrench,
    title: 'Maintenance & Support',
    tagline: 'Ongoing care with responsibilities defined in writing.',
    description: 'Discuss a support arrangement that identifies the systems covered, response windows, available hours and any costs for additional work.',
    features: ['Initial scope review', 'Dependency and security update options', 'Performance checks', 'Content changes by agreement', 'Backup responsibilities', 'A defined communication channel'],
    requestType: null,
  },
};

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const service = services[slug];
  if (!service) notFound();
  const Icon = service.icon;
  const requestHref = service.requestType ? `/request?service=${encodeURIComponent(service.requestType)}` : '/contact';

  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 sm:px-6 pt-32 pb-20">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-violet-600/[0.08] blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-slate-500 text-sm mb-12"><Link href="/" className="hover:text-white">Home</Link><ChevronRight className="w-4 h-4" aria-hidden="true" /><Link href="/services" className="hover:text-white">Services</Link><ChevronRight className="w-4 h-4" aria-hidden="true" /><span className="text-slate-300">{service.title}</span></nav>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/25 to-blue-500/10 border border-violet-500/25 flex items-center justify-center mb-7"><Icon className="w-8 h-8 text-violet-300" aria-hidden="true" /></div>
              <span className="section-label">MBN DEV / SERVICES</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mt-5 mb-4">{service.title}</h1>
              <p className="text-violet-300 text-lg font-semibold mb-5">{service.tagline}</p>
              <p className="text-slate-400 leading-relaxed mb-8 max-w-xl">{service.description}</p>
              <div className="flex flex-wrap gap-3"><Link href={requestHref} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-3.5">{service.requestType ? 'Start a project' : 'Discuss support'} <ArrowRight className="w-4 h-4" /></Link><Link href="/contact" className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white font-semibold rounded-xl px-6 py-3.5">Ask a question</Link></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }} className="glass rounded-3xl border border-violet-500/20 p-8 sm:p-10">
              <span className="text-xs text-violet-400 font-bold uppercase tracking-widest">Possible features</span>
              <h2 className="text-2xl font-black text-white mt-3 mb-4">Build the right scope.</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-7">We choose the features that fit your requirements. This list is illustrative, not a promise that every feature is included in a base package.</p>
              <ul className="space-y-4">{service.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />{feature}</li>)}</ul>
              <div className="border-t border-white/10 mt-8 pt-6 text-sm text-slate-400">Price, delivery window, revisions, ownership and support are confirmed in your written proposal.</div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="px-4 sm:px-6 pb-24"><div className="max-w-4xl mx-auto premium-surface-featured rounded-3xl text-center p-8 sm:p-12"><h2 className="text-white text-3xl font-black mb-4">Tell us what you need.</h2><p className="text-slate-400 max-w-xl mx-auto mb-7">Share your goals and requirements so we can propose an appropriate scope and transparent quote.</p><Link href={requestHref} className="inline-flex items-center gap-2 text-violet-300 hover:text-white font-semibold">{service.requestType ? 'Request a project' : 'Contact us'} <ArrowRight className="w-4 h-4" /></Link></div></section>
    </PublicLayout>
  );
}
