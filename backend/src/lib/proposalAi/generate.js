// Drafts a client proposal from a short brief, with the buyer's own OpenAI key.
const { normalizeContent, normalizeItems } = require('./shape');

const LANG_NAMES = { en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic' };

async function generateProposal({ apiKey, brief, clientName, clientCompany, brandName, language = 'en', currency = 'USD', fetchImpl = fetch }) {
  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(50000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      max_tokens: 2200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            `You write winning client proposals for ${brandName || 'a freelancer / agency'}. Write everything in ${LANG_NAMES[language] || 'English'}.`,
            'Return JSON only: {"title": string, "intro": string, "solution": string, "phases": [{"title","description","duration"}], "items": [{"name","description","price","optional"}], "terms": string}.',
            '"intro": 2–3 sentences showing you understood the client\'s situation and goal. "solution": what you will deliver and why it solves the problem (short paragraphs, may use "- " bullet lines).',
            '"phases": 3–6 steps with a realistic duration each (e.g. "1 week"). "items": 3–8 priced line items in ' + currency + ' (numbers only, no symbols); mark 1–3 nice-to-have extras as "optional": true.',
            'If the brief gives a budget or prices, respect them; otherwise use fair mid-market prices. "terms": payment schedule (e.g. 50% upfront), what is included, revisions, validity 30 days.',
            'Be concrete and confident. Never invent facts about the client, testimonials or guarantees.',
          ].join(' '),
        },
        { role: 'user', content: JSON.stringify({ client: clientName, company: clientCompany || null, brief }) },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  let parsed;
  try { parsed = JSON.parse(data?.choices?.[0]?.message?.content || ''); } catch { throw new Error('The AI returned an unreadable proposal — try again.'); }
  const items = normalizeItems(parsed.items);
  const content = normalizeContent(parsed);
  if (!content.intro || !items.length) throw new Error('The AI returned an incomplete proposal — try again.');
  return { title: String(parsed.title || '').trim().slice(0, 140) || `Proposal for ${clientName}`, content, items };
}

module.exports = { generateProposal, LANG_NAMES };
