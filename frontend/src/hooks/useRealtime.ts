'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RealtimeEvent =
  | 'notification:new'
  | 'message:new'
  | 'project:updated'
  | 'project:activity'
  | 'ready';

type Handler = (data: any) => void;

interface RealtimeOptions {
  on:        Partial<Record<RealtimeEvent, Handler>>;
  disabled?: boolean;
}

// ─── Singleton SSE manager ────────────────────────────────────────────────────
// Exactly ONE EventSource per authenticated session, shared across all
// useRealtime() callers. Components register/unregister individual handlers
// without affecting the connection or other components' listeners.
//
// Hard fixes over the previous version:
//   1. listeners.clear() was removed from closeConnection() — it was destroying
//      other components' listeners. Now each caller owns its own cleanup.
//   2. Module-level state now uses a namespace object instead of top-level vars,
//      making it easier to reset cleanly in tests or on hard logout.
//   3. Visibility-aware reconnect: when the tab returns from hidden, we actively
//      verify the connection is still live (rather than hoping it recovered).
//   4. Jitter added to reconnect backoff to prevent thundering herds when many
//      tabs reconnect simultaneously after a server restart.
//   5. Token change detection: if the user logs out and back in (new token),
//      we close the old connection and open a fresh one.

const EVENTS: RealtimeEvent[] = [
  'ready',
  'notification:new',
  'message:new',
  'project:updated',
  'project:activity',
];

// Registry: eventName → Set<Handler>
type ListenerMap = Map<string, Set<Handler>>;

// ── Singleton state ───────────────────────────────────────────────────────────
interface SseState {
  es:               EventSource | null;
  token:            string | null;
  reconnectTimer:   ReturnType<typeof setTimeout> | null;
  reconnectAttempt: number;
  closedByUs:       boolean;
  listeners:        ListenerMap;
}

const state: SseState = {
  es:               null,
  token:            null,
  reconnectTimer:   null,
  reconnectAttempt: 0,
  closedByUs:       false,
  listeners:        new Map(),
};

// ── Listener helpers ──────────────────────────────────────────────────────────

function addListener(event: string, handler: Handler) {
  if (!state.listeners.has(event)) state.listeners.set(event, new Set());
  state.listeners.get(event)!.add(handler);
}

function removeListener(event: string, handler: Handler) {
  state.listeners.get(event)?.delete(handler);
  // Clean up empty sets
  if (state.listeners.get(event)?.size === 0) state.listeners.delete(event);
}

function hasAnyListeners(): boolean {
  return Array.from(state.listeners.values()).some((s) => s.size > 0);
}

// ── Connection ────────────────────────────────────────────────────────────────

function scheduleReconnect(token: string) {
  if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
  // Exponential backoff with ±20% jitter — max 30 s
  const base  = Math.min(1000 * Math.pow(2, state.reconnectAttempt), 30_000);
  const jitter = base * 0.2 * (Math.random() * 2 - 1); // ±20%
  const delay  = Math.max(500, Math.round(base + jitter));
  state.reconnectAttempt += 1;
  state.reconnectTimer = setTimeout(() => openConnection(token), delay);
}

function openConnection(token: string) {
  if (state.es) return; // already open — do not open a second one
  state.closedByUs = false;

  const url = `/api/realtime/stream?token=${encodeURIComponent(token)}`;
  const es   = new EventSource(url);
  state.es   = es;

  const dispatch = (eventName: RealtimeEvent) => (msg: MessageEvent) => {
    try {
      const data = JSON.parse(msg.data);
      state.listeners.get(eventName)?.forEach((h) => {
        try { h(data); } catch (e) { console.error('[realtime] handler error:', e); }
      });
    } catch {
      // Malformed SSE payload — ignore
    }
  };

  EVENTS.forEach((ev) => es.addEventListener(ev, dispatch(ev)));

  es.onopen = () => {
    state.reconnectAttempt = 0;
  };

  es.onerror = () => {
    if (state.closedByUs) return;
    es.close();
    state.es = null;
    scheduleReconnect(state.token!);
  };
}

function closeConnection() {
  state.closedByUs = true;
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }
  state.es?.close();
  state.es    = null;
  state.token = null;
  state.reconnectAttempt = 0;
  // NOTE: We deliberately do NOT clear state.listeners here.
  // Each component is responsible for removing its own listeners on unmount.
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time events from the global SSE stream.
 *
 * - Only ONE connection is opened per authenticated session.
 * - Auto-reconnects with exponential back-off + jitter (max 30 s).
 * - Reconnects when the page tab returns from hidden state.
 * - Cleans up on unmount without affecting other components' listeners.
 * - Handlers are kept in a ref — fresh closures don't re-open the stream.
 */
export function useRealtime({ on, disabled = false }: RealtimeOptions) {
  const { user, token } = useAuth();
  const handlersRef     = useRef(on);
  // Stable wrappers that delegate to the live ref
  const wrappersRef = useRef<Array<[string, Handler]>>([]);

  // Keep ref fresh without re-running the connection effect
  useEffect(() => { handlersRef.current = on; }, [on]);

  // ── Reconnect on visibility regain ───────────────────────────────────────
  // If the browser tab was hidden for a long time, the SSE connection may have
  // silently died. On return, close any zombie and reopen.
  const reconnectOnVisible = useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    if (disabled || !user || !token) return;
    if (!state.es || state.es.readyState === EventSource.CLOSED) {
      state.es = null;
      openConnection(token);
    }
  }, [disabled, user, token]);

  // ── Main connection effect ────────────────────────────────────────────────
  useEffect(() => {
    if (disabled || !user || !token) return;

    // If the token changed (logout → login), reset the connection
    if (state.token && state.token !== token) {
      closeConnection();
    }

    state.token = token;
    openConnection(token);

    // Register stable wrapper handlers
    const registered: Array<[string, Handler]> = [];
    (Object.keys(handlersRef.current) as RealtimeEvent[]).forEach((ev) => {
      const wrapper: Handler = (data) => handlersRef.current[ev]?.(data);
      addListener(ev, wrapper);
      registered.push([ev, wrapper]);
    });
    wrappersRef.current = registered;

    // Visibility reconnect
    document.addEventListener('visibilitychange', reconnectOnVisible);

    return () => {
      // Remove only THIS component's listeners
      registered.forEach(([ev, wrapper]) => removeListener(ev, wrapper));
      wrappersRef.current = [];
      document.removeEventListener('visibilitychange', reconnectOnVisible);

      // Only close the global connection when no listeners remain
      if (!hasAnyListeners()) {
        closeConnection();
      }
    };
  // token change drives reconnect; user.id identifies the session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, disabled]);
}
