'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Zap, Code2, Database, Globe, Server, Layers,
  GitBranch, Terminal, Star, Users, FolderOpen, Clock
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

const skills = [
  { name: 'React / Next.js', level: 98, color: 'bg-blue-500' },
  { name: 'Node.js / Express', level: 95, color: 'bg-green-500' },
  { name: 'TypeScript', level: 92, color: 'bg-blue-400' },
  { name: 'PostgreSQL / Prisma', level: 88, color: 'bg-indigo-500' },
  { name: 'MongoDB', level: 85, color: 'bg-emerald-500' },
  { name: 'UI/UX Design', level: 82, color: 'bg-purple-500' },
];

const technologies = [
  { icon: Code2, label: 'Next.js 14' },
  { icon: Layers, label: 'React' },
  { icon: Terminal, label: 'Node.js' },
  { icon: Database, label: 'PostgreSQL' },
  { icon: Server, label: 'Express.js' },
  { icon: GitBranch, label: 'Prisma ORM' },
  { icon: Globe, label: 'Tailwind CSS' },
  { icon: Zap, label: 'TypeScript' },
];

const stats = [
  { icon: Clock, value: '5+', label: 'Years of Experience' },
  { icon: FolderOpen, value: '40+', label: 'Projects Delivered' },
  { icon: Users, value: '30+', label: 'Happy Clients' },
  { icon: Star, value: '100%', label: 'Client Satisfaction' },
];

const timeline = [
  { year: '2019', title: 'Started coding journey', desc: 'Self-taught HTML, CSS, JavaScript through online courses and building projects.' },
  { year: '2020', title: 'First freelance project', desc: 'Delivered first paid website for a local business. Fell in love with the process.' },
  { year: '2021', title: 'Full Stack mastery', desc: 'Mastered React, Node.js, and databases. Built first SaaS application.' },
  { year: '2022', title: 'Launched MBN DEV', desc: 'Founded MBN DEV to bring premium web development to Moroccan businesses.' },
  { year: '2023', title: 'Scaling the platform', desc: 'Grew to 30+ clients. Expanded services to SaaS dashboards and e-commerce.' },
  { year: '2024', title: 'Going global', desc: 'Built client portal platform. Serving clients across Morocco and beyond.' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-8">
              <Zap className="w-3 h-3 text-primary-400" /> The Developer Behind MBN DEV
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Hi, I'm <span className="gradient-text">Mounir Banni</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Full Stack Developer & founder of MBN DEV. I build premium web products that help businesses grow, scale, and succeed in the digital age.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 text-center border border-white/5"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-slate-500 text-sm">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {[
            {
              label: 'My Vision',
              title: 'A digital future for every Moroccan business',
              desc: 'I believe every business — from the artisan in Fes to the startup in Casablanca — deserves a world-class digital presence. Technology should not be a privilege. It should be accessible, powerful, and beautifully built.',
              color: 'border-primary-500/30',
              gradient: 'from-primary-500/10',
            },
            {
              label: 'My Mission',
              title: 'Build software that matters, ship products that work',
              desc: 'MBN DEV is my vehicle to deliver premium software without the agency overhead. Clean code, honest communication, and results-driven development. Every project I take on, I treat as if it\'s my own company.',
              color: 'border-blue-500/30',
              gradient: 'from-blue-500/10',
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`glass rounded-2xl p-8 border ${item.color} bg-gradient-to-br ${item.gradient} to-transparent`}
            >
              <span className="text-xs text-primary-400 font-semibold uppercase tracking-widest mb-3 block">{item.label}</span>
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs text-primary-400 font-semibold uppercase tracking-widest mb-3 block">Skills</span>
              <h2 className="text-3xl font-bold text-white mb-4">Engineered for the modern web</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                5+ years of building production applications has sharpened my technical toolkit. I work across the full stack — from pixel-perfect UI to scalable backend systems.
              </p>
              <div className="space-y-4">
                {skills.map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{s.name}</span>
                      <span className="text-slate-500">{s.level}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.07 + 0.3 }}
                        className={`h-full ${s.color} rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Technologies */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs text-primary-400 font-semibold uppercase tracking-widest mb-3 block">Technologies</span>
              <h2 className="text-3xl font-bold text-white mb-8">My daily stack</h2>
              <div className="grid grid-cols-4 gap-3">
                {technologies.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <motion.div
                      key={t.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="glass rounded-xl p-3 text-center border border-white/5 hover:border-primary-500/30 transition-colors group"
                    >
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary-400 mx-auto mb-2 transition-colors" />
                      <div className="text-slate-500 text-[10px] font-medium">{t.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-primary-400 font-semibold uppercase tracking-widest mb-3 block">Journey</span>
            <h2 className="text-3xl font-bold text-white">From Zero to Platform</h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-6"
                >
                  <div className="w-12 text-right shrink-0">
                    <span className="text-primary-400 text-sm font-bold">{item.year}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-dark-300" />
                  </div>
                  <div className="glass rounded-xl p-4 border border-white/5 flex-1 -ml-2">
                    <div className="text-white font-semibold text-sm mb-1">{item.title}</div>
                    <div className="text-slate-400 text-sm">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-primary-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Let's work together</h2>
            <p className="text-slate-400 mb-8 relative z-10">Have a project in mind? I'd love to hear about it.</p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link href="/request">
                <Button size="lg" className="group">
                  Start a Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">Get in Touch</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
