// LALLA Beauty House — demo data. Everything here is illustrative (a sales demo by MBN DEV):
// the centre, its team, prices and reviews are fictional.

/** Localised string helper: [en, fr, ar] → { en, fr, ar } */
const L = (en, fr, ar) => ({ en, fr, ar });

export const SHOP = {
  name: 'LALLA',
  full: 'LALLA Beauty House',
  city: L('Casablanca', 'Casablanca', 'الدار البيضاء'),
  address: L('14 Rue Abou Al Mahassine, Gauthier, Casablanca', '14 Rue Abou Al Mahassine, Gauthier, Casablanca', '14 زنقة أبو المحاسن، كوتيي، الدار البيضاء'),
  phone: '+212 522 00 00 00',
  currency: 'MAD',
  timezone: 'Africa/Casablanca',
  // [open, close] in minutes from midnight per weekday (0 = Sunday)
  hours: { 0: [660, 1080], 1: [600, 1200], 2: [600, 1200], 3: [600, 1200], 4: [600, 1200], 5: [600, 1200], 6: [600, 1200] },
  step: 30,             // booking grid, minutes
  lead: 60,             // earliest online booking from now, minutes
  horizon: 21,          // days bookable ahead
  pointsPerMad: 10,     // 1 Glow point for every 10 MAD spent
  pointsForReward: 150, // 150 points = 100 MAD off the next visit
  rewardValue: 100,
  cancelHours: 4,
  promo: { LALLA10: 0.10 },
};

export const CATEGORIES = [
  { id: 'hair', name: L('Hair', 'Cheveux', 'الشعر'), icon: 'sparkles' },
  { id: 'nails', name: L('Nails', 'Ongles', 'الأظافر'), icon: 'gem' },
  { id: 'skin', name: L('Skin & face', 'Visage & peau', 'البشرة والوجه'), icon: 'droplet' },
  { id: 'spa', name: L('Hammam & spa', 'Hammam & spa', 'الحمّام والسبا'), icon: 'flower' },
  { id: 'makeup', name: L('Make-up', 'Maquillage', 'المكياج'), icon: 'heart' },
  { id: 'brows', name: L('Brows & waxing', 'Sourcils & épilation', 'الحواجب وإزالة الشعر'), icon: 'leaf' },
];

