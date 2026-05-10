'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Process() {
  const { t } = useLanguage();

  const steps = [
    { num: '01', title: t('process.s1.title'), desc: t('process.s1.desc') },
    { num: '02', title: t('process.s2.title'), desc: t('process.s2.desc') },
    { num: '03', title: t('process.s3.title'), desc: t('process.s3.desc') },
    { num: '04', title: t('process.s4.title'), desc: t('process.s4.desc') },
    { num: '05', title: t('process.s5.title'), desc: t('process.s5.desc') },
    { num: '06', title: t('process.s6.title'), desc: t('process.s6.desc') },
  ];

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
            {t('process.eyebrow')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('process.title')} <span className="gradient-text">{t('process.title.bold')}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {t('process.subtitle')}
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
