'use strict';

/**
 * One place that decides which project files are accepted, shared by both
 * upload paths:
 *  - direct (browser → Vercel Blob, production): no size ceiling from our
 *    function, so real deliverables — zipped source code, videos — fit;
 *  - legacy multipart through the API (local dev without a Blob token):
 *    still capped by the serverless request body limit.
 *
 * SVG stays excluded: browsers execute JS inside SVG (stored XSS risk).
 */

const ALLOWED_EXTS = new Set([
  // images
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  // documents
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.pptx',
  // code deliverables / archives
  '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz',
  // video walkthroughs
  '.mp4', '.mov',
]);

/** Direct-to-Blob uploads: 500 MB per file. */
const MAX_DIRECT_BYTES = 500 * 1024 * 1024;

/**
 * Legacy path through the API. MUST stay under Vercel's ~4.5 MB request
 * body ceiling for functions — an oversized request is rejected by the
 * platform with a bare 413 before it reaches our error handler.
 */
const MAX_LEGACY_BYTES = 4 * 1024 * 1024;

function extOf(name) {
  const m = /\.[a-z0-9]+$/i.exec(String(name || ''));
  return m ? m[0].toLowerCase() : '';
}

function isAllowedName(name) {
  return ALLOWED_EXTS.has(extOf(name));
}

module.exports = { ALLOWED_EXTS, MAX_DIRECT_BYTES, MAX_LEGACY_BYTES, extOf, isAllowedName };
