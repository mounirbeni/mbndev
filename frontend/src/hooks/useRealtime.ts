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
  on:          Partial<Record<RealtimeEvent, Handler>>;
  disabled?:   boolean;
}

// ─── Singleton SSE manager ────────────────────────────────────────────────────
// Opens exactly ONE EventSource per session. All useRealtime() callers register
// listeners here — no duplicate connections per page.

type Listeners = Map<string, Set<Handler>>;

let globalEs:      EventSource | null           = null;
let globalToken:   string | null                = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
let closedByUs       = false;
const listeners: Listeners = new Map();

function registerListener(event: string, handler: Handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
}

function unregisterListener(event: string, handler: Handler) {
  listeners.get(event)?.delete(handler);
}

const EVENTS: RealtimeEvent[] = [
  'ready', 'notification:new', 'message:new', 'project:updated', 'project:activity',
];

function openConnection(token: string) {
  if (globalEs) return; // already open
  closedByUs = false;

  const url = `/api/realtime/stream?token=${encodeURIComponent(token)}`;
  globalEs   = new EventSource(url);

  const dispatch = (eventName: RealtimeEvent) => (msg: MessageEvent) => {
    try {
      const data = JSON.parse(msg.data);
      listeners.get(eventName)?.forEach((h) => h(data));
    } catch { /* malformed payload */ }
  };

  EVENTS.forEach((ev) => globalEs!.addEventListener(ev, dispatch(ev)));

  globalEs.onopen  = () => { reconnectAttempt = 0; };
  globalEs.onerror = () => {
    if (closedByUs) return;
    globalEs?.close();
    globalEs = null;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30_000);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => openConnection(globalToken!), delay);
  };
}

function closeConnection() {
  closedByUs = true;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  globalEs?.close();
  globalEs    = null;
  globalToken = null;
  listeners.clear();
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time events from the global SSE stream.
 *
 * - Only ONE connection is opened per authenticated session, regardless of how
 *   many components call this hook simultaneously.
 * - Auto-reconnects with exponential back-off (max 30 s).
 * - Handlers are held in a ref — passing fresh closures never re-opens the stream.
 */
export function useRealtime({ on, disabled = false }: RealtimeOptions) {
  const { user, token } = useAuth();
  const handlersRef = useRef(on);

  // Keep ref up-to-date without triggering re-connection
  useEffect(() => { handlersRef.current = on; }, [on]);

  useEffect(() => {
    if (disabled || !user || !token) return;

    // Open (or reuse) the global connection
    globalToken = token;
    openConnection(token);

    // Register stable wrapper handlers that delegate to the live ref
    const registered: Array<[string, Handler]> = [];
    (Object.keys(handlersRef.current) as RealtimeEvent[]).forEach((ev) => {
      const wrapper: Handler = (data) => handlersRef.current[ev]?.(data);
      registerListener(ev, wrapper);
      registered.push([ev, wrapper]);
    });

    return () => {
      registered.forEach(([ev, wrapper]) => unregisterListener(ev, wrapper));
      // Only close the global connection when there are no more listeners
      const anyListeners = Array.from(listeners.values()).some((s) => s.size > 0);
      if (!anyListeners) closeConnection();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, disabled]);
}