// dur = minutes of chair time, price in MAD, art = illustration key (js/art.js).
// A specialist can only perform services from the categories in her `skills`.
export const SERVICES = [
  // ── hair
  { id: 'blowdry', cat: 'hair', dur: 45, price: 100, art: 'hair',
    name: L('Blow-dry & style', 'Brushing & coiffage', 'تجفيف وتصفيف'),
    desc: L('Wash, treatment mist and a smooth or wavy blow-dry that lasts.', 'Shampoing, soin brumisé et brushing lisse ou ondulé qui tient.', 'غسل ومعالج بالرذاذ وتجفيف أملس أو مموّج يدوم.') },
  { id: 'cutstyle', cat: 'hair', dur: 60, price: 180, art: 'hair',
    name: L('Cut & style', 'Coupe & coiffage', 'قصّ وتصفيف'),
    desc: L('Consultation, precision cut tailored to your face and a finished style.', 'Consultation, coupe précise adaptée à votre visage et coiffage.', 'استشارة وقصّ دقيق يناسب وجهك وتصفيف كامل.') },
  { id: 'colour', cat: 'hair', dur: 120, price: 450, art: 'colour', pop: 1,
    name: L('Full colour', 'Coloration complète', 'صبغة كاملة'),
    desc: L('Ammonia-free colour with gloss finish, mask and blow-dry included.', 'Coloration sans ammoniaque, brillance, masque et brushing inclus.', 'صبغة بدون أمونيا مع لمعان وماسك وتجفيف.') },
  { id: 'balayage', cat: 'hair', dur: 180, price: 900, art: 'colour',
    name: L('Balayage & toner', 'Balayage & patine', 'بالاياج وتونر'),
    desc: L('Hand-painted, sun-kissed highlights, toned and finished with a blow-dry.', 'Mèches peintes à la main, patinées et coiffées.', 'خصل مرسومة يدويًا بلمعة الشمس مع تونر وتصفيف.') },
  { id: 'keratin', cat: 'hair', dur: 150, price: 800, art: 'treat',
    name: L('Keratin smoothing', 'Lissage kératine', 'تمليس بالكيراتين'),
    desc: L('Frizz-free, glossy hair for up to three months.', 'Cheveux sans frisottis et brillants jusqu’à trois mois.', 'شعر بدون تجعّد ولامع حتى ثلاثة أشهر.') },
  { id: 'hairmask', cat: 'hair', dur: 45, price: 150, art: 'treat',
    name: L('Argan repair ritual', 'Rituel réparateur à l’argan', 'طقس الأركان للترميم'),
    desc: L('Warm argan scalp massage and a deep repair mask.', 'Massage du cuir chevelu à l’argan tiède et masque réparateur.', 'تدليك فروة الرأس بالأركان الدافئ وماسك ترميم عميق.') },
  { id: 'updo', cat: 'hair', dur: 60, price: 250, art: 'hair',
    name: L('Updo & event hair', 'Chignon & coiffure de fête', 'تسريحة مرفوعة للمناسبات'),
    desc: L('Soft waves, braids or a sleek updo for your evening.', 'Boucles souples, tresses ou chignon sophistiqué pour votre soirée.', 'تموّجات ناعمة أو ضفائر أو تسريحة أنيقة لسهرتك.') },
  // ── nails
  { id: 'manicure', cat: 'nails', dur: 40, price: 100, art: 'nails',
    name: L('Classic manicure', 'Manucure classique', 'مانيكير كلاسيكي'),
    desc: L('Shape, cuticle care, hand massage and polish.', 'Forme, soin des cuticules, massage des mains et vernis.', 'تشكيل وعناية بالجلد وتدليك اليدين مع طلاء.') },
  { id: 'gelmani', cat: 'nails', dur: 60, price: 180, art: 'nails', pop: 1,
    name: L('Gel manicure', 'Manucure gel', 'مانيكير جيل'),
    desc: L('Long-wear gel colour, chip-free for up to three weeks.', 'Couleur gel longue tenue, sans éclats jusqu’à trois semaines.', 'لون جيل طويل الأمد بدون تشقق حتى ثلاثة أسابيع.') },
  { id: 'pedi', cat: 'nails', dur: 60, price: 200, art: 'feet',
    name: L('Spa pedicure', 'Pédicure spa', 'باديكير سبا'),
    desc: L('Warm soak, scrub, callus care, massage and polish.', 'Bain chaud, gommage, soin des callosités, massage et vernis.', 'نقع دافئ وتقشير وعناية بالجلد القاسي وتدليك وطلاء.') },
  { id: 'nailart', cat: 'nails', dur: 90, price: 320, art: 'nails',
    name: L('Nail art & extensions', 'Nail art & extensions', 'فن الأظافر والتطويل'),
    desc: L('Sculpted extensions with hand-painted designs.', 'Extensions sculptées avec motifs peints à la main.', 'أظافر مطوّلة منحوتة برسومات يدوية.') },
  { id: 'manipedi', cat: 'nails', dur: 100, price: 280, art: 'nails', pop: 1,
    name: L('Mani + Pedi', 'Mani + Pédi', 'مانيكير + باديكير'),
    desc: L('Gel manicure and spa pedicure back-to-back. Saves 100 MAD.', 'Manucure gel et pédicure spa enchaînées. Économisez 100 MAD.', 'مانيكير جيل وباديكير سبا متتاليان. توفّرين 100 درهم.') },
  // ── skin
  { id: 'facial', cat: 'skin', dur: 60, price: 350, art: 'skin', pop: 1,
    name: L('Signature glow facial', 'Soin éclat signature', 'عناية الإشراق الخاصة'),
    desc: L('Deep cleanse, steam, massage and a rose-clay mask for radiant skin.', 'Nettoyage profond, vapeur, massage et masque à l’argile rose.', 'تنظيف عميق وبخار وتدليك وماسك الطين الوردي لبشرة مشرقة.') },
  { id: 'hydrafacial', cat: 'skin', dur: 75, price: 450, art: 'skin',
    name: L('Deep-cleanse & hydration', 'Nettoyage profond & hydratation', 'تنظيف عميق وترطيب'),
    desc: L('Exfoliation, extraction and a hydration infusion for plump skin.', 'Exfoliation, extraction et infusion hydratante.', 'تقشير وتنقية وترطيب بالتسريب لبشرة ممتلئة.') },
  { id: 'peel', cat: 'skin', dur: 45, price: 300, art: 'skin',
    name: L('Gentle enzyme peel', 'Peeling enzymatique doux', 'تقشير إنزيمي لطيف'),
    desc: L('Refines texture and brightens, with no downtime.', 'Affine le grain de peau et illumine, sans éviction.', 'يصفّي ملمس البشرة ويفتّحها دون فترة نقاهة.') },
  { id: 'eyecare', cat: 'skin', dur: 30, price: 150, art: 'skin',
    name: L('Eye contour care', 'Soin contour des yeux', 'عناية بمحيط العينين'),
    desc: L('Cooling massage and a de-puffing mask.', 'Massage rafraîchissant et masque anti-poches.', 'تدليك منعش وماسك لتقليل الانتفاخ.') },
  // ── hammam & spa
  { id: 'hammam', cat: 'spa', dur: 60, price: 250, art: 'spa', pop: 1,
    name: L('Hammam beldi', 'Hammam beldi', 'حمّام بلدي'),
    desc: L('Steam, black soap, kessa scrub and a rhassoul rinse in our private hammam.', 'Vapeur, savon noir, gommage au kessa et rinçage au rhassoul.', 'بخار وصابون بلدي وتقشير بالكيس وغسول الغاسول في حمّامنا الخاص.') },
  { id: 'gommage', cat: 'spa', dur: 105, price: 480, art: 'spa', pop: 1,
    name: L('Hammam & argan massage', 'Hammam & massage à l’argan', 'حمّام ومساج بالأركان'),
    desc: L('The full ritual: hammam beldi followed by a 45-minute argan oil massage.', 'Le rituel complet : hammam beldi puis massage à l’huile d’argan de 45 minutes.', 'الطقس الكامل: حمّام بلدي ثم مساج بزيت الأركان لمدة 45 دقيقة.') },
  { id: 'massage', cat: 'spa', dur: 60, price: 350, art: 'massage',
    name: L('Relaxing massage', 'Massage relaxant', 'مساج للاسترخاء'),
    desc: L('Full-body massage with warm oils to release tension.', 'Massage du corps avec huiles chaudes pour relâcher les tensions.', 'مساج للجسم بزيوت دافئة لتخفيف التوتر.') },
  { id: 'massage90', cat: 'spa', dur: 90, price: 480, art: 'massage',
    name: L('Aromatherapy massage', 'Massage aromathérapie', 'مساج بالعلاج العطري'),
    desc: L('A slow, deep 90-minute massage with essential oils.', 'Un massage profond de 90 minutes aux huiles essentielles.', 'مساج عميق وبطيء لمدة 90 دقيقة بالزيوت العطرية.') },
  // ── make-up
  { id: 'makeupday', cat: 'makeup', dur: 45, price: 250, art: 'makeup',
    name: L('Day make-up', 'Maquillage de jour', 'مكياج نهاري'),
    desc: L('A fresh, natural look that lasts all day.', 'Un look frais et naturel qui tient toute la journée.', 'إطلالة منعشة وطبيعية تدوم طوال اليوم.') },
  { id: 'makeupevening', cat: 'makeup', dur: 60, price: 400, art: 'makeup', pop: 1,
    name: L('Evening & event make-up', 'Maquillage de soirée', 'مكياج السهرة والمناسبات'),
    desc: L('Sculpted, long-wear glam for weddings, galas and nights out.', 'Un glamour sculpté longue tenue pour mariages, galas et sorties.', 'إطلالة مبهرة طويلة الأمد للأعراس والحفلات والسهرات.') },
  { id: 'bridaltrial', cat: 'makeup', dur: 90, price: 500, art: 'bridal',
    name: L('Bridal make-up trial', 'Essai maquillage mariée', 'تجربة مكياج العروس'),
    desc: L('Find your wedding look together, with photos to keep. Credited on your bridal booking.', 'Trouvons ensemble votre look de mariage, photos à l’appui. Déduit de votre forfait mariée.', 'نحدّد معًا إطلالة زفافك مع صور تحتفظين بها. تُخصم من حجز العروس.') },
  // ── brows & waxing
  { id: 'browshape', cat: 'brows', dur: 30, price: 80, art: 'brows',
    name: L('Brow shaping', 'Restructuration des sourcils', 'تشكيل الحواجب'),
    desc: L('Threading or waxing to the shape that suits you.', 'Fil ou cire pour la forme qui vous va.', 'تشذيب بالخيط أو الشمع بالشكل الذي يناسبك.') },
  { id: 'browlam', cat: 'brows', dur: 60, price: 300, art: 'brows',
    name: L('Brow lamination', 'Brow lift & laminage', 'تصفيف الحواجب (لامينيشن)'),
    desc: L('Fuller, brushed-up brows that hold for six weeks.', 'Des sourcils plus fournis et structurés pendant six semaines.', 'حواجب أكثر كثافة ومرتبة لمدة ستة أسابيع.') },
  { id: 'lashlift', cat: 'brows', dur: 60, price: 300, art: 'lash',
    name: L('Lash lift & tint', 'Rehaussement de cils & teinture', 'رفع الرموش وتلوينها'),
    desc: L('Curled, darker lashes without mascara for up to eight weeks.', 'Cils recourbés et foncés sans mascara jusqu’à huit semaines.', 'رموش مجعّدة وأغمق بدون ماسكارا حتى ثمانية أسابيع.') },
  { id: 'wax', cat: 'brows', dur: 45, price: 180, art: 'wax',
    name: L('Full-leg waxing', 'Épilation jambes complètes', 'إزالة شعر الساقين'),
    desc: L('Gentle warm wax with a soothing aloe finish.', 'Cire tiède douce avec finition apaisante à l’aloe vera.', 'شمع دافئ لطيف مع لمسة مهدّئة بالألوفيرا.') },
];

