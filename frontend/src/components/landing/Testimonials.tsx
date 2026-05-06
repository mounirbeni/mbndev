'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Youssef A.',
    role: 'E-commerce Business',
    content: 'Great experience working with MBN DEV. Professional, fast, and very creative!',
    rating: 5,
    initials: 'YA',
    color: 'from-purple-500 to-violet-600',
  },
  {
    name: 'Salma R.',
    role: 'Startup Founder',
    content: 'MBN DEV built exactly what we needed. Communication was smooth and amazing.',
    rating: 5,
    initials: 'SR',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Karim Z.',
    role: 'CEO, Tech Company',
    content: 'Highly recommended! The quality of work is top-notch and the support is great.',
    rating: 5,
    initials: 'KZ',
    color: 'from-pink-500 to-rose-600',
  },
];

export default function Testimonials() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            What <span className="gradient-text">Clients</span> Say
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Real feedback from real clients. Their success is our mission.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-primary-500/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
