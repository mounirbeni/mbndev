'use client';

import { LazyMotion } from 'framer-motion';

const loadFeatures = () => import('@/lib/motionFeatures').then((mod) => mod.default);

/**
 * Components import `m as motion` (the lightweight motion component); the
 * animation engine itself is fetched after hydration instead of shipping in
 * every page's initial JavaScript.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
