'use client';

import { useEffect, useRef } from 'react';

interface PollingOptions {
  /** Polling interval in milliseconds. */
  interval: number;
  /** Pause polling when the browser tab is hidden. Default: true. */
  pauseWhenHidden?: boolean;
  /** Run the callback immediately on mount before scheduling. Default: true. */
  immediate?: boolean;
  /** Stop polling entirely. Useful for conditionally enabling. Default: false. */
  disabled?: boolean;
}

/**
 * Run an async callback on a recurring interval, with sensible defaults:
 * - Pauses when the tab is hidden (avoids hammering the API in background tabs)
 * - Resumes immediately when the tab returns to foreground
 * - Cancels cleanly on unmount
 * - Won't queue overlapping calls if the previous one is still in-flight
 *
 * The callback is held in a ref so changing it between renders doesn't
 * restart the interval — only `interval`, `disabled`, and `pauseWhenHidden`
 * trigger a reset.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  { interval, pauseWhenHidden = true, immediate = true, disabled = false }: PollingOptions,
) {
  const cbRef       = useRef(callback);
  const inFlightRef = useRef(false);

  // Always invoke the latest callback without restarting the interval
  useEffect(() => { cbRef.current = callback; }, [callback]);

  useEffect(() => {
    if (disabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await cbRef.current();
      } finally {
        inFlightRef.current = false;
      }
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(tick, interval);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (!pauseWhenHidden) return;
      if (document.visibilityState === 'visible') {
        tick(); // catch up immediately on return
        start();
      } else {
        stop();
      }
    };

    if (immediate) tick();
    if (!pauseWhenHidden || document.visibilityState === 'visible') start();

    if (pauseWhenHidden) {
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      stop();
      if (pauseWhenHidden) {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [interval, pauseWhenHidden, immediate, disabled]);
}
