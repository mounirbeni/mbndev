// TARZ Barber Club — demo data. Everything here is illustrative (a sales demo by MBN DEV):
// the shop, its barbers, prices and reviews are fictional.

/** Localised string helper: [en, fr, ar] → { en, fr, ar } */
const L = (en, fr, ar) => ({ en, fr, ar });

export const SHOP = {
  name: 'TARZ',
  full: 'TARZ Barber Club',
  city: L('Rabat', 'Rabat', 'الرباط'),
  address: L('8 Rue Oued Ziz, Agdal, Rabat', '8 Rue Oued Ziz, Agdal, Rabat', '8 زنقة واد زيز، أكدال، الرباط'),
  phone: '+212 537 00 00 00',
  currency: 'MAD',
  timezone: 'Africa/Casablanca',
  // [open, close] in minutes from midnight per weekday (0 = Sunday)
  hours: { 0: [780, 1140], 1: [600, 1260], 2: [600, 1260], 3: [600, 1260], 4: [600, 1260], 5: [600, 1260], 6: [600, 1260] },
  step: 30,            // booking grid, minutes
  lead: 30,            // earliest online booking from now, minutes
  horizon: 14,         // days bookable ahead
  stampsForReward: 8,  // every 8th cut is free
  promo: { TARZ10: 0.10 },
};

export const CATEGORIES = [
  { id: 'cuts', name: L('Haircuts', 'Coupes', 'قصّات الشعر') },
  { id: 'beard', name: L('Beard & shave', 'Barbe & rasage', 'اللحية والحلاقة') },
  { id: 'combo', name: L('Combos', 'Formules', 'العروض') },
  { id: 'care', name: L('Care', 'Soins', 'العناية') },
  { id: 'kids', name: L('Kids', 'Enfants', 'الأطفال') },
];

