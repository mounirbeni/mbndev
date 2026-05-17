'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Extra bottom padding above safe area — e.g. when BottomNav is visible */
  extraBottom?: number;
  /** Max height in vh units (default: 85) */
  maxHeightVh?: number;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  extraBottom = 0,
  maxHeightVh = 85,
}: BottomSheetProps) {
  const haptic = useHaptic();
  const startY  = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Haptic on open */
  useEffect(() => {
    if (open) haptic('selection');
  }, [open, haptic]);

  /* Drag-to-dismiss */
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (delta > 80) {
      haptic('light');
      onClose();
    }
    startY.current = null;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="sheet-panel"
            ref={panelRef}
            className="sheet-panel"
            style={{ maxHeight: `${maxHeightVh}dvh`, paddingBottom: `calc(max(env(safe-area-inset-bottom, 0px), 12px) + ${extraBottom}px)` }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340, mass: 0.85 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Drag handle */}
            <div className="sheet-handle" />

            {/* Title */}
            {title && (
              <div className="px-5 pb-3 pt-1">
                <h2 className="text-white font-semibold text-base text-center">{title}</h2>
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto inertial-scroll">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