// Weekly schedule per specialist: weekday (0 = Sunday) → [from, to] minutes, or null when off.
const wk = (...a) => Object.fromEntries(a.map((v, i) => [i, v]));
const FULL = [600, 1200];
export const TEAM = [
  { id: 'salma', name: 'Salma', color: '#c0627f', rating: 4.9, reviews: 241, years: 14,
    role: L('Senior stylist & colourist', 'Coiffeuse coloriste senior', 'مصففة وخبيرة ألوان'),
    skills: ['hair'],
    bio: L('Fourteen years of colour and cutting. Salma’s balayage is the reason clients drive across the city.', 'Quatorze ans de couleur et de coupe. Le balayage de Salma fait traverser la ville à ses clientes.', 'أربع عشرة سنة من الصبغات والقصّ. بالاياج سلمى سبب مجيء زبوناتها من أنحاء المدينة.'),
    week: wk(null, FULL, FULL, FULL, FULL, FULL, FULL) },
  { id: 'meriem', name: 'Meriem', color: '#d68a63', rating: 4.8, reviews: 176, years: 8,
    role: L('Cut & styling', 'Coupe & coiffage', 'قصّ وتصفيف'),
    skills: ['hair'],
    bio: L('Precision cuts, soft blow-dries and event styling with a calm, listening approach.', 'Coupes précises, brushings doux et coiffures de fête, dans l’écoute.', 'قصّات دقيقة وتجفيف ناعم وتسريحات المناسبات بأسلوب هادئ يصغي لك.'),
    week: wk([660, 1080], FULL, null, FULL, FULL, FULL, FULL) },
  { id: 'kenza', name: 'Kenza', color: '#b96aa3', rating: 4.9, reviews: 203, years: 7,
    role: L('Nail artist', 'Nail artiste', 'خبيرة أظافر'),
    skills: ['nails'],
    bio: L('Gel, sculpted extensions and hand-painted art. Bring a picture, leave with it on your nails.', 'Gel, extensions sculptées et nail art peint à la main. Apportez une photo, repartez avec.', 'جيل وأظافر منحوتة وفنّ مرسوم يدويًا. أحضري صورة وغادري بها على أظافرك.'),
    week: wk([660, 1080], FULL, FULL, FULL, null, FULL, FULL) },
  { id: 'imane', name: 'Imane', color: '#6f9a8a', rating: 4.8, reviews: 158, years: 9,
    role: L('Skin therapist & brows', 'Esthéticienne & sourcils', 'أخصائية بشرة وحواجب'),
    skills: ['skin', 'brows'],
    bio: L('Skin-first facials, brow design and lash lifts. Honest advice, never an upsell.', 'Soins visage axés sur la peau, design de sourcils et rehaussement de cils. Des conseils honnêtes.', 'عناية بالوجه تبدأ من البشرة وتصميم الحواجب ورفع الرموش، بنصائح صادقة.'),
    week: wk(null, FULL, FULL, null, FULL, FULL, FULL) },
  { id: 'hajar', name: 'Hajar', color: '#b9895a', rating: 4.9, reviews: 187, years: 11,
    role: L('Hammam & massage therapist', 'Praticienne hammam & massage', 'معالجة حمّام ومساج'),
    skills: ['spa'],
    bio: L('Trained in the traditional hammam. Strong hands, warm voice, and a very good kessa.', 'Formée au hammam traditionnel. Des mains fortes, une voix chaleureuse et un excellent kessa.', 'تدرّبت على الحمّام التقليدي. يدان قويتان وصوت دافئ وكيس ممتاز.'),
    week: wk([660, 1080], FULL, FULL, FULL, FULL, FULL, null) },
  { id: 'zineb', name: 'Zineb', color: '#8a7ab8', rating: 4.7, reviews: 119, years: 5,
    role: L('Massage therapist', 'Praticienne massage', 'معالجة مساج'),
    skills: ['spa'],
    bio: L('Slow, deep massage with essential oils for tired shoulders and tired minds.', 'Un massage lent et profond aux huiles essentielles pour épaules et esprit fatigués.', 'مساج بطيء وعميق بالزيوت العطرية للأكتاف المتعبة والذهن المرهق.'),
    week: wk(null, null, FULL, FULL, FULL, FULL, FULL) },
  { id: 'nada', name: 'Nada', color: '#d46a6a', rating: 4.9, reviews: 264, years: 10,
    role: L('Make-up artist & bridal', 'Maquilleuse & mariées', 'خبيرة مكياج وعرائس'),
    skills: ['makeup', 'brows'],
    bio: L('From natural day looks to full bridal glam. Nada has made over four hundred brides.', 'Du maquillage naturel au glamour de mariée. Nada a maquillé plus de quatre cents mariées.', 'من الإطلالة الطبيعية إلى مكياج العروس الكامل. مكّنت نادية أكثر من أربعمئة عروس.'),
    week: wk([660, 1080], FULL, FULL, FULL, FULL, FULL, FULL) },
];

