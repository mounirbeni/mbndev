'use client';

import { motion } from 'framer-motion';
import { Globe, ShoppingCart, BarChart3, Layout, Smartphone, Settings } from 'lucide-react';

const services = [
  {
    icon: Globe,
    title: 'Custom Websites',
    desc: 'Stunning, high-performance websites tailored to your brand identity and business goals.',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading'],
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    desc: 'Full-featured online stores with seamless payment integration and inventory management.',
    features: ['Payment Gateway', 'Product Management', 'Order Tracking'],
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: BarChart3,
    title: 'SaaS Dashboards',
    desc: 'Complex web applications with real-time data, advanced analytics, and user management.',
    features: ['Real-time Data', 'User Auth', 'Analytics'],
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Layout,
    title: 'Landing Pages',
    desc: 'Conversion-optimized landing pages that turn visitors into paying customers.',
    features: ['A/B Testing Ready', 'Lead Capture', 'CRO Focused'],
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Smartphone,
    title: 'Web Applications',
    desc: 'Powerful web apps with rich interactivity, offline support, and mobile-first UX.',
    features: ['PWA Support', 'Offline Mode', 'Push Notifications'],
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: Settings,
    title: 'Maintenance & Support',
    desc: 'Ongoing technical support, performance monitoring, and feature updates post-launch.',
    features: ['24/7 Monitoring', 'Bug Fixes', 'Feature Updates'],
    color: 'from-teal-500 to-cyan-600',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            What We Build
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            From concept to deployment — we handle everything so you can focus on growing your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 group cursor-pointer border border-white/5 hover:border-primary-500/30 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
