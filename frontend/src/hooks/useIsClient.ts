import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false during server rendering and hydration, true afterwards — for code
 * that needs `document`/`window` (e.g. portals). Replaces the
 * `useState(false)` + `useEffect(() => setMounted(true))` pattern without the
 * extra render that a setState inside an effect causes.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