// "Find your ritual": goal × time → a recommended set of services (all performed by one specialist).
export const FINDER = {
  goal: [
    { id: 'glow', label: L('Glowing skin', 'Peau éclatante', 'بشرة مشرقة') },
    { id: 'relax', label: L('Total relaxation', 'Détente totale', 'استرخاء كامل') },
    { id: 'hair', label: L('Beautiful hair', 'Beaux cheveux', 'شعر جميل') },
    { id: 'nails', label: L('Perfect nails', 'Ongles parfaits', 'أظافر مثالية') },
    { id: 'event', label: L('A big occasion', 'Une grande occasion', 'مناسبة كبيرة') },
  ],
  time: [
    { id: 'quick', label: L('About an hour', 'Environ une heure', 'حوالي ساعة') },
    { id: 'medium', label: L('Two hours', 'Deux heures', 'ساعتان') },
    { id: 'long', label: L('Take my time', 'Prendre mon temps', 'أخذ وقتي كاملًا') },
  ],
};

export const RITUALS = [
  { id: 'glow-quick', goal: 'glow', time: 'quick', services: ['facial'], art: 'skin', name: L('Signature glow', 'Éclat signature', 'الإشراق الخاص'),
    why: L('One hour to reset tired skin: cleanse, steam, massage and a rose-clay mask.', 'Une heure pour relancer une peau fatiguée : nettoyage, vapeur, massage et masque à l’argile rose.', 'ساعة واحدة لإنعاش البشرة المتعبة: تنظيف وبخار وتدليك وماسك الطين الوردي.') },
  { id: 'glow-medium', goal: 'glow', time: 'medium', services: ['hydrafacial', 'browshape'], art: 'skin', name: L('Fresh-face hour & brows', 'Visage frais & sourcils', 'وجه منتعش مع الحواجب'),
    why: L('Deep cleanse and hydration, then brows shaped to frame the glow.', 'Nettoyage profond et hydratation, puis sourcils redessinés pour encadrer l’éclat.', 'تنظيف عميق وترطيب ثم حواجب مشذّبة لإبراز الإشراق.') },
  { id: 'glow-long', goal: 'glow', time: 'long', services: ['facial', 'peel', 'eyecare'], art: 'skin', name: L('The full glow programme', 'Le programme éclat complet', 'برنامج الإشراق الكامل'),
    why: L('Facial, enzyme peel and eye care in one unhurried session. Skin that looks rested.', 'Soin visage, peeling et contour des yeux en une séance sans hâte.', 'عناية وجه وتقشير وعناية بالعينين في جلسة هادئة. بشرة تبدو مرتاحة.') },
  { id: 'relax-quick', goal: 'relax', time: 'quick', services: ['hammam'], art: 'spa', name: L('Hammam beldi', 'Hammam beldi', 'حمّام بلدي'),
    why: L('Steam, black soap and a kessa scrub: the Moroccan reset, in under an hour.', 'Vapeur, savon noir et kessa : la remise à zéro marocaine en moins d’une heure.', 'بخار وصابون بلدي وكيس: إعادة الضبط المغربية في أقل من ساعة.') },
  { id: 'relax-medium', goal: 'relax', time: 'medium', services: ['gommage'], art: 'spa', name: L('Hammam & argan massage', 'Hammam & massage à l’argan', 'حمّام ومساج بالأركان'),
    why: L('Our most booked ritual: hammam followed by a warm argan oil massage.', 'Notre rituel le plus réservé : hammam puis massage à l’huile d’argan tiède.', 'طقسنا الأكثر حجزًا: حمّام ثم مساج بزيت الأركان الدافئ.') },
  { id: 'relax-long', goal: 'relax', time: 'long', services: ['hammam', 'massage90'], art: 'massage', name: L('The slow afternoon', 'L’après-midi sans horloge', 'عصر بلا ساعة'),
    why: L('Hammam beldi and a 90-minute aromatherapy massage. Phone off, mint tea on.', 'Hammam beldi et massage aromathérapie de 90 minutes. Téléphone éteint, thé à la menthe.', 'حمّام بلدي ومساج 90 دقيقة بالعلاج العطري. الهاتف مغلق والشاي بالنعناع حاضر.') },
  { id: 'hair-quick', goal: 'hair', time: 'quick', services: ['blowdry'], art: 'hair', name: L('The perfect blow-dry', 'Le brushing parfait', 'التجفيف المثالي'),
    why: L('Wash, treatment mist and a blow-dry that holds, ideal before any plan.', 'Shampoing, soin brumisé et brushing tenue, idéal avant n’importe quel programme.', 'غسل ورذاذ معالج وتجفيف يدوم، مثالي قبل أي موعد.') },
  { id: 'hair-medium', goal: 'hair', time: 'medium', services: ['cutstyle', 'hairmask'], art: 'hair', name: L('Cut, repair & style', 'Coupe, réparation & coiffage', 'قصّ وترميم وتصفيف'),
    why: L('A precision cut, then an argan repair ritual to bring back softness.', 'Une coupe précise puis un rituel à l’argan pour retrouver la douceur.', 'قصّ دقيق ثم طقس الأركان لاستعادة النعومة.') },
  { id: 'hair-long', goal: 'hair', time: 'long', services: ['colour', 'hairmask', 'blowdry'], art: 'colour', name: L('Colour, care & finish', 'Couleur, soin & finition', 'لون وعناية ولمسة أخيرة'),
    why: L('Full colour, an argan mask and a polished blow-dry. You leave transformed.', 'Coloration complète, masque à l’argan et brushing soigné. Vous repartez transformée.', 'صبغة كاملة وماسك الأركان وتجفيف أنيق. تغادرين وقد تغيّرتِ.') },
  { id: 'nails-quick', goal: 'nails', time: 'quick', services: ['gelmani'], art: 'nails', name: L('Gel manicure', 'Manucure gel', 'مانيكير جيل'),
    why: L('Chip-free colour for up to three weeks, in about an hour.', 'Une couleur sans éclats jusqu’à trois semaines, en une heure environ.', 'لون بدون تشقق حتى ثلاثة أسابيع، في حوالي ساعة.') },
  { id: 'nails-medium', goal: 'nails', time: 'medium', services: ['manipedi'], art: 'nails', name: L('Mani + Pedi', 'Mani + Pédi', 'مانيكير + باديكير'),
    why: L('Hands and feet done together, the best value for a polished look.', 'Mains et pieds ensemble, le meilleur rapport pour un look soigné.', 'اليدان والقدمان معًا، أفضل قيمة لإطلالة أنيقة.') },
  { id: 'nails-long', goal: 'nails', time: 'long', services: ['manipedi', 'nailart'], art: 'nails', name: L('Mani, pedi & nail art', 'Mani, pédi & nail art', 'مانيكير وباديكير وفنّ الأظافر'),
    why: L('The full set: gel hands and feet, then hand-painted art on top.', 'Le grand jeu : mains et pieds en gel, puis nail art peint à la main.', 'المجموعة الكاملة: يدان وقدمان بالجيل ثم رسومات يدوية فوقها.') },
  { id: 'event-quick', goal: 'event', time: 'quick', services: ['makeupday'], art: 'makeup', name: L('Day make-up', 'Maquillage de jour', 'مكياج نهاري'),
    why: L('A fresh, natural look for a lunch, a meeting or a photo shoot.', 'Un look frais et naturel pour un déjeuner, une réunion ou un shooting.', 'إطلالة منعشة وطبيعية لغداء أو اجتماع أو جلسة تصوير.') },
  { id: 'event-medium', goal: 'event', time: 'medium', services: ['makeupevening', 'browshape'], art: 'makeup', name: L('Evening glam & brows', 'Glamour du soir & sourcils', 'مكياج السهرة والحواجب'),
    why: L('Brows shaped first, then a sculpted evening look that lasts until the last dance.', 'Sourcils redessinés puis un maquillage sculpté qui tient jusqu’à la dernière danse.', 'حواجب مشذّبة أولًا ثم إطلالة سهرة منحوتة تدوم حتى آخر رقصة.') },
  { id: 'event-long', goal: 'event', time: 'long', services: ['bridaltrial'], art: 'bridal', quote: true, name: L('Bridal & big events', 'Mariées & grands événements', 'العرائس والمناسبات الكبرى'),
    why: L('Weddings, henna nights and parties are planned together. Request a quote and we’ll build your day.', 'Mariages, soirées henné et fêtes se préparent ensemble. Demandez un devis, nous bâtirons votre journée.', 'الأعراس وليالي الحنّاء والحفلات نخطّط لها معًا. اطلبي عرض سعر وسنصمّم يومك.') },
];

