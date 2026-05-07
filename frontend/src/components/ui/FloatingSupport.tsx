'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Phone, Mail } from 'lucide-react';

const WA_URL   = 'https://wa.me/212705914424';
const TEL      = 'tel:+212705914424';
const MAILTO   = 'mailto:hello@mbndev.com';

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-5 z-[9999] flex flex-col items-end gap-3">
      {/* Action cards */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-2 mb-1"
          >
            {/* WhatsApp */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold shadow-lg shadow-black/30 hover:brightness-110 transition-all"
            >
              {/* WhatsApp SVG */}
              <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.129.558 4.126 1.535 5.856L.057 23.428a.5.5 0 0 0 .515.572l5.7-1.494A11.948 11.948 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 0 1-4.989-1.364l-.357-.212-3.706.972.988-3.604-.233-.37A9.793 9.793 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
              </svg>
              Chat on WhatsApp
            </a>

            {/* Phone */}
            <a
              href={TEL}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm font-semibold shadow-lg shadow-black/30 hover:bg-white/10 transition-all"
            >
              <Phone className="w-4 h-4 shrink-0 text-primary-400" />
              +212 705 914 424
            </a>

            {/* Email */}
            <a
              href={MAILTO}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm font-semibold shadow-lg shadow-black/30 hover:bg-white/10 transition-all"
            >
              <Mail className="w-4 h-4 shrink-0 text-blue-400" />
              hello@mbndev.com
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full shadow-xl shadow-black/40 flex items-center justify-center text-white relative"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
        aria-label="Contact support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary-500" />
        )}
      </motion.button>
    </div>
  );
}
