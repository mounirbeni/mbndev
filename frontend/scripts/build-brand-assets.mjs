import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// The approved icon is stored as base64 text for compatibility with the GitHub file connector.
// Materialize a real, static transparent WebP before starting Next.js or building for production.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const encoded = readFileSync(resolve(root, 'public/brand-icon-transparent.webp.b64'), 'utf8').trim();
const icon = Buffer.from(encoded, 'base64');
if (icon.subarray(0, 4).toString('ascii') !== 'RIFF' || icon.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('Invalid transparent brand icon.');
}
writeFileSync(resolve(root, 'public/brand-icon-transparent.webp'), icon);
console.log(`Prepared transparent MBN DEV brand icon (${icon.byteLength} bytes).`);
