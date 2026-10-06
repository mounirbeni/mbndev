// MBN Proposal AI — shared helpers and the copy shown on the client-facing
// proposal page, in the proposal's language.

import type { ProposalItem, ProposalLanguage, ProposalStatus } from './api';

export const PROPOSAL_LANGUAGES: { id: ProposalLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'ar', label: 'العربية' },
  { id: 'es', label: 'Español' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'AUD', 'AED', 'SAR'];

export const STATUS_STYLE: Record<ProposalStatus, { label: string; cls: string }> = {
  draft:    { label: 'Draft',    cls: 'bg-white/10 text-slate-300' },
  sent:     { label: 'Sent',     cls: 'bg-sky-500/15 text-sky-300' },
  viewed:   { label: 'Opened',   cls: 'bg-amber-500/15 text-amber-300' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-500/15 text-emerald-300' },
  declined: { label: 'Declined', cls: 'bg-rose-500/15 text-rose-300' },
};

export function formatMoney(n: number, currency: string, lang: string = 'en') {
  try {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : lang, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/** Required items always count; optional ones only when selected. */
export function totalOf(items: ProposalItem[], selected: Set<string>) {
  return Math.round(items.reduce((s, it) => (!it.optional || selected.has(it.id) ? s + it.price : s), 0) * 100) / 100;
}

export interface ProposalCopy {
  preparedFor: string;
  preparedBy: string;
  validUntil: string;
  overview: string;
  solution: string;
  plan: string;
  investment: string;
  optional: string;
  total: string;
  terms: string;
  acceptTitle: string;
  acceptName: string;
  acceptCheck: string;
  accept: string;
  decline: string;
  declineReason: string;
  declineSend: string;
  accepted: (name: string, date: string) => string;
  declined: string;
  expired: string;
  print: string;
}

export const PROPOSAL_COPY: Record<ProposalLanguage, ProposalCopy> = {
  en: {
    preparedFor: 'Prepared for', preparedBy: 'Prepared by', validUntil: 'Valid until',
    overview: 'Overview', solution: 'Our solution', plan: 'How we’ll work', investment: 'Investment',
    optional: 'Optional', total: 'Total', terms: 'Terms',
    acceptTitle: 'Accept this proposal', acceptName: 'Your full name', acceptCheck: 'I accept this proposal and its terms.',
    accept: 'Accept & sign', decline: 'Decline', declineReason: 'Anything we should know? (optional)', declineSend: 'Send',
    accepted: (n, d) => `Accepted by ${n} on ${d}. Thank you — we’ll be in touch shortly.`,
    declined: 'You declined this proposal. Thank you for letting us know.',
    expired: 'This proposal has expired. Please ask for an updated version.',
    print: 'Print / PDF',
  },
  fr: {
    preparedFor: 'Préparé pour', preparedBy: 'Préparé par', validUntil: 'Valable jusqu’au',
    overview: 'Contexte', solution: 'Notre solution', plan: 'Déroulement', investment: 'Investissement',
    optional: 'Option', total: 'Total', terms: 'Conditions',
    acceptTitle: 'Accepter cette proposition', acceptName: 'Votre nom complet', acceptCheck: 'J’accepte cette proposition et ses conditions.',
    accept: 'Accepter et signer', decline: 'Refuser', declineReason: 'Une précision ? (facultatif)', declineSend: 'Envoyer',
    accepted: (n, d) => `Acceptée par ${n} le ${d}. Merci — nous revenons vers vous très vite.`,
    declined: 'Vous avez refusé cette proposition. Merci de nous avoir prévenus.',
    expired: 'Cette proposition a expiré. Demandez une version à jour.',
    print: 'Imprimer / PDF',
  },
  ar: {
    preparedFor: 'مُعدّ لـ', preparedBy: 'مُعدّ من', validUntil: 'صالح حتى',
    overview: 'نظرة عامة', solution: 'الحل المقترح', plan: 'مراحل العمل', investment: 'التكلفة',
    optional: 'اختياري', total: 'المجموع', terms: 'الشروط',
    acceptTitle: 'قبول هذا العرض', acceptName: 'اسمك الكامل', acceptCheck: 'أوافق على هذا العرض وشروطه.',
    accept: 'قبول وتوقيع', decline: 'رفض', declineReason: 'هل هناك ما تود إخبارنا به؟ (اختياري)', declineSend: 'إرسال',
    accepted: (n, d) => `تم القبول من طرف ${n} بتاريخ ${d}. شكرًا لك — سنتواصل معك قريبًا.`,
    declined: 'لقد رفضت هذا العرض. شكرًا لإعلامنا.',
    expired: 'انتهت صلاحية هذا العرض. اطلب نسخة محدثة.',
    print: 'طباعة / PDF',
  },
  es: {
    preparedFor: 'Preparado para', preparedBy: 'Preparado por', validUntil: 'Válido hasta',
    overview: 'Contexto', solution: 'Nuestra solución', plan: 'Cómo trabajaremos', investment: 'Inversión',
    optional: 'Opcional', total: 'Total', terms: 'Condiciones',
    acceptTitle: 'Aceptar esta propuesta', acceptName: 'Tu nombre completo', acceptCheck: 'Acepto esta propuesta y sus condiciones.',
    accept: 'Aceptar y firmar', decline: 'Rechazar', declineReason: '¿Algo que debamos saber? (opcional)', declineSend: 'Enviar',
    accepted: (n, d) => `Aceptada por ${n} el ${d}. Gracias — te contactaremos muy pronto.`,
    declined: 'Has rechazado esta propuesta. Gracias por avisarnos.',
    expired: 'Esta propuesta ha caducado. Pide una versión actualizada.',
    print: 'Imprimir / PDF',
  },
};

/** The message the owner sends the client with the proposal link. */
export function shareMessage(lang: ProposalLanguage, client: string, title: string, link: string) {
  switch (lang) {
    case 'fr': return `Bonjour ${client}, voici notre proposition « ${title} » : ${link}\nVous pouvez choisir les options et l’accepter en ligne. N’hésitez pas si vous avez des questions !`;
    case 'ar': return `مرحبًا ${client}، إليك عرضنا «${title}»: ${link}\nيمكنك اختيار الإضافات وقبول العرض مباشرة عبر الرابط. لا تتردد في التواصل معنا لأي سؤال!`;
    case 'es': return `Hola ${client}, aquí tienes nuestra propuesta «${title}»: ${link}\nPuedes elegir las opciones y aceptarla en línea. ¡Cualquier pregunta, aquí estamos!`;
    default:   return `Hi ${client}, here is our proposal "${title}": ${link}\nYou can pick the options and accept it online. Happy to answer any questions!`;
  }
}
