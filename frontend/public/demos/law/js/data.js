// Cabinet Alaoui — demo solo lawyer's practice (fictional). Content shared by the website and the owner dashboard.
// Everything here is demo copy, not legal advice.
const L = (en, fr, ar) => ({ en, fr, ar });

export const SHOP = {
  name: 'Cabinet Alaoui',
  short: 'ALAOUI',
  timezone: 'Africa/Casablanca',
  // weekday (0 = Sunday) → [open, close] in minutes, or null when closed
  hours: { 0: null, 1: [540, 1080], 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1020], 6: [540, 780] },
  step: 30, lead: 120, horizon: 21, cancelHours: 24,
  phone: '05 22 00 00 00', urgentLine: '06 61 00 00 00', email: 'contact@cabinet-alaoui.example',
  address: L('Rue Ibnou Sina, Maârif — Casablanca', 'Rue Ibnou Sina, Maârif — Casablanca', 'زنقة ابن سينا، المعاريف — الدار البيضاء'),
};

// Practice areas. A lawyer can only be booked for the areas listed in her/his `skills`.
export const AREAS = [
  { id: 'family', icon: 'handHeart', name: L('Family & divorce', 'Famille & divorce', 'الأسرة والطلاق'),
    desc: L('Divorce, child custody, maintenance and family agreements, handled with discretion.', 'Divorce, garde des enfants, pension alimentaire et accords familiaux, en toute discrétion.', 'الطلاق والحضانة والنفقة والاتفاقات الأسرية، بسرية تامة.'),
    cases: [L('Divorce by mutual consent', 'Divorce par consentement mutuel', 'الطلاق بالاتفاق'), L('Custody and visiting rights', 'Garde et droit de visite', 'الحضانة وحق الزيارة'), L('Maintenance and alimony', 'Pension alimentaire', 'النفقة')] },
  { id: 'property', icon: 'key', name: L('Real estate', 'Immobilier', 'العقار'),
    desc: L('Buying, selling, renting and disputes: contracts checked before you sign.', 'Achat, vente, location et litiges : vos contrats vérifiés avant de signer.', 'الشراء والبيع والكراء والنزاعات: عقودك تُراجَع قبل التوقيع.'),
    cases: [L('Sale or purchase agreement', 'Compromis de vente ou d’achat', 'عقد البيع أو الشراء'), L('Rent dispute or eviction', 'Litige locatif ou expulsion', 'نزاع الكراء أو الإفراغ'), L('Title and registration', 'Titre foncier et immatriculation', 'الرسم العقاري والتحفيظ')] },
  { id: 'labour', icon: 'users2', name: L('Employment', 'Droit du travail', 'قانون الشغل'),
    desc: L('Dismissal, unpaid wages, contracts and workplace disputes for employees and employers.', 'Licenciement, salaires impayés, contrats et conflits du travail, côté salarié comme employeur.', 'الفصل والأجور غير المؤداة والعقود ونزاعات الشغل للأجير والمشغّل.'),
    cases: [L('Dismissal and compensation', 'Licenciement et indemnités', 'الفصل والتعويضات'), L('Unpaid wages', 'Salaires impayés', 'الأجور غير المؤداة'), L('Employment contracts', 'Contrats de travail', 'عقود الشغل')] },
  { id: 'criminal', icon: 'gavel', name: L('Criminal defence', 'Défense pénale', 'الدفاع الجنائي'),
    desc: L('Defence from the first hour: police custody, complaints, hearings and appeals.', 'Défense dès la première heure : garde à vue, plaintes, audiences et appels.', 'دفاع منذ الساعة الأولى: الحراسة النظرية والشكايات والجلسات والاستئناف.'),
    cases: [L('Police custody', 'Garde à vue', 'الحراسة النظرية'), L('Filing or answering a complaint', 'Dépôt ou réponse à une plainte', 'تقديم شكاية أو الرد عليها'), L('Appeals', 'Appels', 'الاستئناف')] },
  { id: 'inheritance', icon: 'scale', name: L('Inheritance & wills', 'Successions & testaments', 'الإرث والوصايا'),
    desc: L('Estate shares, notarial deeds, family agreements and cross-border estates.', 'Partage successoral, actes notariés, accords de famille et successions internationales.', 'قسمة التركات والعقود العدلية والاتفاقات العائلية والتركات العابرة للحدود.'),
    cases: [L('Estate shares and deeds', 'Partage et actes', 'قسمة التركة والعقود'), L('Wills and gifts', 'Testaments et donations', 'الوصايا والهبات'), L('Estate with heirs abroad', 'Succession avec héritiers à l’étranger', 'تركة بورثة بالخارج')] },
  { id: 'debt', icon: 'receipt', name: L('Debt recovery', 'Recouvrement', 'استخلاص الديون'),
    desc: L('Unpaid invoices and cheques: formal notices, payment orders and enforcement.', 'Factures et chèques impayés : mises en demeure, injonctions de payer et exécution.', 'الفواتير والشيكات غير المؤداة: الإنذارات وأوامر الأداء والتنفيذ.'),
    cases: [L('Unpaid invoices', 'Factures impayées', 'فواتير غير مؤداة'), L('Bounced cheques', 'Chèques sans provision', 'شيكات بدون رصيد'), L('Enforcing a judgment', 'Exécution d’un jugement', 'تنفيذ حكم')] },
];