export const BRIDAL = [
  { id: 'bride', from: 1900, name: L('Bride-to-be', 'Future mariée', 'عروس المستقبل'),
    items: [L('Make-up trial & hair trial', 'Essai maquillage & coiffure', 'تجربة مكياج وتسريحة'), L('Hammam beldi & argan massage', 'Hammam beldi & massage à l’argan', 'حمّام بلدي ومساج بالأركان'), L('Gel mani-pedi', 'Mani-pédi gel', 'مانيكير وباديكير جيل')] },
  { id: 'wedding', from: 4200, best: 1, name: L('Wedding day', 'Jour J', 'يوم الزفاف'),
    items: [L('Bridal make-up & hair, at the house or here', 'Maquillage & coiffure de mariée, à domicile ou ici', 'مكياج وتسريحة العروس في البيت أو عندنا'), L('Two touch-ups through the day', 'Deux retouches dans la journée', 'تعديلان خلال اليوم'), L('Mother-of-the-bride styling included', 'Coiffure de la mère de la mariée incluse', 'تسريحة أم العروس مشمولة')] },
  { id: 'party', from: 650, name: L('Henna night & party', 'Soirée henné & fête', 'ليلة الحنّاء والحفلات'),
    items: [L('Group make-up & hairstyling', 'Maquillage & coiffure en groupe', 'مكياج وتسريحات جماعية'), L('Priority slots for 4 to 12 guests', 'Créneaux prioritaires de 4 à 12 invitées', 'مواعيد أولوية من 4 إلى 12 مدعوة'), L('Mint tea & pastries for the group', 'Thé à la menthe & pâtisseries pour le groupe', 'شاي بالنعناع وحلويات للمجموعة')] },
];
export const EVENT_TYPES = [
  { id: 'wedding', label: L('Wedding', 'Mariage', 'زفاف') },
  { id: 'engagement', label: L('Engagement', 'Fiançailles', 'خطوبة') },
  { id: 'henna', label: L('Henna night', 'Soirée henné', 'ليلة الحنّاء') },
  { id: 'party', label: L('Party / group', 'Fête / groupe', 'حفلة / مجموعة') },
];

