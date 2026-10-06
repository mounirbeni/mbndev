// MBN Review Booster — copy shown to a business's customers (review page,
// poster, request messages), in the business's own language.

import type { ReviewLanguage } from './api';

export const REVIEW_LANGUAGES: { id: ReviewLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'ar', label: 'العربية' },
  { id: 'es', label: 'Español' },
];

export interface ReviewCopy {
  title: (name: string) => string;
  subtitle: string;
  google: string;
  privateLink: string;
  privateTitle: string;
  rating: string;
  message: string;
  name: string;
  contact: string;
  send: string;
  thanks: string;
  posterTitle: string;
  posterSub: string;
  scan: string;
}

export const REVIEW_COPY: Record<ReviewLanguage, ReviewCopy> = {
  en: {
    title: (n) => `How was your experience at ${n}?`,
    subtitle: 'Your review helps others discover us — it only takes a minute.',
    google: 'Leave a review on Google',
    privateLink: 'Something not right? Tell us privately',
    privateTitle: 'Send a private message to the team',
    rating: 'Your rating (optional)',
    message: 'What could we do better?',
    name: 'Your name (optional)',
    contact: 'Email or phone, if you want a reply (optional)',
    send: 'Send',
    thanks: 'Thank you! Your message was sent to the team.',
    posterTitle: 'Enjoyed your visit?',
    posterSub: 'Leave us a review on Google — it means a lot.',
    scan: 'Scan with your phone camera',
  },
  fr: {
    title: (n) => `Comment s'est passée votre expérience chez ${n} ?`,
    subtitle: 'Votre avis aide d’autres clients à nous découvrir — cela ne prend qu’une minute.',
    google: 'Laisser un avis sur Google',
    privateLink: 'Un souci ? Dites-le-nous en privé',
    privateTitle: 'Envoyer un message privé à l’équipe',
    rating: 'Votre note (facultatif)',
    message: 'Que pourrions-nous améliorer ?',
    name: 'Votre nom (facultatif)',
    contact: 'E-mail ou téléphone pour une réponse (facultatif)',
    send: 'Envoyer',
    thanks: 'Merci ! Votre message a été transmis à l’équipe.',
    posterTitle: 'Vous avez aimé votre visite ?',
    posterSub: 'Laissez-nous un avis sur Google — cela compte beaucoup.',
    scan: 'Scannez avec l’appareil photo de votre téléphone',
  },
  ar: {
    title: (n) => `كيف كانت تجربتك مع ${n}؟`,
    subtitle: 'رأيك يساعد الآخرين على اكتشافنا — لن يستغرق سوى دقيقة.',
    google: 'اترك تقييمًا على Google',
    privateLink: 'هل هناك ما لم يعجبك؟ أخبرنا بشكل خاص',
    privateTitle: 'أرسل رسالة خاصة إلى الفريق',
    rating: 'تقييمك (اختياري)',
    message: 'ما الذي يمكننا تحسينه؟',
    name: 'اسمك (اختياري)',
    contact: 'بريدك أو هاتفك إن أردت ردًا (اختياري)',
    send: 'إرسال',
    thanks: 'شكرًا لك! وصلت رسالتك إلى الفريق.',
    posterTitle: 'هل أعجبتك زيارتك؟',
    posterSub: 'اترك لنا تقييمًا على Google — يعني لنا الكثير.',
    scan: 'امسح الرمز بكاميرا هاتفك',
  },
  es: {
    title: (n) => `¿Qué tal tu experiencia en ${n}?`,
    subtitle: 'Tu reseña ayuda a otros a descubrirnos — solo te llevará un minuto.',
    google: 'Dejar una reseña en Google',
    privateLink: '¿Algo no fue bien? Cuéntanoslo en privado',
    privateTitle: 'Enviar un mensaje privado al equipo',
    rating: 'Tu valoración (opcional)',
    message: '¿Qué podríamos mejorar?',
    name: 'Tu nombre (opcional)',
    contact: 'Email o teléfono si quieres respuesta (opcional)',
    send: 'Enviar',
    thanks: '¡Gracias! Tu mensaje se envió al equipo.',
    posterTitle: '¿Te gustó tu visita?',
    posterSub: 'Déjanos una reseña en Google — significa mucho.',
    scan: 'Escanea con la cámara de tu móvil',
  },
};

/** The message an owner sends a customer to ask for a review. */
export function requestMessage(lang: ReviewLanguage, business: string, link: string, customer = '') {
  const c = customer.trim();
  switch (lang) {
    case 'fr': return `Bonjour${c ? ` ${c}` : ''} ! Merci d'avoir choisi ${business}. Auriez-vous un instant pour nous laisser un avis ? Cela nous aide beaucoup : ${link}`;
    case 'ar': return `مرحبًا${c ? ` ${c}` : ''}! شكرًا لاختيارك ${business}. هل يمكنك تخصيص دقيقة لترك تقييم لنا؟ يساعدنا ذلك كثيرًا: ${link}`;
    case 'es': return `¡Hola${c ? ` ${c}` : ''}! Gracias por elegir ${business}. ¿Tendrías un momento para dejarnos una reseña? Nos ayuda muchísimo: ${link}`;
    default:   return `Hi${c ? ` ${c}` : ''}! Thank you for choosing ${business}. Would you mind leaving us a quick review? It really helps: ${link}`;
  }
}

export const requestSubject: Record<ReviewLanguage, (b: string) => string> = {
  en: (b) => `How was your experience at ${b}?`,
  fr: (b) => `Votre avis sur ${b}`,
  ar: (b) => `رأيك في ${b}`,
  es: (b) => `Tu opinión sobre ${b}`,
};
