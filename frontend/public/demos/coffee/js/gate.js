// Talks to the owner-managed demo switch (MBN DEV dashboard → Demo sites).
// The demo pages are static, so the PIN check and the on/off state live behind /api/demos/coffee.
const API = '/api/demos/coffee';

/** { ok:true, live, state, pinHint } — or { ok:false } when the server cannot be reached. */
export async function fetchConfig() {
  try {
    const r = await fetch(`${API}/config`, { cache: 'no-store' });
    if (!r.ok) return { ok: false };
    const c = await r.json();
    return { ok: true, live: c.live !== false, state: c.state || 'live', pinHint: c.pinHint || null };
  } catch { return { ok: false }; }
}

/** 'ok' | 'bad' | 'limited' | 'unavailable' | 'offline' */
export async function verifyPin(pin) {
  try {
    const r = await fetch(`${API}/unlock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
    if (r.ok) return 'ok';
    if (r.status === 401) return 'bad';
    if (r.status === 429) return 'limited';
    if (r.status === 403) return 'unavailable';
    return 'offline';
  } catch { return 'offline'; }
}
