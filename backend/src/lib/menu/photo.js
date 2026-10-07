// Dish / logo / cover photos. The browser resizes them before upload, so they
// are small enough to keep in Postgres and serve with long public caching.

const MAX_PHOTO_BYTES = 180 * 1024;

const SIGNATURES = [
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png',  test: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', test: (b) => b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP' },
];

/** "data:image/webp;base64,…" → { mime, buffer } (type taken from the bytes, not the label). */
function decodePhoto(dataUrl) {
  const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return { error: 'Upload a JPG, PNG or WebP image.' };
  const buffer = Buffer.from(m[1], 'base64');
  if (!buffer.length) return { error: 'That image is empty.' };
  if (buffer.length > MAX_PHOTO_BYTES) return { error: 'That image is too large — try a smaller photo.' };
  const sig = SIGNATURES.find((s) => s.test(buffer));
  if (!sig) return { error: 'That file is not a JPG, PNG or WebP image.' };
  return { mime: sig.mime, buffer };
}

module.exports = { decodePhoto, MAX_PHOTO_BYTES };
