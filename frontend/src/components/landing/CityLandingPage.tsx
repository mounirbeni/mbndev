'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, ChevronRight, MessageSquare, Check, ExternalLink,
  Globe, ShoppingCart, Settings, Rocket, Wrench, TrendingDown,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

export interface CityProof {
  title: string;
  url: string;
  description: string;
}

export interface CityFaq {
  q: string;
  a: string;
}

export interface CityPageData {
  city: string;
  heroKicker: string;
  h1: string;
  intro: string[];
  whyPoints: { title: string; desc: string }[];
  serviceBlurbs: { slug: string; note: string }[];
  proof: CityProof[];
  faqs: CityFaq[];
}

const SERVICE_META: Record<string, { icon: typeof Globe; title: string; price: string }> = {
  'custom-websites':  { icon: Globe,       title: 'Custom Websites',    price: 'From $799'  },
  'ecommerce':        { icon: ShoppingCart, title: 'E-Commerce Stores',  price: 'From $1,499' },
  'web-applications': { icon: Settings,    title: 'Web Applications',   price: 'From $1,999' },
  'landing-pages':    { icon: Rocket,      title: 'Landing Pages',      price: 'From $499'  },
  'maintenance':      { icon: Wrench,      title: 'Maintenance & Support', price: 'From $149/mo' },
};

export default function CityLandingPage({ data }: { data: CityPageData }) {
  const { city, heroKicker, h1, intro, whyPoints, serviceBlurbs, proof, faqs } = data;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">{city}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              {heroKicker}
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {h1}
            </h1>
            {intro.map((p, i) => (
              <p key={i} className="text-slate-400 leading-relaxed mb-4 max-w-2xl">{p}</p>
            ))}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/request">
                <Button size="lg" className="group">
                  Start a Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  <MessageSquare className="w-4 h-4" /> Talk to Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why this city */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-10 text-center"
          >
            Why {city} Businesses Choose MBN DEV
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {whyPoints.map((pt, i) => (
              <motion.div
                key={pt.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 border border-white/5"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" /> {pt.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{pt.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-3 text-center"
          >
            Services for {city} Businesses
          </motion.h2>
          <p className="text-slate-400 text-center mb-10 max-w-xl mx-auto">
            Every project is remote-friendly — we work with clients across Morocco the same way we work worldwide.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {serviceBlurbs.map((sb, i) => {
              const meta = SERVICE_META[sb.slug];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={sb.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link href={`/services/${sb.slug}`} className="block h-full">
                    <div className="glass rounded-2xl p-6 border border-white/5 hover:border-primary-500/30 transition-colors h-full group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-400" />
                        </div>
                        <span className="text-slate-500 text-xs font-medium">{meta.price}</span>
                      </div>
                      <h3 className="text-white font-semibold mb-1.5">{meta.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-3">{sb.note}</p>
                      <span className="flex items-center gap-1.5 text-primary-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Proof of work */}
      {proof.length > 0 && (
        <section className="py-16 px-4 sm:px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-10 text-center"
            >
              Related Work in Morocco
            </motion.h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {proof.map((p, i) => (
                <motion.a
                  key={p.title}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-6 border border-white/5 hover:border-primary-500/30 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{p.title}</h3>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.description}</p>
                </motion.a>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/portfolio" className="text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors">
                See our full portfolio →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing & process */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 border border-white/5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-5">
              <TrendingDown className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Fixed, transparent pricing — no hidden fees</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">How Much Does a Website Cost in {city}?</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Pricing depends on the type of site and the features you need — a simple business
              website starts at $799, an online store at $1,499, and a custom web application
              at $1,999. Every quote is fixed before we start, based on a short discovery call.
              We work in four stages: discovery, design, development, and launch — with your
              review at every step.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/pricing">
                <Button size="lg" variant="outline">See Full Pricing</Button>
              </Link>
              <Link href="/request">
                <Button size="lg" className="group">
                  Get a Free Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-10 text-center"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-xl p-6 border border-white/5"
              >
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 sm:p-14 text-center border border-primary-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to Build Your {city} Website?
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Tell us about your project and get a free, no-obligation quote within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/request">
                  <Button size="lg" className="group">
                    Start Your Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    <MessageSquare className="w-4 h-4" /> Contact Us First
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
