'use client';

import { motion } from 'framer-motion';

const steps = [
  { num: '01', title: 'Discovery Call', desc: 'We discuss your vision, goals, and requirements in detail to craft the perfect plan.' },
  { num: '02', title: 'Proposal & Quote', desc: 'You receive a detailed proposal with scope, timeline, and transparent pricing.' },
  { num: '03', title: 'Design & Prototype', desc: 'We create wireframes and a visual prototype for your approval before coding starts.' },
  { num: '04', title: 'Development', desc: 'Our team builds your project with clean, scalable code and regular progress updates.' },
  { num: '05', title: 'Review & Revisions', desc: 'You test the product and request changes. We refine until everything is perfect.' },
  { num: '06', title: 'Launch & Support', desc: 'We deploy your project and remain available for ongoing support and maintenance.' },
];

export default function Process() {
  return (
    <section id="process" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            How It Works
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Our <span className="gradient-text">Process</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A proven 6-step process that delivers exceptional results, every time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 border border-white/5 transition-all"
            >
              <div className="absolute top-0 right-0 text-8xl font-bold text-white/3 leading-none select-none group-hover:text-primary-500/10 transition-colors">
                {step.num}
              </div>
              <div className="relative z-10">
                <div className="text-primary-400 font-mono text-sm font-bold mb-3">{step.num}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