// dur = minutes of chair time, price in MAD, art = illustration key (js/art.js)
export const SERVICES = [
  { id: 'classic', cat: 'cuts', dur: 40, price: 80, art: 'classic', pop: 1,
    name: L('Classic cut', 'Coupe classique', 'قصّة كلاسيكية'),
    desc: L('Scissor-and-clipper cut, neckline cleaned with a straight razor, styled.', 'Ciseaux et tondeuse, nuque rasée au coupe-chou, coiffage.', 'مقص وماكينة مع تنظيف الرقبة بالموس وتصفيف.') },
  { id: 'fade', cat: 'cuts', dur: 45, price: 90, art: 'fade', pop: 1,
    name: L('Skin fade', 'Dégradé à blanc', 'تدريج على الصفر'),
    desc: L('Seamless fade from the skin up, blended by hand. Our most requested cut.', 'Dégradé progressif depuis la peau, fondu à la main. Notre coupe la plus demandée.', 'تدريج متّصل من الصفر مع دمج يدوي. القصّة الأكثر طلبًا عندنا.') },
  { id: 'taper', cat: 'cuts', dur: 45, price: 90, art: 'taper',
    name: L('Taper & texture', 'Taper & texture', 'تيبر وتكسير'),
    desc: L('Soft taper on the sides, length and texture on top. Easy to live with.', 'Taper discret sur les côtés, longueur et texture dessus. Facile à coiffer.', 'تيبر ناعم على الجوانب مع طول وتكسير في الأعلى. سهلة التصفيف.') },
  { id: 'buzz', cat: 'cuts', dur: 30, price: 50, art: 'buzz',
    name: L('Buzz cut', 'Coupe à la tondeuse', 'قصّة بالماكينة'),
    desc: L('One guard, all over, with a crisp edge-up.', 'Un seul sabot, partout, contours nets.', 'مقاس واحد على كل الرأس مع حواف حادّة.') },
  { id: 'scissor', cat: 'cuts', dur: 60, price: 110, art: 'scissor',
    name: L('Scissor cut — long hair', 'Coupe aux ciseaux — cheveux longs', 'قصّة بالمقص — شعر طويل'),
    desc: L('Shape, layers and length kept with scissors only. Includes wash and blow-dry.', 'Forme, dégradé et longueur aux ciseaux uniquement. Shampoing et brushing inclus.', 'تشكيل وطبقات مع الحفاظ على الطول بالمقص فقط. يشمل الغسل والتجفيف.') },
  { id: 'beardtrim', cat: 'beard', dur: 30, price: 50, art: 'beard',
    name: L('Beard trim', 'Taille de barbe', 'تهذيب اللحية'),
    desc: L('Shape, line-up and cheek lines, finished with beard oil.', 'Forme, contours et pommettes, finition à l’huile de barbe.', 'تشكيل وتحديد الخطوط مع زيت اللحية.') },
  { id: 'beardsculpt', cat: 'beard', dur: 45, price: 80, art: 'beard',
    name: L('Beard sculpt & hot towel', 'Sculpture de barbe & serviette chaude', 'نحت اللحية ومنشفة ساخنة'),
    desc: L('Full sculpt with hot towel, razor line-up and balm.', 'Sculpture complète, serviette chaude, contours au rasoir et baume.', 'نحت كامل مع منشفة ساخنة وتحديد بالموس وبلسم.') },
  { id: 'shave', cat: 'beard', dur: 45, price: 90, art: 'shave',
    name: L('Hot towel shave', 'Rasage à l’ancienne', 'حلاقة بالمنشفة الساخنة'),
    desc: L('Traditional straight-razor shave: hot towels, lather, aftershave.', 'Rasage traditionnel au coupe-chou : serviettes chaudes, mousse, after-shave.', 'حلاقة تقليدية بالموس: مناشف ساخنة ورغوة وعطر بعد الحلاقة.') },
  { id: 'cutbeard', cat: 'combo', dur: 75, price: 130, art: 'combo', pop: 1,
    name: L('Cut + beard', 'Coupe + barbe', 'قصّة + لحية'),
    desc: L('Any cut with a beard sculpt. Saves 40 MAD.', 'Une coupe au choix avec sculpture de barbe. Économisez 40 MAD.', 'أي قصّة مع نحت اللحية. توفّر 40 درهمًا.') },
  { id: 'royal', cat: 'combo', dur: 105, price: 220, art: 'crown',
    name: L('The Royal', 'Le Royal', 'الملكي'),
    desc: L('Cut, hot towel shave, black-mask facial and a scalp massage. The full ritual.', 'Coupe, rasage serviette chaude, soin masque noir et massage du cuir chevelu. Le rituel complet.', 'قصّة وحلاقة بالمنشفة الساخنة وماسك أسود وتدليك فروة الرأس. الطقس الكامل.') },
  { id: 'facial', cat: 'care', dur: 30, price: 60, art: 'mask',
    name: L('Black mask facial', 'Soin visage masque noir', 'ماسك أسود للوجه'),
    desc: L('Deep-cleansing mask, steam and a cooling finish.', 'Masque purifiant, vapeur et finition fraîcheur.', 'ماسك تنظيف عميق وبخار ولمسة منعشة.') },
  { id: 'wash', cat: 'care', dur: 30, price: 40, art: 'wash',
    name: L('Wash & style', 'Shampoing & coiffage', 'غسل وتصفيف'),
    desc: L('Scalp wash, conditioner and a styled finish.', 'Shampoing, après-shampoing et coiffage.', 'غسل الفروة وبلسم وتصفيف.') },
  { id: 'grey', cat: 'care', dur: 45, price: 150, art: 'grey',
    name: L('Grey blending', 'Camouflage des cheveux blancs', 'إخفاء الشيب'),
    desc: L('Natural-looking colour that softens grey instead of covering it.', 'Une couleur naturelle qui estompe les cheveux blancs au lieu de les couvrir.', 'لون طبيعي يخفّف الشيب بدل تغطيته.') },
  { id: 'kids', cat: 'kids', dur: 30, price: 60, art: 'kids',
    name: L('Kids cut (under 12)', 'Coupe enfant (– de 12 ans)', 'قصّة أطفال (أقل من 12 سنة)'),
    desc: L('Patient hands, a comfy booster seat and a lollipop.', 'Mains patientes, rehausseur confortable et une sucette.', 'أيادٍ صبورة ومقعد مريح وحلوى.') },
];

