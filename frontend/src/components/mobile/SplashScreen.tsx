'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo3D from '@/components/ui/Logo3D';

/**
 * Shows a branded splash screen for ~1.5 s when the app is opened
 * as an installed PWA (display-mode: standalone / fullscreen).
 * On regular browser visits it never renders — zero impact on web UX.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show inside the installed PWA shell
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (!isStandalone) return;

    // Only show once per session
    if (sessionStorage.getItem('splash-shown')) return;
    sessionStorage.setItem('splash-shown', '1');

    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="app-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Logo */}
          <motion.div
            className="app-splash-logo flex flex-col items-center gap-3"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Logo3D size="xl" />
            <div className="text-center">
              <div className="text-white font-bold text-xl tracking-wide">MBN DEV</div>
              <div className="text-slate-600 text-xs mt-0.5">by Mounir Banni</div>
            </div>
          </motion.div>

          {/* Loading bar */}
          <div className="app-splash-bar">
            <div className="app-splash-bar-fill" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
