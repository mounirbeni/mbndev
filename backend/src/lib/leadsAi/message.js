// Personalised outreach message for one prospect. Uses the buyer's own
// OpenAI key when set; otherwise (or if the call fails) a solid template.

const LANGS = {
  en: { name: 'English', hi: (n) => `Hi ${n} team,`, intro: (site) => `I came across ${site} and took a quick look at your website. A few things stood out:`, noSite: (n) => `I was looking for ${n} online and couldn't find a website for you.`, noSiteWhy: 'Most customers check a business online before they call or book — without a site, many of them go to a competitor.', offer: (svc) => `I help businesses like yours with ${svc}. Would you be open to a short call this week? I can share a few free ideas either way.`, bye: 'Best regards,', optout: 'If this isn\'t relevant, just reply "no" and I won\'t contact you again.' },
  fr: { name: 'French', hi: (n) => `Bonjour l'équipe ${n},`, intro: (site) => `Je suis tombé sur ${site} et j'ai jeté un œil à votre site. Quelques points m'ont frappé :`, noSite: (n) => `J'ai cherché ${n} en ligne et je n'ai pas trouvé de site web.`, noSiteWhy: 'La plupart des clients vérifient une entreprise en ligne avant d\'appeler ou de réserver — sans site, beaucoup partent chez un concurrent.', offer: (svc) => `J'aide les entreprises comme la vôtre avec ${svc}. Seriez-vous disponible pour un court échange cette semaine ? Je peux partager quelques idées gratuites dans tous les cas.`, bye: 'Bien cordialement,', optout: 'Si ce n\'est pas pertinent, répondez simplement « non » et je ne vous recontacterai pas.' },
  es: { name: 'Spanish', hi: (n) => `Hola equipo de ${n},`, intro: (site) => `Encontré ${site} y revisé rápidamente su sitio web. Algunas cosas me llamaron la atención:`, noSite: (n) => `Busqué ${n} en internet y no encontré un sitio web.`, noSiteWhy: 'La mayoría de los clientes revisan un negocio en línea antes de llamar o reservar; sin sitio, muchos se van con la competencia.', offer: (svc) => `Ayudo a negocios como el suyo con ${svc}. ¿Tendría unos minutos para una llamada esta semana? Puedo compartir algunas ideas gratis de todos modos.`, bye: 'Saludos cordiales,', optout: 'Si no le interesa, responda "no" y no volveré a contactarle.' },
  ar: { name: 'Arabic', hi: (n) => `مرحبًا فريق ${n}،`, intro: (site) => `اطلعتُ على موقعكم ${site} ولاحظتُ بعض النقاط:`, noSite: (n) => `بحثتُ عن ${n} على الإنترنت ولم أجد موقعًا إلكترونيًا لكم.`, noSiteWhy: 'أغلب الزبائن يبحثون عن النشاط على الإنترنت قبل الاتصال أو الحجز، ومن دون موقع يذهب كثير منهم إلى المنافسين.', offer: (svc) => `أساعد أنشطة مثل نشاطكم في ${svc}. هل يناسبكم اتصال قصير هذا الأسبوع؟ يمكنني مشاركة بعض الأفكار مجانًا في كل الأحوال.`, bye: 'مع التحية،', optout: 'إن لم يكن هذا مناسبًا، ردّوا بكلمة «لا» ولن أتواصل معكم مرة أخرى.' },
};

function templateMessage({ business, issues, lang = 'en', senderName = '', service = 'modern, fast websites that bring in more customers' }) {
  const L = LANGS[lang] || LANGS.en;
  const host = business.website ? business.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
  const lines = [L.hi(business.name), ''];
  if (!host || issues.some((i) => i.key === 'no_website')) {
    lines.push(L.noSite(business.name), L.noSiteWhy);
  } else {
    lines.push(L.intro(host));
    for (const i of issues.slice(0, 3)) lines.push(`• ${i.label}`);
  }
  lines.push('', L.offer(service), '', L.bye, senderName || '[Your name]', '', L.optout);
  return lines.join('\n');
}

async function aiMessage({ apiKey, business, audit, issues, lang = 'en', tone = 'friendly', senderName = '', service, fetchImpl = fetch }) {
  const L = LANGS[lang] || LANGS.en;
  const facts = {
    business: { name: business.name, address: business.address, rating: business.rating, reviews: business.reviews, website: business.website || null },
    findings: issues.map((i) => i.label),
    platform: audit?.platform || null,
  };
  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: 'system', content: `You write short, honest cold outreach emails for a web professional. Write in ${L.name}, ${tone} tone, under 130 words, no subject line. Mention only the findings provided — never invent facts, numbers or compliments. One clear, low-pressure call to action. End with the sender's name and this exact opt-out line: "${L.optout}"` },
        { role: 'user', content: `Sender: ${senderName || '[Your name]'}\nService offered: ${service || 'website design and improvement'}\nFacts (JSON): ${JSON.stringify(facts)}` },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty AI response');
  return text;
}

/** Returns { message, source: 'ai' | 'template', warning? }. Never throws. */
async function generateMessage(opts) {
  if (opts.apiKey) {
    try {
      return { message: await aiMessage(opts), source: 'ai' };
    } catch (err) {
      return { message: templateMessage(opts), source: 'template', warning: `AI unavailable: ${String(err.message).slice(0, 140)}` };
    }
  }
  return { message: templateMessage(opts), source: 'template' };
}

module.exports = { generateMessage, templateMessage, LANGS };
