'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, MapPin, Phone, Zap } from 'lucide-react';

export default function CTA() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glass rounded-3xl p-12 border border-primary-500/20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-4 block">
                Ready to start?
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Have a project in mind?
              </h2>
              <p className="text-xl text-primary-300 mb-3">
                Let&apos;s build something amazing together.
              </p>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Fill out our smart project request form and get a custom proposal within 24 hours.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/request">
                  <Button size="lg" className="group">
                    Start Your Project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline">
                    WhatsApp Us
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Morocco — Available Worldwide
                </span>
                <a href="tel:+212705914424" className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +212 705 914 424
                </a>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Response within 24h
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
