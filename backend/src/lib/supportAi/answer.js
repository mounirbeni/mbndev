// Answers a website visitor from the bot's knowledge, with the owner's own
// OpenAI key. The model may append [LEAD] when the visitor is ready to book,
// buy or be contacted — the widget then offers the contact form.

const LEAD_TAG = /\s*\[LEAD\]\s*/gi;

function systemPrompt(bot, context) {
  return [
    `You are the website assistant for "${bot.name}" (${bot.websiteUrl}).`,
    'Answer the visitor using ONLY the information in CONTEXT and OWNER NOTES. If the answer is not there, say you are not sure and offer to connect them with the team — never invent prices, availability, policies or contact details.',
    'Reply in the same language as the visitor. Be warm, concise (max ~90 words) and helpful. No markdown headings.',
    'If the visitor wants to book, buy, get a quote, or be contacted, or asks for a human, end your reply with the exact tag [LEAD].',
    bot.notes ? `OWNER NOTES:\n${bot.notes.slice(0, 3000)}` : '',
    `CONTEXT:\n${context || '(no matching page content)'}`,
  ].filter(Boolean).join('\n\n');
}

/** history: [{ role: 'user'|'assistant', content }] (oldest first, without the new message). */
async function answerVisitor({ apiKey, bot, chunks, history = [], message, fetchImpl = fetch }) {
  const context = chunks.map((c) => `[${c.title || c.url}]\n${c.text}`).join('\n---\n').slice(0, 5000);
  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 350,
      messages: [
        { role: 'system', content: systemPrompt(bot, context) },
        ...history.slice(-8).map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) })),
        { role: 'user', content: message },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  const raw = data?.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty AI response');
  return { reply: raw.replace(LEAD_TAG, ' ').trim(), wantsLead: /\[LEAD\]/i.test(raw) };
}

module.exports = { answerVisitor, systemPrompt };
