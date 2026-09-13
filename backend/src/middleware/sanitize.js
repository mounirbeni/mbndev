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

// Routes/fields that are deliberately exempt from blanket HTML-stripping —
// content genuinely meant to contain markup. This middleware runs globally,
// before routing, so exemptions are declared here rather than per-route.
// Exempted fields are NOT left unsanitized: the owning route is responsible
// for running them through a proper allow-list sanitizer (see
// routes/leads.js's use of sanitize-html) before using them — stripping
// *all* tags here would just break that route's actual feature.
const HTML_FIELD_EXEMPTIONS = [
  { method: 'POST', pathPattern: /^\/api\/leads\/[^/]+\/email$/, fields: ['body'] },
];

/**
 * Express middleware: sanitize req.body in place.
 */
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    const exemption = HTML_FIELD_EXEMPTIONS.find(
      (e) => e.method === req.method && e.pathPattern.test(req.path)
    );
    if (exemption) {
      const preserved = {};
      for (const field of exemption.fields) preserved[field] = req.body[field];
      req.body = sanitizeDeep(req.body);
      Object.assign(req.body, preserved);
    } else {
      req.body = sanitizeDeep(req.body);
    }
  }
  next();
}

module.exports = { sanitizeBody, stripHtml, sanitizeDeep };