export const PLANS = [
  { id: 'petal', price: 249, name: L('Petal', 'Pétale', 'بتلة'),
    perks: [L('1 express treatment a month (nails or brows)', '1 soin express par mois (ongles ou sourcils)', 'جلسة سريعة شهريًا (أظافر أو حواجب)'), L('10% off products', '10 % sur les produits', 'خصم 10% على المنتجات'), L('Birthday gift', 'Cadeau d’anniversaire', 'هدية عيد الميلاد')] },
  { id: 'bloom', price: 449, best: 1, name: L('Bloom', 'Bloom', 'بلوم'),
    perks: [L('1 facial or hair treatment + 1 hammam a month', '1 soin visage ou cheveux + 1 hammam par mois', 'جلسة وجه أو شعر + حمّام شهريًا'), L('Priority booking', 'Réservation prioritaire', 'أولوية الحجز'), L('15% off products', '15 % sur les produits', 'خصم 15% على المنتجات')] },
  { id: 'radiance', price: 790, name: L('Radiance', 'Radiance', 'رادينس'),
    perks: [L('2 treatments + hammam & massage a month', '2 soins + hammam & massage par mois', 'جلستان + حمّام ومساج شهريًا'), L('Same-day guarantee', 'Garantie le jour même', 'ضمان الحجز في اليوم نفسه'), L('20% off products and a gift each season', '20 % sur les produits et un cadeau par saison', 'خصم 20% على المنتجات وهدية كل موسم')] },
];

