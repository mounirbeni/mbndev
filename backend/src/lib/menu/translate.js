// Fills the missing languages of a menu with AI translations, using the
// owner's own OpenAI key. Text the owner already wrote in a language is never
// overwritten.

const LANGUAGE_NAMES = { en: 'English', fr: 'French', es: 'Spanish', pt: 'European Portuguese', it: 'Italian', de: 'German', ar: 'Arabic' };
const CHUNK = 60;
const PARALLEL = 4;
const MAX = { tagline: 140, about: 800, category: 60, 'dish name': 80, 'dish description': 300, option: 60, extra: 60 };

/** Every localized field that has text in `from` but not in one of `targets`. */
function collect(restaurant, from, targets) {
  const fields = [];
  const add = (obj, key) => {
    if (!obj?.[from]) return;
    const missing = targets.filter((t) => !obj[t]);
    if (missing.length) fields.push({ obj, source: obj[from], missing, key });
  };
  add(restaurant.tagline, 'tagline');
  add(restaurant.about, 'about');
  for (const c of restaurant.menu?.categories || []) {
    add(c.name, 'category');
    for (const it of c.items || []) {
      add(it.name, 'dish name');
      add(it.desc, 'dish description');
      for (const o of it.options || []) add(o.name, 'option');
      for (const e of it.extras || []) add(e.name, 'extra');
    }
  }
  return fields;
}

async function callOpenAI({ apiKey, from, to, strings, restaurantName, fetchImpl }) {
  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            `You translate a restaurant menu for "${restaurantName}" from ${LANGUAGE_NAMES[from]} into ${LANGUAGE_NAMES[to]}.`,
            'Translate naturally, the way a good local restaurant menu reads. Keep dish names that are proper names or well known abroad (e.g. "Pad Thai", "Paella", "Bacalhau à Brás") unchanged, and translate only their descriptive part if any.',
            'Keep numbers, units and punctuation. Never add information.',
            'Reply with a JSON object with the same keys as the input and the translated strings as values.',
          ].join(' '),
        },
        { role: 'user', content: JSON.stringify(strings) },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  try { return JSON.parse(data?.choices?.[0]?.message?.content || '{}'); } catch { throw new Error('The AI reply could not be read — try again.'); }
}

/**
 * Translates in place into one language, a few chunks at a time, stopping
 * before `deadline` (ms timestamp) so a request stays inside the function
 * time limit. Returns { translated, remaining } — call again while remaining > 0.
 * `restaurant` is a plain object with name, tagline, about and menu.
 */
async function translateRestaurant({ apiKey, restaurant, from, to, deadline = Date.now() + 35000, fetchImpl = fetch }) {
  const todo = collect(restaurant, from, [to]);
  const chunks = [];
  for (let i = 0; i < todo.length; i += CHUNK) chunks.push(todo.slice(i, i + CHUNK));
  let translated = 0;
  let done = 0;
  while (done < chunks.length && Date.now() < deadline) {
    const batch = chunks.slice(done, done + PARALLEL);
    const results = await Promise.all(batch.map((chunk) => callOpenAI({
      apiKey, from, to, restaurantName: restaurant.name, fetchImpl,
      strings: Object.fromEntries(chunk.map((f, k) => [`s${k}`, f.source])),
    })));
    batch.forEach((chunk, b) => chunk.forEach((f, k) => {
      const v = typeof results[b][`s${k}`] === 'string' ? results[b][`s${k}`].trim() : '';
      if (v && !f.obj[to]) { f.obj[to] = v.slice(0, MAX[f.key]); translated++; }
    }));
    done += batch.length;
  }
  const remaining = chunks.slice(done).reduce((n, c) => n + c.length, 0);
  return { translated, remaining };
}

module.exports = { translateRestaurant, collect, LANGUAGE_NAMES };
