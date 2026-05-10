export type Locale = 'en' | 'fr' | 'ar';

export const LOCALES: { code: Locale; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English',  flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية',  flag: '🇲🇦', dir: 'rtl' },
];

type Dict = Record<string, string>;

const en: Dict = {
  // Nav
  'nav.home':       'Home',
  'nav.services':   'Services',
  'nav.portfolio':  'Portfolio',
  'nav.pricing':    'Pricing',
  'nav.about':      'About',
  'nav.contact':    'Contact',
  'nav.login':      'Sign In',
  'nav.request':    'Start a Project',

  // Hero
  'hero.badge':      'Professional Web Development',
  'hero.title':      'Build Products That',
  'hero.title.bold': 'Actually Grow',
  'hero.sub':        'Full-stack development for startups, agencies, and businesses — delivered fast, built to last.',
  'hero.cta':        'Start Your Project',
  'hero.secondary':  'View Our Work',

  // CTA section
  'cta.badge':       'Ready to start?',
  'cta.title':       'Have a project in mind?',
  'cta.sub':         "Let's build something amazing together.",
  'cta.body':        'Fill out our smart project request form and get a custom proposal within 24 hours.',
  'cta.start':       'Start Your Project',
  'cta.whatsapp':    'Chat on WhatsApp',
  'cta.location':    'Morocco — Available Worldwide',
  'cta.response':    'Response within 24h',
  'cta.nocommit':    'No commitment required',

  // Footer
  'footer.nav':       'Navigation',
  'footer.services':  'Services',
  'footer.contact':   'Get in Touch',
  'footer.location':  'Morocco — Remote worldwide',
  'footer.payments':  'Accepted payments',
  'footer.secure':    'Secure Platform',
  'footer.response':  'Response within 24h',
  'footer.remote':    'Remote-first',
  'footer.built':     'Built in Morocco',
  'footer.privacy':   'Privacy Policy',
  'footer.terms':     'Terms of Service',
  'footer.chat':      'Chat on WhatsApp',
  'footer.email':     'Send a message',
  'footer.rights':    'All rights reserved.',

  // Contact
  'contact.title':   'Start a Conversation',
  'contact.sub':     "Have a project in mind? A question? Or just want to say hi — I'm always happy to connect.",
  'contact.from':    'From',
  'contact.to':      'Bill To',

  // Common
  'common.loading':  'Loading…',
  'common.error':    'Something went wrong',
  'common.back':     'Back',
  'common.save':     'Save',
  'common.cancel':   'Cancel',
};

const fr: Dict = {
  // Nav
  'nav.home':       'Accueil',
  'nav.services':   'Services',
  'nav.portfolio':  'Portfolio',
  'nav.pricing':    'Tarifs',
  'nav.about':      'À propos',
  'nav.contact':    'Contact',
  'nav.login':      'Connexion',
  'nav.request':    'Démarrer un projet',

  // Hero
  'hero.badge':      'Développement web professionnel',
  'hero.title':      'Créez des produits qui',
  'hero.title.bold': 'Grandissent vraiment',
  'hero.sub':        'Développement full-stack pour startups, agences et entreprises — livré rapidement, construit pour durer.',
  'hero.cta':        'Démarrer votre projet',
  'hero.secondary':  'Voir nos réalisations',

  // CTA section
  'cta.badge':       'Prêt à commencer ?',
  'cta.title':       'Un projet en tête ?',
  'cta.sub':         'Construisons quelque chose d\'extraordinaire ensemble.',
  'cta.body':        'Remplissez notre formulaire de demande et recevez une proposition personnalisée sous 24 heures.',
  'cta.start':       'Démarrer votre projet',
  'cta.whatsapp':    'Chat WhatsApp',
  'cta.location':    'Maroc — Disponible partout',
  'cta.response':    'Réponse sous 24h',
  'cta.nocommit':    'Sans engagement',

  // Footer
  'footer.nav':       'Navigation',
  'footer.services':  'Services',
  'footer.contact':   'Contactez-nous',
  'footer.location':  'Maroc — Travail à distance',
  'footer.payments':  'Paiements acceptés',
  'footer.secure':    'Plateforme sécurisée',
  'footer.response':  'Réponse sous 24h',
  'footer.remote':    '100 % distant',
  'footer.built':     'Fait au Maroc',
  'footer.privacy':   'Politique de confidentialité',
  'footer.terms':     'Conditions d\'utilisation',
  'footer.chat':      'Chat WhatsApp',
  'footer.email':     'Envoyer un message',
  'footer.rights':    'Tous droits réservés.',

  // Contact
  'contact.title':   'Démarrer une conversation',
  'contact.sub':     'Un projet en tête ? Une question ? N\'hésitez pas à me contacter.',
  'contact.from':    'De',
  'contact.to':      'Facturer à',

  // Common
  'common.loading':  'Chargement…',
  'common.error':    'Une erreur s\'est produite',
  'common.back':     'Retour',
  'common.save':     'Enregistrer',
  'common.cancel':   'Annuler',
};

