'use client';

import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticStyle, number[]> = {
  light:     [8],
  medium:    [18],
  heavy:     [35],
  selection: [5],
  success:   [10, 40, 10],
  warning:   [20, 30, 20],
  error:     [40, 20, 40, 20, 40],
};

export function useHaptic() {
  const trigger = useCallback((style: HapticStyle = 'light') => {
    if (typeof navigator === 'undefined') return;
    if (!('vibrate' in navigator)) return;
    try {
      navigator.vibrate(PATTERNS[style]);
    } catch {
      // Vibration blocked by browser policy — silently ignore
    }
  }, []);

  return trigger;
}
