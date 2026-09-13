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

// Credential fields must reach bcrypt exactly as the user typed them.
// Stripping "<...>"-shaped substrings out of a password before hashing (and
// again, identically, before comparing) doesn't break login — the same
// transform runs both times — but it silently narrows the effective
// password character space, which is exactly the kind of thing a password
// field must never do to what a user typed.
const SENSITIVE_KEYS = new Set(['password', 'newPassword', 'currentPassword']);

/**
 * Recursively sanitize all string values in an object or array. `key` is the
 * property name this value was found under, if any — used to skip
 * SENSITIVE_KEYS regardless of nesting depth.
 */
function sanitizeDeep(data, key) {
  if (key && SENSITIVE_KEYS.has(key)) return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDeep(item));
  }
  if (data !== null && typeof data === 'object') {
    const result = {};
    for (const k of Object.keys(data)) {
      result[k] = sanitizeDeep(data[k], k);
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