// Meeting types. `price` in MAD, `dur` in minutes, `modes` where it can take place.
export const MEETINGS = [
  { id: 'intro', dur: 15, price: 0, modes: ['phone'], name: L('Free orientation call', 'Appel d’orientation gratuit', 'مكالمة توجيه مجانية'),
    desc: L('15 minutes by phone to tell us what is happening and which lawyer fits.', '15 minutes par téléphone pour exposer votre situation et trouver le bon avocat.', '15 دقيقة هاتفياً لشرح وضعك وتحديد المحامي المناسب.') },
  { id: 'initial', dur: 30, price: 300, modes: ['office', 'video', 'phone'], pop: 1, name: L('Initial consultation', 'Première consultation', 'استشارة أولى'),
    desc: L('A clear opinion on your situation, your options and the next steps.', 'Un avis clair sur votre situation, vos options et les prochaines étapes.', 'رأي واضح حول وضعك وخياراتك والخطوات المقبلة.') },
  { id: 'contract', dur: 45, price: 500, modes: ['office', 'video'], name: L('Document & contract review', 'Revue de documents et contrats', 'مراجعة الوثائق والعقود'),
    desc: L('We read your contract or file and tell you what to change before you sign.', 'Nous lisons votre contrat ou dossier et vous disons quoi modifier avant de signer.', 'نقرأ عقدك أو ملفك ونخبرك بما يجب تعديله قبل التوقيع.') },
  { id: 'review', dur: 60, price: 600, modes: ['office', 'video'], name: L('Full case review', 'Analyse complète du dossier', 'دراسة كاملة للملف'),
    desc: L('An hour on your whole file, with a written strategy and fee estimate.', 'Une heure sur l’ensemble du dossier, avec stratégie écrite et estimation d’honoraires.', 'ساعة كاملة حول ملفك مع استراتيجية مكتوبة وتقدير للأتعاب.') },
  { id: 'urgent', dur: 30, price: 700, modes: ['office', 'video', 'phone'], name: L('Urgent consultation', 'Consultation urgente', 'استشارة مستعجلة'),
    desc: L('Priority slot for time-sensitive matters: custody, summons, notices and deadlines.', 'Créneau prioritaire pour les urgences : garde, convocations, mises en demeure et délais.', 'موعد أولوية للأمور المستعجلة: الاستدعاءات والإنذارات والآجال.') },
];

export const MODES = [
  { id: 'office', icon: 'building', name: L('At the office', 'Au cabinet', 'في المكتب') },
  { id: 'video', icon: 'video', name: L('Video call', 'Visioconférence', 'مكالمة فيديو') },
  { id: 'phone', icon: 'phone', name: L('Phone call', 'Téléphone', 'مكالمة هاتفية') },
];