export const GIFT_AMOUNTS = [200, 300, 500, 1000];
export const GIFT_DESIGNS = [
  { id: 'rose', name: L('Rose', 'Rose', 'وردي'), a: '#d98ca1', b: '#8e3b59' },
  { id: 'sage', name: L('Sage', 'Sauge', 'مريمية'), a: '#8aa38b', b: '#3f5e4d' },
  { id: 'gold', name: L('Gold', 'Or', 'ذهبي'), a: '#d9b36a', b: '#8a6420' },
];

export const PRODUCTS = [
  { id: 'arganoil', price: 180, art: 'dropper', tint: '#c98c3a', name: L('Pure argan oil', 'Huile d’argan pure', 'زيت الأركان الصافي'), note: L('Hair & skin · 50 ml', 'Cheveux & peau · 50 ml', 'للشعر والبشرة · 50 مل') },
  { id: 'repairmask', price: 160, art: 'jar', tint: '#b9788a', name: L('Repair hair mask', 'Masque réparateur', 'ماسك ترميم الشعر'), note: L('Deep repair · 250 ml', 'Réparation intense · 250 ml', 'ترميم عميق · 250 مل') },
  { id: 'rosewater', price: 90, art: 'bottle', tint: '#e0a3b4', name: L('Rose water mist', 'Brume à l’eau de rose', 'رذاذ ماء الورد'), note: L('Fresh & calming · 100 ml', 'Fraîche & apaisante · 100 ml', 'منعش ومهدّئ · 100 مل') },
  { id: 'serum', price: 240, art: 'dropper', tint: '#9fbfae', name: L('Glow face serum', 'Sérum éclat visage', 'سيروم الإشراق للوجه'), note: L('Brightening · 30 ml', 'Illuminateur · 30 ml', 'للتفتيح · 30 مل') },
  { id: 'handcream', price: 85, art: 'tube', tint: '#d9a98f', name: L('Nourishing hand cream', 'Crème mains nourrissante', 'كريم اليدين المغذّي'), note: L('Shea & almond · 75 ml', 'Karité & amande · 75 ml', 'شيا ولوز · 75 مل') },
  { id: 'blacksoap', price: 70, art: 'tin', tint: '#5b4a3a', name: L('Black soap & kessa set', 'Coffret savon noir & kessa', 'طقم صابون بلدي وكيس'), note: L('The hammam at home', 'Le hammam à la maison', 'الحمّام في البيت') },
  { id: 'polish', price: 75, art: 'bottle', tint: '#c0627f', name: L('Gel-finish nail polish', 'Vernis effet gel', 'طلاء أظافر بلمسة جيل'), note: L('Long-wear colour · 12 ml', 'Couleur longue tenue · 12 ml', 'لون طويل الأمد · 12 مل') },
  { id: 'bodyoil', price: 150, art: 'bottle', tint: '#c9a24d', name: L('Shimmer body oil', 'Huile corps irisée', 'زيت الجسم اللامع'), note: L('After hammam · 100 ml', 'Après hammam · 100 ml', 'بعد الحمّام · 100 مل') },
];

export const REVIEWS = [
  { name: 'Salma R.', stars: 5, text: L('The hammam and massage ritual is the best two hours of my month. Hajar is a magician.', 'Le rituel hammam et massage, ce sont les deux meilleures heures de mon mois. Hajar est magicienne.', 'طقس الحمّام والمساج أجمل ساعتين في شهري. هاجر ساحرة.') },
  { name: 'Hind B.', stars: 5, text: L('Nada did my wedding make-up and I looked like myself, only better. Booking was effortless.', 'Nada m’a maquillée pour mon mariage, j’étais moi-même en mieux. La réservation était simple.', 'نادية وضّبت مكياج زفافي وبدوت كنفسي لكن أجمل. والحجز كان سهلًا.') },
  { name: 'Yasmine L.', stars: 5, text: L('Kenza’s gel nails lasted three weeks without a chip. I’m a regular now.', 'Les ongles en gel de Kenza ont tenu trois semaines sans un éclat. Je suis devenue une habituée.', 'أظافر كنزة بالجيل صمدت ثلاثة أسابيع دون تشقق. صرت زبونة دائمة.') },
  { name: 'Nouha T.', stars: 4, text: L('Salma fixed a colour disaster from another salon. Calm, honest and brilliant.', 'Salma a rattrapé une couleur ratée ailleurs. Calme, honnête et brillante.', 'سلمى أصلحت صبغة فاشلة من صالون آخر. هادئة وصادقة ومبدعة.') },
  { name: 'Rania K.', stars: 5, text: L('A women-only space where I can relax completely. The mint tea is a bonus.', 'Un espace réservé aux femmes où je me détends complètement. Le thé à la menthe est un plus.', 'مكان للنساء فقط أرتاح فيه تمامًا. وشاي النعناع إضافة جميلة.') },
  { name: 'Imane Z.', stars: 5, text: L('Imane’s facial gave me real results, not a sales pitch. My skin has never looked better.', 'Le soin d’Imane m’a donné de vrais résultats, sans discours commercial. Ma peau n’a jamais été aussi belle.', 'عناية إيمان أعطتني نتائج حقيقية بدون ترويج. بشرتي لم تكن أجمل من قبل.') },
];

