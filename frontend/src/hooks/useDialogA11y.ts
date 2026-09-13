'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Baseline keyboard/focus behavior for a custom modal/dialog/sheet:
 *  - Escape closes it.
 *  - Focus moves into the dialog when it opens.
 *  - Tab/Shift+Tab cycle within the dialog instead of escaping to the page
 *    behind it (a focus trap).
 *  - Focus returns to whatever triggered the dialog when it closes.
 *
 * Pairs with role="dialog" aria-modal="true" on the container — this hook
 * only handles behavior, not the ARIA attributes themselves (add those
 * directly in the component, since the accessible name varies per dialog).
 */
export function useDialogA11y(open: boolean, onClose: () => void, containerRef: RefObject<HTMLElement | null>) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog on the next frame (after it has painted).
    const focusTimer = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? container).focus({ preventScroll: true });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null); // visible only
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to whatever opened the dialog, if it's still around.
      triggerRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, containerRef]);
}
