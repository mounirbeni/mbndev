// ─── Input sanitization middleware ────────────────────────────────────────────
// Strips HTML tags from all string values in req.body to prevent stored XSS.
// Runs after JSON parsing, before route handlers.

/**
 * Remove HTML tags and null bytes from a string.
 * Keeps the content but drops any markup.
 */
function stripHtml(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .replace(/\0/g, '');       // strip null bytes
}

/**
 * Recursively sanitize all string values in an object or array.
 */
function sanitizeDeep(data) {
  if (Array.isArray(data)) {
    return data.map(sanitizeDeep);
  }
  if (data !== null && typeof data === 'object') {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = sanitizeDeep(data[key]);
    }
    return result;
  }
  return stripHtml(data);
}

/**
 * Express middleware: sanitize req.body in place.
 */
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }
  next();
}

module.exports = { sanitizeBody, stripHtml, sanitizeDeep };
