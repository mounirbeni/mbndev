'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Star } from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show,      setShow]      = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t }   = useLanguage();
  const haptic  = useHaptic();

  useEffect(() => {
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    haptic('medium');
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') haptic('success');
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    haptic('light');
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
    setShow(false);
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120,  opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          /*
            On mobile: sit above the BottomNav (≈ 72 px from bottom).
            On desktop (lg+): sit at bottom-right like before.
          */
          className="fixed left-3 right-3 z-[9970] lg:left-auto lg:right-5 lg:w-80"
          style={{
            bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 72px)',
          }}
        >
          <div
            className="rounded-3xl p-4"
            style={{
              background:           'rgba(16, 16, 20, 0.98)',
              backdropFilter:       'blur(32px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
              border:               '1px solid rgba(124,58,237,0.28)',
              boxShadow:            '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.12)',
            }}
          >
            <div className="flex items-start gap-3">
              {/* App icon */}
              <Logo3D size="lg" />

              <div className="flex-1 min-w-0">
                <div className="text-white text-[15px] font-bold leading-tight">{t('install.title')}</div>
                {/* Star rating */}
                <div className="flex items-center gap-0.5 mt-0.5 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-slate-500 text-[10px] ml-1">Free</span>
                </div>
                <div className="text-slate-400 text-xs leading-snug">
                  {t('install.subtitle')}
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-slate-600 hover:text-slate-400 transition-colors shrink-0 p-1 -mt-0.5 -mr-0.5 touch-target"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 text-xs font-medium text-slate-400 rounded-xl transition-colors active:bg-white/6"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {t('install.later')}
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 transition-all press-scale"
                style={{
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  boxShadow:  '0 4px 16px rgba(124,58,237,0.35)',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                {t('install.install')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
