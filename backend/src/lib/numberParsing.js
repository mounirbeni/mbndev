'use strict';

/**
 * Parses an optional numeric field from a request body.
 *
 * Returns:
 *   - `null`      — the field was absent/falsy ("not provided", keep default)
 *   - `undefined` — the field was provided but isn't a finite number
 *                   ("invalid — the caller must reject the request")
 *
 * Number(undefined) and Number('') both silently evaluate to NaN, which
 * Postgres happily stores as a float — a bare `Number(value)` cast with no
 * validation lets a malformed request persist a NaN price/pages/etc. This
 * makes "not provided" and "invalid" distinguishable so callers can 400 on
 * the latter instead of writing NaN to the DB.
 */
function parseOptionalNumber(value) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

module.exports = { parseOptionalNumber };
