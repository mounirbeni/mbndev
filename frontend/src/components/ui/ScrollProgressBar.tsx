'use client';

import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: 'left',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #7c3aed, #a855f7, #818cf8)',
        boxShadow: '0 0 12px rgba(124,58,237,0.8), 0 0 24px rgba(168,85,247,0.4)',
      }}
    />
  );
}
