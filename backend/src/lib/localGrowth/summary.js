// Optional executive summary for a growth report, written with the buyer's own
// OpenAI key. Facts only — the model is told never to invent numbers.

const LANG_NAMES = { en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic' };

async function generateSummary({ apiKey, report, lang = 'en', fetchImpl = fetch }) {
  const facts = {
    business: report.business,
    scores: report.scores,
    competitors: report.benchmark,
    topActions: report.actions.slice(0, 5).map((a) => a.title),
  };
  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 350,
      messages: [
        { role: 'system', content: `You are a local marketing consultant. Write a clear executive summary (3–5 sentences, ${LANG_NAMES[lang] || 'English'}) of this business's online presence for its owner: where it stands against competitors, the biggest opportunity, and what to do first. Use only the facts given; never invent numbers. No headings, no bullet points.` },
        { role: 'user', content: JSON.stringify(facts) },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty AI response');
  return text;
}

module.exports = { generateSummary, LANG_NAMES };
