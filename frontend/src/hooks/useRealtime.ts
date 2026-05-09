'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type RealtimeEvent =
  | 'notification:new'
  | 'message:new'
  | 'project:updated'
  | 'project:activity'
  | 'ready';

type Handler = (data: any) => void;

interface RealtimeOptions {
  /** Map of event-name → handler */
  on: Partial<Record<RealtimeEvent, Handler>>;
  /** Disable the connection conditionally (e.g. logged out). Default: false. */
  disabled?: boolean;
}

/**
 * Open a Server-Sent-Events stream to the backend and dispatch typed events.
 *
 * - Auto-reconnects on transport error with exponential backoff (max 30s).
 * - Cleans up cleanly on unmount.
 * - Reads token from localStorage so it survives page navigations.
 * - Handlers are held in a ref so passing fresh closures doesn't reopen
 *   the connection on every render.
 */
export function useRealtime({ on, disabled = false }: RealtimeOptions) {
  const { user, token } = useAuth();
  const handlersRef = useRef(on);

  useEffect(() => { handlersRef.current = on; }, [on]);

  useEffect(() => {
    if (disabled || !user || !token) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let closedByUs = false;

    const open = () => {
      // Token in URL — necessary because EventSource doesn't support headers.
      // The backend route is protected and the token is short-lived.
      const url = `/api/realtime/stream?token=${encodeURIComponent(token)}`;
      es = new EventSource(url);

      const dispatch = (eventName: RealtimeEvent) => (msg: MessageEvent) => {
        try {
          const data = JSON.parse(msg.data);
          handlersRef.current[eventName]?.(data);
        } catch {
          /* malformed payload — ignore */
        }
      };

      // Register specific event types we care about
      es.addEventListener('ready',             dispatch('ready'));
      es.addEventListener('notification:new',  dispatch('notification:new'));
      es.addEventListener('message:new',       dispatch('message:new'));
      es.addEventListener('project:updated',   dispatch('project:updated'));
      es.addEventListener('project:activity',  dispatch('project:activity'));

      es.onopen = () => {
        attempt = 0;
      };

      es.onerror = () => {
        if (closedByUs) return;
        // EventSource auto-reconnects, but during 401 / network failure we
        // need to back off ourselves to avoid hammering. Tear down + retry.
        es?.close();
        const delay = Math.min(1000 * Math.pow(2, attempt), 30_000);
        attempt += 1;
        reconnectTimer = setTimeout(open, delay);
      };
    };

    open();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [user?.id, token, disabled]);
}
