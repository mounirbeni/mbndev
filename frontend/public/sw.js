// ─── MBN DEV Service Worker ───────────────────────────────────────────────────
// Strategy:
//   /_next/static/*  → cache-first  (immutable hashed assets)
//   /api/*           → network-only (never cache; SSE streams must not be cloned)
//   navigate         → network-first with offline fallback
//   everything else  → stale-while-revalidate
//
// Safari-safe: every respondWith() code path returns a non-null Response.

const STATIC_CACHE  = 'mbndev-static-v2';
const PAGE_CACHE    = 'mbndev-pages-v2';
const CACHE_VERSION = 'v2';

// Pages to warm on install
const PRECACHE_URLS = ['/', '/login', '/services', '/pricing', '/offline'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Offline fallback response when nothing is cached. */
function offlineResponse(request) {
  if (request.mode === 'navigate') {
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><title>Offline — MBN DEV</title></head>' +
      '<body style="font-family:sans-serif;background:#08080b;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">' +
      '<div style="text-align:center"><h1 style="color:#7c3aed">MBN DEV</h1>' +
      '<p>You appear to be offline. Please check your connection.</p></div></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
  return new Response('Offline', {
    status:  503,
    headers: { 'Content-Type': 'text/plain' },
  });
}

/** True for responses that are safe to store in the Cache API. */
function isCacheable(response) {
  if (!response || !response.ok) return false;
  const ct = response.headers.get('Content-Type') || '';
  // Never cache SSE streams, chunked event streams, or opaque responses
  if (ct.includes('text/event-stream')) return false;
  if (response.type === 'opaque')       return false;
  return true;
}

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !validCaches.includes(k))
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Pass through non-GET and cross-origin requests — do NOT call respondWith()
  if (request.method !== 'GET') return;
  let url;
  try { url = new URL(request.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  // ── API requests — NETWORK ONLY (never cache; SSE must not be cloned) ──
  if (url.pathname.startsWith('/api/')) {
    // respondWith a plain passthrough so we keep control of the error path
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ success: false, message: 'Offline' }), {
          status:  503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // ── _next/static — CACHE FIRST (immutable hashed filenames) ──
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Navigation — NETWORK FIRST with offline fallback ──
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // ── Everything else — STALE WHILE REVALIDATE ──
  event.respondWith(staleWhileRevalidate(request, PAGE_CACHE));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()); // fire-and-forget
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineResponse(request);
  }
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone()); // fire-and-forget
    }
    return response;
  } catch {
    // Network failed — try the exact URL, then root '/'
    const cached =
      (await caches.match(request)) ||
      (await caches.match('/'));
    return cached || offlineResponse(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Kick off revalidation in the background regardless of cache state
    const revalidate = fetch(request)
      .then((response) => {
        if (isCacheable(response)) cache.put(request, response.clone());
        return response;
      })
      .catch(() => null); // background — errors are silent

    // Serve cached immediately if available; otherwise wait for network
    if (cached) return cached;
    const fresh = await revalidate;
    return fresh || offlineResponse(request);
  } catch {
    return offlineResponse(request);
  }
}

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'MBN DEV', {
        body:    data.body  || 'You have a new update.',
        icon:    '/icons/icon-192x192.png',
        badge:   '/icons/icon-72x72.png',
        tag:     data.tag   || 'mbndev',
        data:    { url: data.url || '/' },
        actions: [
          { action: 'open',    title: 'View' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      })
    );
  } catch {
    // Malformed push payload — ignore
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
