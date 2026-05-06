'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const projects = [
  {
    title: 'Ayoub Transport',
    type: 'Corporate Website',
    desc: 'Full corporate site with fleet management and booking system.',
    tag: 'blue',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    title: 'Dar Marrakech',
    type: 'Hotel Website',
    desc: 'Luxury riad booking platform with multilingual support.',
    tag: 'purple',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Morocco Shop',
    type: 'E-Commerce Store',
    desc: 'Full-stack e-commerce with inventory and Stripe payments.',
    tag: 'green',
    gradient: 'from-green-500/20 to-teal-500/20',
  },
  {
    title: 'Atlas Real Estate',
    type: 'Real Estate Platform',
    desc: 'Property listing platform with map integration and CRM.',
    tag: 'yellow',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    title: 'SaaS Analytics',
    type: 'SaaS Dashboard',
    desc: 'Real-time analytics dashboard with team management.',
    tag: 'purple',
    gradient: 'from-violet-500/20 to-blue-500/20',
  },
  {
    title: 'Resto Digital',
    type: 'Restaurant Website',
    desc: 'Online ordering system with table reservation and CMS.',
    tag: 'red',
    gradient: 'from-red-500/20 to-orange-500/20',
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
            Real projects delivered to real clients. Here&apos;s what we&apos;ve built recently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-primary-500/30 transition-all"
            >
              {/* Image placeholder */}
              <div className={`h-48 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-white/10 select-none">{p.title[0]}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100/80 to-transparent" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <Badge color={p.tag as any} className="mb-3">{p.type}</Badge>
                <h3 className="text-white font-semibold text-lg mb-1">{p.title}</h3>
                <p className="text-slate-400 text-sm">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