// Weekly schedule per barber: weekday (0 = Sunday) → [from, to] minutes, or null when off.
const wk = (...a) => Object.fromEntries(a.map((v, i) => [i, v]));
export const BARBERS = [
  { id: 'younes', name: 'Younes', color: '#c9a24d', rating: 4.9, reviews: 212, years: 12,
    role: L('Master barber · founder', 'Maître barbier · fondateur', 'كبير الحلاقين · المؤسس'),
    skills: ['fade', 'taper', 'royal'],
    bio: L('Twelve years behind the chair. If you want a fade that grows out clean, ask for Younes.', 'Douze ans derrière le fauteuil. Pour un dégradé qui repousse proprement, demandez Younes.', 'اثنتا عشرة سنة خلف الكرسي. إن أردت تدريجًا ينمو بشكل مرتّب فاطلب يونس.'),
    week: wk(null, [600, 1260], [600, 1260], [600, 1260], [600, 1260], [600, 1260], [600, 1260]) },
  { id: 'anas', name: 'Anas', color: '#b3262e', rating: 4.8, reviews: 168, years: 8,
    role: L('Beard specialist', 'Spécialiste barbe', 'خبير اللحية'),
    skills: ['beardsculpt', 'shave', 'cutbeard'],
    bio: L('Hot towels, straight razor, patience. Anas treats every beard like a sculpture.', 'Serviettes chaudes, coupe-chou, patience. Anas traite chaque barbe comme une sculpture.', 'مناشف ساخنة وموس وصبر. يعامل أنس كل لحية كأنها منحوتة.'),
    week: wk([780, 1140], [660, 1260], [660, 1260], null, [660, 1260], [660, 1260], [660, 1260]) },
  { id: 'ilyas', name: 'Ilyas', color: '#3b7a6a', rating: 4.8, reviews: 131, years: 6,
    role: L('Classic & long hair', 'Classique & cheveux longs', 'كلاسيكي وشعر طويل'),
    skills: ['classic', 'scissor', 'grey'],
    bio: L('Scissor work, gentleman cuts and long-hair shaping. Calm chair, good conversation.', 'Travail aux ciseaux, coupes de gentleman et cheveux longs. Fauteuil calme, bonne conversation.', 'عمل بالمقص وقصّات رجالية وتشكيل الشعر الطويل. كرسي هادئ وحديث ممتع.'),
    week: wk([780, 1140], [600, 1200], null, [600, 1200], [600, 1200], [600, 1200], [600, 1200]) },
  { id: 'soufiane', name: 'Soufiane', color: '#4a6fa5', rating: 4.7, reviews: 96, years: 4,
    role: L('Fades & kids', 'Dégradés & enfants', 'تدريج وأطفال'),
    skills: ['buzz', 'fade', 'kids'],
    bio: L('Sharp, quick fades and the one the little ones ask for by name.', 'Dégradés nets et rapides, et celui que les petits demandent par son prénom.', 'تدريج حادّ وسريع، والحلاق الذي يطلبه الصغار بالاسم.'),
    week: wk(null, [660, 1260], [660, 1260], [660, 1260], null, [660, 1260], [600, 1260]) },
];

// Style match: three answers → one style. Each style points at a service.
export const STYLES = [
  { id: 'skinfade', service: 'fade', art: 'fade', barber: 'younes',
    name: L('Skin fade', 'Dégradé à blanc', 'تدريج على الصفر'),
    why: L('Short, sharp and low maintenance — it frames the face and stays clean for two weeks.', 'Court, net et facile à entretenir — il structure le visage et reste propre deux semaines.', 'قصير وحادّ وسهل العناية — يبرز الوجه ويبقى مرتبًا أسبوعين.') },
  { id: 'taper', service: 'taper', art: 'taper', barber: 'younes',
    name: L('Textured taper', 'Taper texturé', 'تيبر مُكسَّر'),
    why: L('Neat sides with movement on top. Smart enough for the office, relaxed enough for the weekend.', 'Côtés nets et mouvement dessus. Assez chic pour le bureau, assez relax pour le week-end.', 'جوانب مرتبة وحركة في الأعلى. أنيق للعمل ومريح لنهاية الأسبوع.') },
  { id: 'classic', service: 'classic', art: 'classic', barber: 'ilyas',
    name: L('Gentleman’s classic', 'Classique gentleman', 'الكلاسيكي الرجالي'),
    why: L('A side-parted, scissor-led cut that never goes out of style.', 'Une coupe à raie, travaillée aux ciseaux, qui ne se démode jamais.', 'قصّة بفاصل جانبي بالمقص لا تخرج عن الموضة أبدًا.') },
  { id: 'crop', service: 'buzz', art: 'buzz', barber: 'soufiane',
    name: L('Crisp crop', 'Coupe courte nette', 'قصّة قصيرة حادّة'),
    why: L('Almost no styling needed. A clean edge-up does all the work.', 'Presque aucun coiffage. Des contours nets font tout le travail.', 'لا تحتاج تصفيفًا تقريبًا. الحواف الحادّة تؤدي المطلوب.') },
  { id: 'long', service: 'scissor', art: 'scissor', barber: 'ilyas',
    name: L('Shaped long hair', 'Cheveux longs structurés', 'شعر طويل مُشكَّل'),
    why: L('Keep the length, lose the weight. Layers that fall where you want them.', 'Gardez la longueur, perdez le poids. Des dégradés qui retombent où vous voulez.', 'احتفظ بالطول وتخلّص من الثقل. طبقات تنسدل حيث تريد.') },
  { id: 'beardfull', service: 'cutbeard', art: 'combo', barber: 'anas',
    name: L('Cut + sculpted beard', 'Coupe + barbe sculptée', 'قصّة + لحية منحوتة'),
    why: L('Hair and beard designed together so the lines match.', 'Cheveux et barbe pensés ensemble pour des lignes cohérentes.', 'الشعر واللحية يُصمَّمان معًا لتتناسق الخطوط.') },
];