export const TEAM = [
  { id: 'alaoui', name: 'Me Karim Alaoui', short: 'Karim', color: '#17294a', rating: 4.9, reviews: 412, years: 18, langs: ['AR', 'FR', 'EN'],
    role: L('Lawyer at the Casablanca Bar', 'Avocat au Barreau de Casablanca', 'محامٍ بهيئة الدار البيضاء'), skills: ['family', 'property', 'inheritance', 'labour', 'criminal', 'debt'],
    bio: L('Eighteen years at the Casablanca Bar. A personal practice built on one idea: you speak to the lawyer who handles your file, from the first call to the decision.', 'Dix-huit ans au Barreau de Casablanca. Un cabinet personnel fondé sur une idée : vous parlez à l’avocat qui traite votre dossier, du premier appel à la décision.', 'ثمانية عشر عاماً بهيئة الدار البيضاء. مكتب شخصي قائم على فكرة واحدة: تتحدث مع المحامي الذي يتولى ملفك من المكالمة الأولى إلى الحكم.'),
    week: [null, [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1020], [540, 780]] },
];

// "What is your situation?" → the right area and meeting type.
export const URGENCY = [
  { id: 'now', meeting: 'urgent', label: L('Today or tomorrow', 'Aujourd’hui ou demain', 'اليوم أو غداً') },
  { id: 'week', meeting: 'initial', label: L('This week', 'Cette semaine', 'هذا الأسبوع') },
  { id: 'plan', meeting: 'review', label: L('I am preparing ahead', 'Je prépare à l’avance', 'أحضّر مسبقاً') },
];

export const PLANS = [
  { id: 'essential', price: 1500, name: L('Essential', 'Essentiel', 'أساسي'),
    perks: [L('Unlimited phone and email questions', 'Questions téléphone et e-mail illimitées', 'أسئلة هاتفية وبالبريد بدون حدود'), L('2 contract reviews a month', '2 revues de contrat par mois', 'مراجعتان للعقود شهرياً'), L('Reply within one working day', 'Réponse sous un jour ouvré', 'رد خلال يوم عمل')] },
  { id: 'business', price: 4500, best: 1, name: L('Business', 'Business', 'الأعمال'),
    perks: [L('Your own lawyer for your business', 'Votre avocat pour votre activité', 'محاميك الخاص لنشاطك'), L('Up to 8 contracts and documents a month', 'Jusqu’à 8 contrats et documents par mois', 'حتى 8 عقود ووثائق شهرياً'), L('Same-day callback', 'Rappel le jour même', 'معاودة الاتصال في اليوم نفسه'), L('Debt reminders drafted for you', 'Relances d’impayés rédigées pour vous', 'صياغة تذكيرات الديون')] },
  { id: 'corporate', price: 0, name: L('Premium', 'Premium', 'مميّز'),
    perks: [L('Direct line to the lawyer', 'Ligne directe avec l’avocat', 'خط مباشر مع المحامي'), L('Court representation included', 'Représentation devant les tribunaux incluse', 'التمثيل أمام المحاكم مشمول'), L('Priority line, 7 days a week', 'Ligne prioritaire 7 jours sur 7', 'خط أولوية 7 أيام في الأسبوع')] },
];

