'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing to not interrupt first visit
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
    setShow(false);
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-6 lg:bottom-6 lg:w-80"
        >
          <div className="glass-strong rounded-2xl p-4 border border-primary-500/30 shadow-2xl shadow-black/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold">Install MBN DEV App</div>
                <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Add to your home screen for instant access to your projects.
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 text-xs text-slate-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-2 text-xs text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
