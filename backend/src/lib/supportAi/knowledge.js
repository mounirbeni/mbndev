// MBN Support AI knowledge base: crawl a website, cut its text into chunks and
// find the chunks relevant to a visitor's question (keyword scoring — no
// embeddings, so no extra cost or vector database).
const { safeFetch } = require('../leadsAi/audit');

const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|pdf|zip|mp4|mp3|css|js|xml|ico|woff2?)(\?|$)/i;

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

/** Readable text + title + same-site links of one HTML page. Pure. */
function extractPage(html, pageUrl) {
  const title = decodeEntities((html.match(/<title[^>]*>([^<]{1,200})/i)?.[1] || '').trim()) || null;
  const body = html
    .replace(/<(script|style|noscript|svg|iframe|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const text = decodeEntities(body).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 2).join('\n');

  const base = new URL(pageUrl);
  const links = new Set();
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname === base.hostname && /^https?:$/.test(u.protocol) && !SKIP_EXT.test(u.pathname)) {
        u.hash = '';
        links.add(u.href);
      }
    } catch { /* ignore bad links */ }
  }
  return { title, text, links: [...links] };
}

/** Crawl up to `maxPages` same-site pages, breadth-first, within a time budget. */
async function crawlSite(startUrl, { maxPages = 20, timeBudgetMs = 40000, fetchOpts = {} } = {}) {
  const started = Date.now();
  const start = new URL(/^https?:\/\//i.test(startUrl) ? startUrl : `https://${startUrl}`).href;
  const queue = [start];
  const seen = new Set([start]);
  const pages = [];

  // Sitemap first: it usually lists the pages that matter.
  try {
    const sm = await safeFetch(new URL('/sitemap.xml', start).href, { timeout: 6000, ...fetchOpts });
    if (sm.status < 400) {
      for (const m of sm.html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
        try {
          const u = new URL(m[1]);
          if (u.hostname === new URL(start).hostname && !SKIP_EXT.test(u.pathname) && !seen.has(u.href) && seen.size < maxPages * 3) {
            seen.add(u.href);
            queue.push(u.href);
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* no sitemap */ }

  while (queue.length && pages.length < maxPages && Date.now() - started < timeBudgetMs) {
    const batch = queue.splice(0, 4);
    const results = await Promise.all(batch.map(async (url) => {
      try {
        const res = await safeFetch(url, { timeout: 8000, ...fetchOpts });
        if (res.status >= 400 || !/<html|<body|<p/i.test(res.html)) return null;
        return { url: res.finalUrl, ...extractPage(res.html, res.finalUrl) };
      } catch { return null; }
    }));
    for (const r of results) {
      if (!r || pages.length >= maxPages) continue;
      if (r.text.length >= 20) pages.push({ url: r.url, title: r.title, text: r.text });
      for (const l of r.links) {
        if (!seen.has(l) && seen.size < maxPages * 3) { seen.add(l); queue.push(l); }
      }
    }
  }
  return pages;
}

/** ~900-character chunks on line boundaries. */
function chunkText(text, size = 900) {
  const out = [];
  let cur = '';
  for (const line of text.split('\n')) {
    if (cur && cur.length + line.length + 1 > size) { out.push(cur); cur = ''; }
    cur = cur ? `${cur}\n${line}` : line;
    while (cur.length > size * 1.5) { out.push(cur.slice(0, size)); cur = cur.slice(size); }
  }
  if (cur.trim()) out.push(cur);
  return out;
}

const STOP = new Set('the a an and or of to in on for is are be with at by from it this that you your we our i me my do does can how what when where which who will would le la les un une des et ou de du en au aux est pour par avec sur que qui quoi comment el los las y o en para por con es que como في من على إلى عن هل ما كيف متى أين هو هي'.split(' '));

function tokenize(s) {
  return (String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[\p{L}\p{N}]{2,}/gu) || [])
    .filter((t) => !STOP.has(t));
}

/** The `k` chunks that best match the query (TF-IDF style). */
function rankChunks(chunks, query, k = 4) {
  const q = [...new Set(tokenize(query))];
  if (!q.length || !chunks.length) return [];
  const docs = chunks.map((c) => tokenize(`${c.title || ''} ${c.text}`));
  const df = Object.fromEntries(q.map((t) => [t, docs.filter((d) => d.includes(t)).length]));
  const n = chunks.length;
  const scored = chunks.map((c, i) => {
    const d = docs[i];
    let score = 0;
    for (const t of q) {
      if (!df[t]) continue;
      const tf = d.filter((x) => x === t).length;
      if (tf) score += (1 + Math.log(tf)) * Math.log(1 + n / df[t]);
    }
    return { chunk: c, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k).map((s) => s.chunk);
}

module.exports = { crawlSite, extractPage, chunkText, rankChunks, tokenize };