export const FINDER = {
  length: [
    { id: 'short', label: L('Short', 'Court', 'قصير') },
    { id: 'medium', label: L('Medium', 'Moyen', 'متوسط') },
    { id: 'long', label: L('Long', 'Long', 'طويل') },
  ],
  vibe: [
    { id: 'clean', label: L('Clean & sharp', 'Net & précis', 'أنيق وحادّ') },
    { id: 'classic', label: L('Classic', 'Classique', 'كلاسيكي') },
    { id: 'relaxed', label: L('Relaxed', 'Décontracté', 'مريح') },
  ],
  beard: [
    { id: 'none', label: L('Clean-shaven', 'Rasé', 'حليق') },
    { id: 'stubble', label: L('Stubble', 'Barbe de 3 jours', 'لحية خفيفة') },
    { id: 'full', label: L('Full beard', 'Barbe fournie', 'لحية كثيفة') },
  ],
};

/** Answers → style id. */
export function matchStyle({ length, vibe, beard }) {
  if (beard === 'full') return 'beardfull';
  if (length === 'long') return 'long';
  if (length === 'short') return vibe === 'clean' ? 'skinfade' : vibe === 'classic' ? 'classic' : 'crop';
  return vibe === 'classic' ? 'classic' : vibe === 'clean' ? 'skinfade' : 'taper';
}

export const PLANS = [
  { id: 'essential', price: 199, cuts: '2', name: L('Essential', 'Essentiel', 'الأساسي'),
    perks: [L('2 cuts a month', '2 coupes par mois', 'قصّتان شهريًا'), L('Book 7 days ahead', 'Réservez 7 jours à l’avance', 'احجز قبل 7 أيام'), L('10% off products', '10 % sur les produits', 'خصم 10% على المنتجات')] },
  { id: 'club', price: 349, cuts: '4', best: 1, name: L('Club', 'Club', 'النادي'),
    perks: [L('4 cuts a month', '4 coupes par mois', '4 قصّات شهريًا'), L('1 beard sculpt included', '1 sculpture de barbe incluse', 'نحت لحية واحد مشمول'), L('Priority booking', 'Réservation prioritaire', 'أولوية الحجز'), L('15% off products', '15 % sur les produits', 'خصم 15% على المنتجات')] },
  { id: 'prestige', price: 590, cuts: '∞', name: L('Prestige', 'Prestige', 'بريستيج'),
    perks: [L('Unlimited cuts & beard', 'Coupes & barbe illimitées', 'قصّات ولحية بلا حدود'), L('A Royal every month', 'Un Royal par mois', 'الملكي كل شهر'), L('Same-day guarantee', 'Garantie le jour même', 'ضمان الحجز في اليوم نفسه'), L('20% off products', '20 % sur les produits', 'خصم 20% على المنتجات')] },
];