export const GUIDES = [
  { q: L('What happens in a first consultation?', 'Que se passe-t-il lors d’une première consultation ?', 'ماذا يحدث في الاستشارة الأولى؟'),
    a: L('You explain your situation, we ask a few questions and give you an honest opinion: what is possible, what it may cost and what to do first. You decide afterwards.', 'Vous exposez votre situation, nous posons quelques questions et vous donnons un avis honnête : ce qui est possible, ce que cela peut coûter et par quoi commencer. Vous décidez ensuite.', 'تشرح وضعك ونطرح بعض الأسئلة ثم نعطيك رأياً صريحاً: ما الممكن وكم قد يكلّف وبماذا تبدأ. وبعدها تقرر أنت.') },
  { q: L('Which documents should I bring?', 'Quels documents dois-je apporter ?', 'ما الوثائق التي يجب إحضارها؟'),
    a: L('Your ID, any contract, letter or summons you received, and a short timeline of events. You can also upload them securely from your case page before the meeting.', 'Votre pièce d’identité, tout contrat, courrier ou convocation reçu, et une courte chronologie des faits. Vous pouvez aussi les déposer en ligne depuis la page de votre dossier.', 'بطاقتك الوطنية وكل عقد أو رسالة أو استدعاء توصلت به وتسلسل زمني قصير للوقائع. ويمكنك أيضاً رفعها بأمان من صفحة ملفك قبل الموعد.') },
  { q: L('How are fees set?', 'Comment sont fixés les honoraires ?', 'كيف تُحدَّد الأتعاب؟'),
    a: L('Every consultation has a fixed price shown before you book. For a full case we agree a written fee in advance, in stages, so you always know what is due and when.', 'Chaque consultation a un prix fixe affiché avant la réservation. Pour un dossier complet, nous convenons d’honoraires écrits à l’avance, par étapes, pour que vous sachiez toujours ce qui est dû et quand.', 'لكل استشارة سعر ثابت يظهر قبل الحجز. وفي الملف الكامل نتفق كتابياً على الأتعاب مسبقاً وعلى مراحل، لتعرف دائماً ما المستحق ومتى.') },
  { q: L('Is what I tell you confidential?', 'Ce que je vous dis est-il confidentiel ?', 'هل ما أقوله لكم سرّي؟'),
    a: L('Yes. Professional secrecy applies from your first message, even if you never become a client.', 'Oui. Le secret professionnel s’applique dès votre premier message, même si vous ne devenez jamais client.', 'نعم. يسري السر المهني منذ أول رسالة، حتى لو لم تصبح موكلاً.') },
  { q: L('Can I follow my case online?', 'Puis-je suivre mon dossier en ligne ?', 'هل يمكنني تتبع ملفي عبر الإنترنت؟'),
    a: L('Yes. Enter your file number and phone on the “Track my case” page: you see the stage, the next hearing, your documents and any invoice.', 'Oui. Saisissez votre numéro de dossier et votre téléphone sur la page « Suivre mon dossier » : étape, prochaine audience, documents et factures.', 'نعم. أدخل رقم ملفك وهاتفك في صفحة «تتبع ملفي»: ترى المرحلة والجلسة المقبلة ووثائقك وأي فاتورة.') },
  { q: L('Which languages do you work in?', 'Dans quelles langues travaillez-vous ?', 'بأي لغات تشتغلون؟'),
    a: L('Arabic, French and English. Documents can be drafted in the language the court or the other party requires.', 'Arabe, français et anglais. Les actes peuvent être rédigés dans la langue exigée par le tribunal ou la partie adverse.', 'العربية والفرنسية والإنجليزية. ويمكن تحرير الوثائق بلغة تطلبها المحكمة أو الطرف الآخر.') },
];

export const REVIEWS = [
  { name: 'N. B. — Casablanca', stars: 5, text: L('Clear from the first call. They told me honestly what to expect and what it would cost, and then did exactly that.', 'Clair dès le premier appel. On m’a dit honnêtement à quoi m’attendre et ce que cela coûterait, puis tout s’est passé ainsi.', 'واضحون منذ المكالمة الأولى. قالوا لي بصدق ما أتوقعه وكم سيكلّف، ثم نفّذوا ذلك بالضبط.') },
  { name: 'A. E. — Shop owner, Rabat', stars: 5, text: L('Our lease agreement was reviewed in two days and has already saved us one argument.', 'Notre contrat de bail a été revu en deux jours et nous a déjà évité une dispute.', 'تمت مراجعة عقد الكراء في يومين وجنّبنا خلافاً بالفعل.') },
  { name: 'S. M. — Marrakech', stars: 5, text: L('Following my file online meant I stopped calling to ask. I always knew the next date.', 'Suivre mon dossier en ligne m’a évité d’appeler sans cesse. Je connaissais toujours la prochaine date.', 'تتبع ملفي عبر الإنترنت أغناني عن الاتصال. كنت أعرف دائماً التاريخ المقبل.') },
  { name: 'K. R. — Employee, Tangier', stars: 5, text: L('I was dismissed without notice. Within two weeks there was a fair settlement.', 'J’ai été licencié sans préavis. En deux semaines, un accord équitable était signé.', 'فُصلت دون إشعار. وخلال أسبوعين تم توقيع تسوية منصفة.') },
  { name: 'Y. L. — Lyon', stars: 5, text: L('Living abroad, I could do everything by video and upload my papers. Effortless.', 'Vivant à l’étranger, j’ai tout fait en visio et déposé mes papiers en ligne. Sans effort.', 'وأنا مقيم بالخارج أنجزت كل شيء بالفيديو ورفعت أوراقي إلكترونياً. بلا عناء.') },
  { name: 'H. T. — Casablanca', stars: 4, text: L('Responsive and respectful. They explained every step of the court process in plain words.', 'Réactifs et respectueux. Chaque étape de la procédure m’a été expliquée simplement.', 'سريعو الاستجابة ومحترمون. شرحوا كل خطوة من المسطرة بكلمات بسيطة.') },
];