const ar: Dict = {
  // Nav
  'nav.home':       'الرئيسية',
  'nav.services':   'الخدمات',
  'nav.portfolio':  'أعمالنا',
  'nav.pricing':    'الأسعار',
  'nav.about':      'من نحن',
  'nav.contact':    'تواصل معنا',
  'nav.login':      'تسجيل الدخول',
  'nav.request':    'ابدأ مشروعك',

  // Hero
  'hero.badge':      'تطوير ويب احترافي',
  'hero.title':      'ابنِ منتجات',
  'hero.title.bold': 'تنمو فعلاً',
  'hero.sub':        'تطوير شامل للشركات الناشئة والوكالات والشركات — سريع التسليم، ومبني للاستدامة.',
  'hero.cta':        'ابدأ مشروعك',
  'hero.secondary':  'اطلع على أعمالنا',

  // CTA section
  'cta.badge':       'هل أنت مستعد للبدء؟',
  'cta.title':       'هل لديك مشروع في ذهنك؟',
  'cta.sub':         'دعنا نبني شيئاً رائعاً معاً.',
  'cta.body':        'أرسل لنا ملخص مشروعك واحصل على عرض مخصص خلال 24 ساعة.',
  'cta.start':       'ابدأ مشروعك',
  'cta.whatsapp':    'تواصل عبر واتساب',
  'cta.location':    'المغرب — متاح عالمياً',
  'cta.response':    'رد خلال 24 ساعة',
  'cta.nocommit':    'بدون أي التزام',

  // Footer
  'footer.nav':       'التنقل',
  'footer.services':  'الخدمات',
  'footer.contact':   'تواصل معنا',
  'footer.location':  'المغرب — عن بُعد',
  'footer.payments':  'طرق الدفع المقبولة',
  'footer.secure':    'منصة آمنة',
  'footer.response':  'رد خلال 24 ساعة',
  'footer.remote':    'عمل عن بُعد',
  'footer.built':     'صُنع في المغرب',
  'footer.privacy':   'سياسة الخصوصية',
  'footer.terms':     'شروط الخدمة',
  'footer.chat':      'تواصل عبر واتساب',
  'footer.email':     'أرسل رسالة',
  'footer.rights':    'جميع الحقوق محفوظة.',

  // Contact
  'contact.title':   'ابدأ محادثة',
  'contact.sub':     'هل لديك مشروع في ذهنك؟ سؤال؟ أو مجرد رغبة في التواصل — يسعدني دائماً الحديث معك.',
  'contact.from':    'من',
  'contact.to':      'إلى',

  // Common
  'common.loading':  'جار التحميل…',
  'common.error':    'حدث خطأ ما',
  'common.back':     'رجوع',
  'common.save':     'حفظ',
  'common.cancel':   'إلغاء',
};

export const translations: Record<Locale, Dict> = { en, fr, ar };

export function t(locale: Locale, key: string, fallback?: string): string {
  return translations[locale]?.[key] ?? translations['en']?.[key] ?? fallback ?? key;
}
