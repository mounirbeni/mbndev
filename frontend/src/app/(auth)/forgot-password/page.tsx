'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, MessageCircle, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">MBN DEV</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-primary-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Contact us directly and we'll reset your account within a few hours.
          </p>

          <div className="space-y-3 mb-8">
            <a
              href="https://wa.me/212705914424?text=Hi%20Mounir,%20I%20need%20to%20reset%20my%20MBN%20DEV%20account%20password."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25"
            >
              <MessageCircle className="w-4 h-4" />
              Reset via WhatsApp
            </a>
            <a
              href="mailto:mounirbani46@gmail.com?subject=Password%20Reset%20Request&body=Hi%20Mounir,%20I%20need%20to%20reset%20my%20MBN%20DEV%20account%20password."
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all bg-primary-500/15 border border-primary-500/30 text-primary-400 hover:bg-primary-500/25"
            >
              <Mail className="w-4 h-4" />
              Reset via Email
            </a>
          </div>

          <p className="text-slate-600 text-xs mb-6">
            Average response time: under 4 hours
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