export const AMENITIES = [
  { icon: 'lock', label: L('Private meeting rooms', 'Salles de réunion privées', 'قاعات اجتماعات خاصة') },
  { icon: 'video', label: L('Video meetings', 'Visioconférence', 'اجتماعات بالفيديو') },
  { icon: 'upload', label: L('Secure document upload', 'Dépôt sécurisé de documents', 'رفع آمن للوثائق') },
  { icon: 'globe', label: L('Arabic · French · English', 'Arabe · français · anglais', 'العربية · الفرنسية · الإنجليزية') },
];

export const STAGES = [
  { id: 'intake', label: L('File opened', 'Dossier ouvert', 'فتح الملف') },
  { id: 'docs', label: L('Documents gathered', 'Pièces réunies', 'جمع الوثائق') },
  { id: 'filed', label: L('Filed', 'Dépôt / saisine', 'تقديم الملف') },
  { id: 'hearing', label: L('Hearings', 'Audiences', 'الجلسات') },
  { id: 'decision', label: L('Decision', 'Décision', 'الحكم') },
  { id: 'closed', label: L('Closed', 'Clôturé', 'إغلاق الملف') },
];

export const FACTS = [
  { n: 18, suffix: '', label: L('years at the Bar', 'ans au Barreau', 'سنة بالهيئة') },
  { n: 1800, suffix: '+', label: L('clients advised', 'clients conseillés', 'موكل تمت مواكبتهم') },
  { n: 3, suffix: '', label: L('working languages', 'langues de travail', 'لغات عمل') },
  { n: 1, suffix: ' h', label: L('average reply time', 'délai de réponse moyen', 'متوسط مدة الرد') },
];

// Photos live in img/ and are listed here once they exist; until then the site draws its own art.
const SET = (...ids) => new Set(ids);
export const PHOTOS = {
  hero: 0,        // img/hero-1.webp … hero-N.webp (rotating, 4:5)
  team: SET(),    // img/team-<id>.webp
  office: 0,      // img/office-1.webp … office-N.webp (square)
};
export const photoOf = {
  hero: () => Array.from({ length: PHOTOS.hero || 0 }, (_, i) => `/demos/law/img/hero-${i + 1}.webp`),
  team: (id) => (PHOTOS.team.has(id) ? `/demos/law/img/team-${id}.webp` : ''),
  office: () => Array.from({ length: PHOTOS.office || 0 }, (_, i) => `/demos/law/img/office-${i + 1}.webp`),
};

export const COURTS = {
  tpi: L('Court of First Instance — Casablanca', 'Tribunal de première instance — Casablanca', 'المحكمة الابتدائية — الدار البيضاء'),
  commerce: L('Commercial Court — Casablanca', 'Tribunal de commerce — Casablanca', 'المحكمة التجارية — الدار البيضاء'),
  family: L('Family Court — Casablanca', 'Section de la famille — Casablanca', 'قسم قضاء الأسرة — الدار البيضاء'),
  appeal: L('Court of Appeal — Casablanca', 'Cour d’appel — Casablanca', 'محكمة الاستئناف — الدار البيضاء'),
  social: L('Labour chamber — Casablanca', 'Chambre sociale — Casablanca', 'الغرفة الاجتماعية — الدار البيضاء'),
};