export const FAQ = [
  { q: L('Is it a women-only space?', 'Est-ce un espace réservé aux femmes ?', 'هل المكان للنساء فقط؟'),
    a: L('Yes. Our team and our rooms are entirely for women, with private cabins for hammam, massage and make-up.', 'Oui. Notre équipe et nos salles sont entièrement dédiées aux femmes, avec des cabines privées pour le hammam, le massage et le maquillage.', 'نعم. فريقنا وقاعاتنا مخصّصة للنساء بالكامل مع غرف خاصة للحمّام والمساج والمكياج.') },
  { q: L('Can I cancel or move my appointment?', 'Puis-je annuler ou déplacer mon rendez-vous ?', 'هل يمكنني إلغاء الموعد أو تغييره؟'),
    a: L('Any time up to 4 hours before, from “My bookings”, at no cost.', 'À tout moment jusqu’à 4 heures avant, depuis « Mes réservations », sans frais.', 'في أي وقت حتى 4 ساعات قبل الموعد من «حجوزاتي» دون رسوم.') },
  { q: L('How do Glow points work?', 'Comment fonctionnent les points Glow ?', 'كيف تعمل نقاط Glow؟'),
    a: L('You earn 1 point for every 10 MAD you spend. At 150 points you get 100 MAD off your next visit.', 'Vous gagnez 1 point pour 10 MAD dépensés. À 150 points, 100 MAD de remise sur votre prochaine visite.', 'تحصلين على نقطة لكل 10 دراهم. عند 150 نقطة تحصلين على خصم 100 درهم في زيارتك القادمة.') },
  { q: L('Do you do weddings and groups?', 'Faites-vous les mariages et les groupes ?', 'هل تقدّمون خدمات الأعراس والمجموعات؟'),
    a: L('Yes. Send a request in the Bridal & events section and we’ll prepare a quote within one working day.', 'Oui. Envoyez une demande dans la section Mariées & événements, nous préparons un devis sous un jour ouvré.', 'نعم. أرسلي طلبًا في قسم العرائس والمناسبات وسنجهّز لك عرض سعر خلال يوم عمل.') },
  { q: L('How do I pay?', 'Comment payer ?', 'كيف أدفع؟'),
    a: L('Cards, cash and mobile wallets, in the centre after your treatment.', 'Cartes, espèces et portefeuilles mobiles, au centre après votre soin.', 'بطاقات ونقدًا ومحافظ إلكترونية في المركز بعد جلستك.') },
];

export const AMENITIES = [
  { icon: 'heart', label: L('Women-only space', 'Espace réservé aux femmes', 'مكان للنساء فقط') },
  { icon: 'coffee', label: L('Mint tea & pastries', 'Thé à la menthe & pâtisseries', 'شاي بالنعناع وحلويات') },
  { icon: 'wifi', label: L('Fast Wi-Fi', 'Wi-Fi rapide', 'واي فاي سريع') },
  { icon: 'card', label: L('Cards & cash', 'Cartes & espèces', 'بطاقات ونقدًا') },
];

// Photos live in img/ and are listed here once they exist; until then the site draws its own art.
const SET = (...ids) => new Set(ids);
export const PHOTOS = {
  hero: 0,        // img/hero-1.webp … hero-N.webp (rotating, 4:5)
  team: SET(),    // img/team-<id>.webp
  service: SET(), // img/svc-<key>.webp (see SERVICE_PHOTO for which services share a photo)
  product: SET(), // img/prod-<id>.webp
};
// Several services share one photo.
export const SERVICE_PHOTO = {
  blowdry: 'blowdry', cutstyle: 'blowdry', updo: 'blowdry', colour: 'colour', balayage: 'colour', keratin: 'hairtreat', hairmask: 'hairtreat',
  manicure: 'gelnails', gelmani: 'gelnails', manipedi: 'nailart', nailart: 'nailart', pedi: 'pedicure',
  facial: 'facial', hydrafacial: 'facial', peel: 'facial', eyecare: 'facial', hammam: 'hammam', gommage: 'hammam', massage: 'massage', massage90: 'massage',
  makeupday: 'makeupday', makeupevening: 'makeupevent', bridaltrial: 'makeupevent', browshape: 'brows', browlam: 'brows', lashlift: 'brows', wax: 'wax',
};
export const photoOf = {
  hero: () => Array.from({ length: PHOTOS.hero || 0 }, (_, i) => `/demos/beauty/img/hero-${i + 1}.webp`),
  team: (id) => (PHOTOS.team.has(id) ? `/demos/beauty/img/team-${id}.webp` : ''),
  service: (id) => { const k = SERVICE_PHOTO[id]; return k && PHOTOS.service.has(k) ? `/demos/beauty/img/svc-${k}.webp` : ''; },
  product: (id) => (PHOTOS.product.has(id) ? `/demos/beauty/img/prod-${id}.webp` : ''),
};