export const GIFT_AMOUNTS = [100, 200, 300, 500];
export const GIFT_DESIGNS = [
  { id: 'brass', name: L('Brass', 'Laiton', 'نحاسي'), a: '#c9a24d', b: '#7a5a1e' },
  { id: 'pole', name: L('Barber pole', 'Enseigne de barbier', 'عمود الحلاق'), a: '#b3262e', b: '#1f3f73' },
  { id: 'night', name: L('Midnight', 'Minuit', 'منتصف الليل'), a: '#2b3a36', b: '#0d1210' },
];

export const PRODUCTS = [
  { id: 'clay', price: 110, art: 'jar', tint: '#5b6560', name: L('Matte clay', 'Argile mate', 'طين مات'), note: L('Strong hold · no shine', 'Tenue forte · sans brillance', 'تثبيت قوي · بدون لمعان') },
  { id: 'pomade', price: 95, art: 'jar', tint: '#c9a24d', name: L('Water-based pomade', 'Pommade à base d’eau', 'بوماد مائي'), note: L('Medium hold · high shine', 'Tenue moyenne · brillant', 'تثبيت متوسط · لمعان عالٍ') },
  { id: 'salt', price: 90, art: 'bottle', tint: '#4a6fa5', name: L('Sea-salt spray', 'Spray au sel marin', 'بخاخ ملح البحر'), note: L('Texture & volume', 'Texture et volume', 'ملمس وكثافة') },
  { id: 'oil', price: 120, art: 'dropper', tint: '#7a4a1e', name: L('Beard oil — cedar & argan', 'Huile de barbe — cèdre & argan', 'زيت اللحية — أرز وأركان'), note: L('Softens · 30 ml', 'Adoucit · 30 ml', 'ترطّب · 30 مل') },
  { id: 'balm', price: 85, art: 'tin', tint: '#8a6a3a', name: L('Beard balm', 'Baume à barbe', 'بلسم اللحية'), note: L('Shapes & conditions', 'Structure et nourrit', 'تشكيل وتغذية') },
  { id: 'after', price: 130, art: 'bottle', tint: '#b3262e', name: L('Aftershave — oud & amber', 'After-shave — oud & ambre', 'عطر بعد الحلاقة — عود وعنبر'), note: L('Cools & scents · 100 ml', 'Apaise et parfume · 100 ml', 'ينعش ويعطّر · 100 مل') },
  { id: 'shampoo', price: 70, art: 'bottle', tint: '#3b7a6a', name: L('Daily shampoo', 'Shampoing quotidien', 'شامبو يومي'), note: L('Gentle · 250 ml', 'Doux · 250 ml', 'لطيف · 250 مل') },
  { id: 'comb', price: 60, art: 'comb', tint: '#3a2a1a', name: L('Walnut comb', 'Peigne en noyer', 'مشط من الجوز'), note: L('Handmade · anti-static', 'Fait main · antistatique', 'صناعة يدوية · مضاد للكهرباء') },
];

export const REVIEWS = [
  { name: 'Mehdi B.', stars: 5, text: L('Best fade in Rabat, and the booking took ten seconds.', 'Le meilleur dégradé de Rabat, et la réservation a pris dix secondes.', 'أفضل تدريج في الرباط، والحجز أخذ عشر ثوانٍ.') },
  { name: 'Reda K.', stars: 5, text: L('Anas’s hot towel shave is a proper reset. Worth the detour.', 'Le rasage serviette chaude d’Anas, c’est un vrai reset. Ça vaut le détour.', 'حلاقة أنس بالمنشفة الساخنة إعادة ضبط حقيقية. تستحق العناء.') },
  { name: 'Hamza L.', stars: 5, text: L('Brought my son — Soufiane made it fun. We’re regulars now.', 'J’ai amené mon fils — Soufiane en a fait un jeu. Nous sommes devenus des habitués.', 'أحضرت ابني وجعلها سفيان ممتعة. صرنا زبائن دائمين.') },
  { name: 'Othmane R.', stars: 4, text: L('Always on time. The queue screen saves me from waiting around.', 'Toujours à l’heure. L’écran de file d’attente m’évite d’attendre.', 'دائمًا في الموعد. شاشة الانتظار توفّر عليّ الوقوف.') },
  { name: 'Ayoub T.', stars: 5, text: L('Club membership paid for itself in the first month.', 'L’abonnement Club s’est rentabilisé dès le premier mois.', 'اشتراك النادي غطّى تكلفته من الشهر الأول.') },
  { name: 'Zakaria M.', stars: 5, text: L('Ilyas fixed a bad cut from somewhere else. Magician.', 'Ilyas a rattrapé une mauvaise coupe faite ailleurs. Un magicien.', 'إلياس أصلح قصّة سيئة من مكان آخر. ساحر.') },
];

