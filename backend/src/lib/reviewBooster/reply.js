// AI-drafted owner replies to Google reviews, written with the owner's own
// OpenAI key. The owner reviews, edits and posts the reply on Google.

async function draftReply({ apiKey, business, review, fetchImpl = fetch }) {
  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: [
            `You write public replies, as the owner of "${business.name}", to Google reviews.`,
            'Reply in the same language as the review (if it has no text, use the language code given, else English).',
            'Be warm, specific to what the reviewer said, and professional. 2–4 sentences, under 80 words.',
            'Positive review: thank them and mention one detail they liked. Negative or mixed review: apologise sincerely, address the issue without arguing or blaming, and invite them to get in touch directly to make it right.',
            'Never invent facts, names, offers, discounts or compensation. No hashtags, no emojis, no signature placeholder like [Name].',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify({ reviewer: review.author || null, stars: review.rating, language: review.language || null, review: review.text || '(no text, rating only)' }),
        },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty AI response');
  return text.slice(0, 1500);
}

module.exports = { draftReply };
