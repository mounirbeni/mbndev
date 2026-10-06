// Website audit for a prospect: fetches the homepage (and the contact page
// when no email is found) and reads the signals a web agency sells on.
//
// URLs come from buyers, so every hop is checked: http(s) only, default
// ports only, and the host must resolve to a public address (no SSRF into
// private networks or cloud metadata).
const dns = require('dns').promises;
const net = require('net');

const UA = 'Mozilla/5.0 (compatible; MBNLeadsAI/1.0; +https://mbndev.ma/products/leads-ai)';
const MAX_BYTES = 1_500_000;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7));
  return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

async function assertPublicUrl(raw, lookup = dns.lookup) {
  const u = new URL(raw);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http(s) URLs');
  if (u.port && u.port !== '80' && u.port !== '443') throw new Error('Non-standard port');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('Host is not public');
  return u;
}

/** GET with manual, re-validated redirects and a size cap. */
async function safeFetch(url, { timeout = 8000, fetchImpl = fetch, lookup } = {}) {
  let current = url;
  const started = Date.now();
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicUrl(current, lookup);
    const res = await fetchImpl(current, {
      redirect: 'manual',
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(timeout),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      await res.body?.cancel();
      current = new URL(res.headers.get('location'), current).href;
      continue;
    }
    let html = '';
    let bytes = 0;
    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        html += decoder.decode(value, { stream: true });
        if (bytes >= MAX_BYTES) { await reader.cancel(); break; }
      }
    }
    return { status: res.status, finalUrl: current, html, bytes, ms: Date.now() - started };
  }
  throw new Error('Too many redirects');
}

const BOOKING_ENGINES = /(cloudbeds|sirvoy|beds24|mews\.com|siteminder|littlehotelier|synxis|hotelrunner|webrezpro|reservit|guestcentric|calendly|opentable|resy\.com|thefork|fresha|booksy|setmore|simplybook|acuityscheduling|square\.site\/book|zenchef|sevenrooms|doctolib|zocdoc)/i;
const OTA_LINKS = /(booking\.com|airbnb\.|expedia\.|hotels\.com|agoda\.com|tripadvisor\.)/i;
const BOOKING_WORDS = /(book now|book online|book a table|book an appointment|reserve now|make a reservation|réserver|reservar|prenota|jetzt buchen|check availability)/i;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}/gi;

function textOf(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
}

function findEmails(html) {
  const found = new Set();
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) found.add(decodeURIComponent(m[1]).toLowerCase());
  for (const m of textOf(html).matchAll(EMAIL_RE)) found.add(m[0].toLowerCase());
  return [...found].filter((e) => !/\.(png|jpe?g|gif|webp|svg)$/i.test(e) && !/(example\.|sentry|wixpress|domain\.com)/i.test(e)).slice(0, 5);
}

/** Reads the signals from a homepage's HTML. Pure — unit-tested on its own. */
function analyzeHtml(html, { finalUrl, now = new Date() } = {}) {
  const lower = html.toLowerCase();
  const text = textOf(html);
  const year = now.getFullYear();

  const copyMatches = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–—]\s*)?((?:19|20)\d{2})/gi)].map((m) => Number(m[1]));
  const copyrightYear = copyMatches.length ? Math.max(...copyMatches) : null;

  const outdated = [];
  const jq = html.match(/jquery[.-]?(1\.\d+(?:\.\d+)?)(?:\.min)?\.js/i);
  if (jq) outdated.push(`jQuery ${jq[1]}`);
  if (/<font[\s>]/i.test(html)) outdated.push('<font> tags');
  if (/<marquee|<frameset|\.swf["'?]/i.test(html)) outdated.push('Flash / frames / marquee');
  if ((lower.match(/<table/g) || []).length >= 6 && !/<(main|section|article|nav)[\s>]/i.test(html)) outdated.push('Table-based layout');
  if (copyrightYear && copyrightYear <= year - 3) outdated.push(`Copyright ${copyrightYear}`);

  const links = [...html.matchAll(/href=["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const bookingProviders = [...new Set(links.map((l) => (l.match(BOOKING_ENGINES) || [])[1]).filter(Boolean).map((s) => s.toLowerCase()))];
  const otaLinks = links.some((l) => OTA_LINKS.test(l));
  const hasBooking = bookingProviders.length > 0 || BOOKING_ENGINES.test(html) || BOOKING_WORDS.test(text);

  let platform = null;
  if (/wix\.com|wixstatic/i.test(html)) platform = 'Wix';
  else if (/squarespace/i.test(html)) platform = 'Squarespace';
  else if (/cdn\.shopify|shopify\.com/i.test(html)) platform = 'Shopify';
  else if (/wp-content|wp-includes/i.test(html)) platform = 'WordPress';
  else if (/webflow/i.test(html)) platform = 'Webflow';

  const social = {};
  for (const [k, re] of [['facebook', /facebook\.com\/(?!sharer)[^"'\s]+/i], ['instagram', /instagram\.com\/[^"'\s]+/i], ['tiktok', /tiktok\.com\/@[^"'\s]+/i], ['linkedin', /linkedin\.com\/(company|in)\/[^"'\s]+/i]]) {
    const m = html.match(re);
    if (m) social[k] = `https://${m[0]}`;
  }

  return {
    https:              Boolean(finalUrl && finalUrl.startsWith('https:')),
    mobileFriendly:     /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html),
    title:              (html.match(/<title[^>]*>([^<]{1,200})/i)?.[1] || '').trim() || null,
    hasMetaDescription: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}/i.test(html),
    hasH1:              /<h1[\s>]/i.test(html),
    copyrightYear,
    outdatedSignals:    outdated,
    hasBooking,
    bookingProviders,
    thirdPartyBookingOnly: !hasBooking && otaLinks,
    hasContactForm:     /<form[\s>]/i.test(html),
    emails:             findEmails(html),
    social,
    platform,
    contactLink: links.find((l) => /contact|kontakt|contacto|contatti/i.test(l)) || null,
  };
}

/** Full audit for one website URL (or the lack of one). Never throws. */
async function auditWebsite(website, opts = {}) {
  if (!website) return { hasWebsite: false };
  let url = String(website).trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const page = await safeFetch(url, opts);
    if (page.status >= 400) return { hasWebsite: true, reachable: false, status: page.status, finalUrl: page.finalUrl };
    const signals = analyzeHtml(page.html, { finalUrl: page.finalUrl });
    // No email on the homepage: one look at the contact page.
    if (!signals.emails.length && signals.contactLink) {
      try {
        const contactUrl = new URL(signals.contactLink, page.finalUrl).href;
        if (new URL(contactUrl).hostname === new URL(page.finalUrl).hostname) {
          const contact = await safeFetch(contactUrl, { ...opts, timeout: 5000 });
          signals.emails = findEmails(contact.html);
        }
      } catch { /* best effort */ }
    }
    delete signals.contactLink;
    return {
      hasWebsite: true,
      reachable:  true,
      status:     page.status,
      finalUrl:   page.finalUrl,
      responseMs: page.ms,
      htmlKB:     Math.round(page.bytes / 1024),
      ...signals,
    };
  } catch (err) {
    return { hasWebsite: true, reachable: false, error: String(err.message || err).slice(0, 120) };
  }
}

module.exports = { auditWebsite, analyzeHtml, findEmails, isPrivateIp, assertPublicUrl, safeFetch };