export const FAQ = [
  { q: L('Can I walk in without a booking?', 'Puis-je venir sans réservation ?', 'هل يمكنني الحضور بدون حجز؟'),
    a: L('Yes. Join the live queue from your phone and we’ll tell you roughly when your chair is free.', 'Oui. Rejoignez la file d’attente depuis votre téléphone et nous vous indiquons à peu près quand votre fauteuil est libre.', 'نعم. انضم إلى قائمة الانتظار من هاتفك وسنخبرك تقريبًا متى يصبح كرسيك جاهزًا.') },
  { q: L('Can I cancel or move my appointment?', 'Puis-je annuler ou déplacer mon rendez-vous ?', 'هل يمكنني إلغاء الموعد أو تغييره؟'),
    a: L('Any time up to 2 hours before, from “My bookings” — no fee.', 'À tout moment jusqu’à 2 heures avant, depuis « Mes réservations » — sans frais.', 'في أي وقت حتى ساعتين قبل الموعد من «حجوزاتي» — بدون رسوم.') },
  { q: L('How do the stamps work?', 'Comment fonctionnent les tampons ?', 'كيف تعمل الأختام؟'),
    a: L('You earn one stamp per completed visit. Every 8th cut is free; just give your phone number at the chair.', 'Un tampon par visite terminée. Chaque 8e coupe est offerte ; donnez simplement votre numéro au fauteuil.', 'تحصل على ختم لكل زيارة مكتملة. القصّة الثامنة مجانية؛ يكفي أن تعطي رقم هاتفك.') },
  { q: L('Do you take cards?', 'Acceptez-vous les cartes ?', 'هل تقبلون البطاقات؟'),
    a: L('Cards, cash and mobile wallets — you pay in the shop after your service.', 'Cartes, espèces et portefeuilles mobiles — vous payez en boutique après le service.', 'بطاقات ونقدًا ومحافظ إلكترونية — الدفع في المحل بعد الخدمة.') },
];

export const AMENITIES = [
  { icon: 'coffee', label: L('Free mint tea', 'Thé à la menthe offert', 'شاي بالنعناع مجاني') },
  { icon: 'wifi', label: L('Fast Wi-Fi', 'Wi-Fi rapide', 'واي فاي سريع') },
  { icon: 'card', label: L('Cards & cash', 'Cartes & espèces', 'بطاقات ونقدًا') },
  { icon: 'baby', label: L('Kids welcome', 'Enfants bienvenus', 'الأطفال مرحّب بهم') },
];

// Photos live in img/ and are listed here once they exist; until then the site draws its own art.
const SET = (...ids) => new Set(ids);
export const PHOTOS = {
  hero: 4,                                   // img/hero-1.webp … hero-4.webp (rotating, 4:5)
  shop: false,
  barber: SET('younes', 'anas', 'ilyas', 'soufiane'),    // img/barber-<id>.webp
  style: SET('skinfade', 'taper', 'classic', 'crop', 'long', 'beardfull'), // img/style-<id>.webp
  product: SET('clay', 'pomade', 'salt', 'oil', 'balm', 'after', 'shampoo', 'comb'), // img/prod-<id>.webp
};
export const photoOf = {
  hero: () => Array.from({ length: PHOTOS.hero || 0 }, (_, i) => `/demos/barber/img/hero-${i + 1}.webp`),
  shop: () => (PHOTOS.shop ? '/demos/barber/img/shop.webp' : ''),
  barber: (id) => (PHOTOS.barber.has(id) ? `/demos/barber/img/barber-${id}.webp` : ''),
  style: (id) => (PHOTOS.style.has(id) ? `/demos/barber/img/style-${id}.webp` : ''),
  product: (id) => (PHOTOS.product.has(id) ? `/demos/barber/img/prod-${id}.webp` : ''),
};

// Which style photo illustrates which service card (the others keep their drawn icon).
export const SERVICE_PHOTO = { fade: 'skinfade', classic: 'classic', taper: 'taper', buzz: 'crop', scissor: 'long', cutbeard: 'beardfull', beardsculpt: 'beardfull' };
