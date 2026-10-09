// NOUR Coffee Atelier — demo data. Everything here is illustrative (a sales demo by MBN DEV):
// the café, its menu, prices and events are fictional.

/** Localised string helper: [en, fr, ar] → { en, fr, ar } */
const L = (en, fr, ar) => ({ en, fr, ar });

export const CAFE = {
  name: 'NOUR',
  full: 'NOUR Coffee Atelier',
  city: L('Casablanca', 'Casablanca', 'الدار البيضاء'),
  address: L('12 Rue des Orangers, Maârif, Casablanca', '12 Rue des Orangers, Maârif, Casablanca', '12 زنقة البرتقال، المعاريف، الدار البيضاء'),
  mapsQuery: 'Maarif Casablanca',
  phone: '+212 522 00 00 00',
  currency: 'MAD',
  timezone: 'Africa/Casablanca',
  // minutes from midnight per weekday (0 = Sunday)
  hours: {
    0: [510, 1380], 1: [450, 1320], 2: [450, 1320], 3: [450, 1320], 4: [450, 1320], 5: [450, 1380], 6: [510, 1380],
  },
  deliveryFee: 15,
  deliveryMin: 80,
  stampsForReward: 9,
  promo: { HELLO10: 0.10, NOUR20: 0.20 },
};

// Liquid palette for the drink renderer (side view of a glass).
export const INK = {
  espresso: '#3a2215', crema: '#b36a2c', milk: '#f1e6d4', oat: '#ead9bd', almond: '#f0e2cc', lactosefree: '#f4ead9',
  foam: '#fcf8f1', water: '#6b4429', ice: 'rgba(255,255,255,0.55)', coldbrew: '#2b1a10', tonic: '#efe9cf',
  orange: '#f4a43c', chocolate: '#5a321d', matcha: '#86ad55', chai: '#c68a55', tea: '#b9762a', condensed: '#f3dfae',
  syrup: '#c98b3a', cream: '#fff7ea', lemon: '#f1e6a0',
};

/*
  Menu. kind: drink → rendered as a glass from `layers` (bottom → top, fractions of the fill);
  food → rendered from `art`. `opts` lists the customiser groups that apply.
  Tags: v vegan · gf gluten-free · df dairy-free · sig signature · new.
*/
export const CATEGORIES = [
  { id: 'espresso', name: L('Espresso bar', 'Bar à espresso', 'بار الإسبريسو') },
  { id: 'slow', name: L('Slow & filter', 'Filtre & méthodes douces', 'القهوة المقطّرة') },
  { id: 'cold', name: L('Cold', 'Glacé', 'مشروبات باردة') },
  { id: 'notcoffee', name: L('Not coffee', 'Sans café', 'بدون قهوة') },
  { id: 'bakery', name: L('Bakery', 'Viennoiserie', 'المخبوزات') },
  { id: 'brunch', name: L('Brunch', 'Brunch', 'برانش') },
];

export const MENU = [
  // ── Espresso bar
  { id: 'esp', cat: 'espresso', kind: 'drink', price: 16, kcal: 5, tags: ['v', 'gf', 'df'], cup: 'demi',
    name: L('Espresso', 'Espresso', 'إسبريسو'), desc: L('Double shot of today’s espresso, 36 g in 28 s.', 'Double shot de l’espresso du jour, 36 g en 28 s.', 'جرعة مزدوجة من إسبريسو اليوم، 36 غ في 28 ثانية.'),
    layers: [['espresso', 0.8], ['crema', 0.2]], opts: ['shots', 'sugar'] },
  { id: 'cortado', cat: 'espresso', kind: 'drink', price: 22, kcal: 60, tags: ['gf'], cup: 'gibraltar',
    name: L('Cortado', 'Cortado', 'كورتادو'), desc: L('Espresso cut with the same amount of silky milk.', 'Espresso coupé d’autant de lait soyeux.', 'إسبريسو مع نفس الكمية من الحليب الناعم.'),
    layers: [['espresso', 0.45], ['milk', 0.45], ['foam', 0.1]], opts: ['milk', 'shots', 'sugar'] },
  { id: 'flat', cat: 'espresso', kind: 'drink', price: 28, kcal: 110, tags: ['gf'], cup: 'cup',
    name: L('Flat white', 'Flat white', 'فلات وايت'), desc: L('Double ristretto, thin velvet milk. Our most ordered drink.', 'Double ristretto, lait velours fin. Notre boisson la plus commandée.', 'ريستريتو مزدوج وحليب مخملي رقيق. المشروب الأكثر طلباً.'),
    layers: [['espresso', 0.3], ['milk', 0.62], ['foam', 0.08]], opts: ['size', 'milk', 'shots', 'syrup', 'sugar'] },
  { id: 'capp', cat: 'espresso', kind: 'drink', price: 26, kcal: 120, tags: ['gf'], cup: 'cup',
    name: L('Cappuccino', 'Cappuccino', 'كابتشينو'), desc: L('Espresso, steamed milk and a deep cap of foam.', 'Espresso, lait chaud et une belle couche de mousse.', 'إسبريسو وحليب مبخّر وطبقة كثيفة من الرغوة.'),
    layers: [['espresso', 0.28], ['milk', 0.37], ['foam', 0.35]], opts: ['size', 'milk', 'shots', 'syrup', 'sugar'] },
  { id: 'latte', cat: 'espresso', kind: 'drink', price: 28, kcal: 150, tags: ['gf'], cup: 'glass',
    name: L('Caffè latte', 'Caffè latte', 'كافيه لاتيه'), desc: L('Mellow, milky, made for slow mornings.', 'Doux et lacté, pour les matins tranquilles.', 'ناعم وغني بالحليب، لصباح هادئ.'),
    layers: [['espresso', 0.2], ['milk', 0.65], ['foam', 0.15]], opts: ['size', 'milk', 'shots', 'syrup', 'sugar', 'temp'] },
  { id: 'spanish', cat: 'espresso', kind: 'drink', price: 32, kcal: 210, tags: ['gf', 'sig'], cup: 'glass',
    name: L('Spanish latte', 'Latte espagnol', 'لاتيه إسباني'), desc: L('Condensed milk, double espresso, a pinch of sea salt.', 'Lait concentré, double espresso, une pincée de fleur de sel.', 'حليب مكثّف وإسبريسو مزدوج ورشة ملح بحري.'),
    layers: [['condensed', 0.14], ['espresso', 0.22], ['milk', 0.52], ['foam', 0.12]], opts: ['size', 'milk', 'shots', 'temp'] },
  { id: 'mocha', cat: 'espresso', kind: 'drink', price: 32, kcal: 260, tags: ['gf'], cup: 'glass',
    name: L('Mocha', 'Moka', 'موكا'), desc: L('70% dark chocolate melted into espresso and milk.', 'Chocolat noir 70 % fondu dans l’espresso et le lait.', 'شوكولاتة داكنة 70% مذابة في الإسبريسو والحليب.'),
    layers: [['chocolate', 0.18], ['espresso', 0.2], ['milk', 0.5], ['cream', 0.12]], opts: ['size', 'milk', 'shots', 'temp'] },
  // ── Slow & filter
  { id: 'v60', cat: 'slow', kind: 'drink', price: 35, kcal: 5, tags: ['v', 'gf', 'df'], cup: 'carafe', origin: true,
    name: L('V60 of the day', 'V60 du jour', 'V60 اليوم'), desc: L('Hand-poured single origin. Ask us what’s on the bar.', 'Origine unique versée à la main. Demandez ce qu’il y a au bar.', 'قهوة أحادية المصدر تُصبّ يدوياً. اسألنا عن قهوة اليوم.'),
    layers: [['water', 1]], opts: ['bean'] },
  { id: 'aero', cat: 'slow', kind: 'drink', price: 35, kcal: 5, tags: ['v', 'gf', 'df'], cup: 'cup', origin: true,
    name: L('AeroPress', 'AeroPress', 'إيروبريس'), desc: L('Full, clean and sweet. Brewed to order in 2 minutes.', 'Rond, net et sucré. Préparé à la minute en 2 minutes.', 'كامل ونظيف وحلو. يُحضّر عند الطلب في دقيقتين.'),
    layers: [['water', 1]], opts: ['bean'] },
  { id: 'batch', cat: 'slow', kind: 'drink', price: 20, kcal: 5, tags: ['v', 'gf', 'df'], cup: 'mug',
    name: L('Batch brew', 'Café filtre', 'قهوة الفلتر'), desc: L('Our house filter, ready the second you walk in.', 'Notre filtre maison, prêt dès que vous entrez.', 'قهوة الفلتر الخاصة بنا، جاهزة فور دخولك.'),
    layers: [['water', 1]], opts: ['size'] },
  // ── Cold
  { id: 'icedlatte', cat: 'cold', kind: 'drink', price: 30, kcal: 140, tags: ['gf'], cup: 'tall', iced: true,
    name: L('Iced latte', 'Latte glacé', 'لاتيه مثلّج'), desc: L('Double espresso poured over cold milk and ice.', 'Double espresso versé sur lait froid et glaçons.', 'إسبريسو مزدوج فوق الحليب البارد والثلج.'),
    layers: [['milk', 0.7], ['espresso', 0.3]], opts: ['size', 'milk', 'shots', 'syrup', 'sugar'] },
  { id: 'coldbrew', cat: 'cold', kind: 'drink', price: 30, kcal: 10, tags: ['v', 'gf', 'df'], cup: 'tall', iced: true,
    name: L('Cold brew', 'Cold brew', 'كولد برو'), desc: L('Steeped 18 hours. Smooth, chocolatey, low acidity.', 'Infusé 18 heures. Doux, chocolaté, peu acide.', 'منقوع 18 ساعة. ناعم بنكهة الشوكولاتة وحموضة منخفضة.'),
    layers: [['coldbrew', 1]], opts: ['size', 'milk', 'sugar'] },
  { id: 'tonic', cat: 'cold', kind: 'drink', price: 34, kcal: 60, tags: ['v', 'gf', 'df', 'new'], cup: 'tall', iced: true,
    name: L('Espresso tonic', 'Espresso tonic', 'إسبريسو تونيك'), desc: L('Tonic, orange peel and a floating shot. Bright and bitter-sweet.', 'Tonic, zeste d’orange et un shot flottant. Vif et doux-amer.', 'تونيك وقشر البرتقال وجرعة إسبريسو طافية. منعش وحلو-مر.'),
    layers: [['tonic', 0.72], ['espresso', 0.28]], opts: ['shots'] },
  { id: 'blossom', cat: 'cold', kind: 'drink', price: 36, kcal: 90, tags: ['v', 'gf', 'df', 'sig'], cup: 'tall', iced: true,
    name: L('Orange-blossom cold brew', 'Cold brew fleur d’oranger', 'كولد برو بماء الزهر'), desc: L('Cold brew, fresh orange and a drop of Moroccan orange-blossom water.', 'Cold brew, orange pressée et une goutte d’eau de fleur d’oranger.', 'كولد برو وبرتقال طازج وقطرة من ماء الزهر المغربي.'),
    layers: [['orange', 0.32], ['coldbrew', 0.68]], opts: ['size', 'sugar'] },
  { id: 'frappe', cat: 'cold', kind: 'drink', price: 34, kcal: 320, tags: ['gf', 'new'], cup: 'tall', iced: true,
    name: L('Salted caramel frappé', 'Frappé caramel salé', 'فرابيه بالكراميل المملّح'), desc: L('Espresso blended with ice and milk, salted caramel, whipped cream and praline crumble.', 'Espresso mixé avec glace et lait, caramel salé, chantilly et éclats de praliné.', 'إسبريسو مخلوط بالثلج والحليب مع كراميل مملّح وكريمة وفتات البرالين.'),
    layers: [['syrup', 0.12], ['milk', 0.58], ['cream', 0.3]], opts: ['size', 'milk', 'shots'] },
  { id: 'orangemint', cat: 'cold', kind: 'drink', price: 26, kcal: 110, tags: ['v', 'gf', 'df', 'new'], cup: 'tall', iced: true,
    name: L('Orange & mint cooler', 'Rafraîchissement orange & menthe', 'منعش البرتقال والنعناع'), desc: L('Fresh-pressed orange, crushed mint, sparkling water and ice. No coffee.', 'Orange pressée, menthe écrasée, eau pétillante et glaçons. Sans café.', 'برتقال معصور ونعناع مهروس وماء فوار وثلج. بدون قهوة.'),
    layers: [['orange', 1]], opts: ['size', 'sugar'] },
  { id: 'lemonade', cat: 'cold', kind: 'drink', price: 24, kcal: 90, tags: ['v', 'gf', 'df'], cup: 'tall', iced: true,
    name: L('Mint lemonade', 'Citronnade à la menthe', 'ليموناضة بالنعناع'), desc: L('Fresh lemon, mint and a drop of orange-blossom water, shaken over ice.', 'Citron frais, menthe et une goutte de fleur d’oranger, secoués sur glace.', 'ليمون طازج ونعناع وقطرة ماء الزهر، مرجوجة على الثلج.'),
    layers: [['lemon', 1]], opts: ['size', 'sugar'] },
  // ── Not coffee
  { id: 'matcha', cat: 'notcoffee', kind: 'drink', price: 34, kcal: 130, tags: ['gf'], cup: 'glass',
    name: L('Matcha latte', 'Matcha latte', 'ماتشا لاتيه'), desc: L('Ceremonial-grade matcha whisked to order.', 'Matcha de grade cérémonial fouetté à la minute.', 'ماتشا فاخرة تُخفق عند الطلب.'),
    layers: [['matcha', 0.3], ['milk', 0.55], ['foam', 0.15]], opts: ['size', 'milk', 'syrup', 'sugar', 'temp'] },
  { id: 'chai', cat: 'notcoffee', kind: 'drink', price: 30, kcal: 160, tags: ['gf'], cup: 'mug',
    name: L('Spiced chai', 'Chaï épicé', 'شاي بالتوابل'), desc: L('Black tea, cardamom, ginger, cinnamon and steamed milk.', 'Thé noir, cardamome, gingembre, cannelle et lait chaud.', 'شاي أسود وهيل وزنجبيل وقرفة مع حليب مبخّر.'),
    layers: [['chai', 0.8], ['foam', 0.2]], opts: ['size', 'milk', 'sugar', 'temp'] },
  { id: 'atay', cat: 'notcoffee', kind: 'drink', price: 18, kcal: 40, tags: ['v', 'gf', 'df'], cup: 'teaglass',
    name: L('Mint tea', 'Thé à la menthe', 'أتاي بالنعناع'), desc: L('Gunpowder green tea and fresh mint, poured from height.', 'Thé vert gunpowder et menthe fraîche, versé de haut.', 'شاي أخضر ونعناع طازج يُصبّ من الأعلى.'),
    layers: [['tea', 1]], opts: ['sugar'] },
  { id: 'choc', cat: 'notcoffee', kind: 'drink', price: 28, kcal: 280, tags: ['gf'], cup: 'mug',
    name: L('Hot chocolate', 'Chocolat chaud', 'شوكولاتة ساخنة'), desc: L('Real 70% chocolate, not powder. Whipped cream on request.', 'Vrai chocolat 70 %, pas de poudre. Chantilly sur demande.', 'شوكولاتة حقيقية 70% وليست بودرة. كريمة عند الطلب.'),
    layers: [['chocolate', 0.82], ['cream', 0.18]], opts: ['size', 'milk'] },
  { id: 'infusion', cat: 'notcoffee', kind: 'drink', price: 20, kcal: 15, tags: ['v', 'gf', 'df'], cup: 'mug',
    name: L('Mint & lemon infusion', 'Infusion menthe & citron', 'منقوع النعناع والليمون'), desc: L('Fresh mint and lemon steeped in hot water, honey on the side. Caffeine-free.', 'Menthe fraîche et citron infusés, miel à part. Sans caféine.', 'نعناع طازج وليمون منقوعان في ماء ساخن مع العسل جانباً. بدون كافيين.'),
    layers: [['tea', 1]], opts: ['size', 'sugar'] },
  // ── Bakery
  { id: 'croissant', cat: 'bakery', kind: 'food', art: 'croissant', price: 16, kcal: 280, tags: [],
    name: L('Butter croissant', 'Croissant au beurre', 'كرواسون بالزبدة'), desc: L('Laminated in-house every morning, 27 layers.', 'Feuilleté chez nous chaque matin, 27 couches.', 'يُحضّر عندنا كل صباح، 27 طبقة.'), opts: ['warm'] },
  { id: 'painchoc', cat: 'bakery', kind: 'food', art: 'painchoc', price: 18, kcal: 320, tags: [],
    name: L('Pain au chocolat', 'Pain au chocolat', 'خبز بالشوكولاتة'), desc: L('Two bars of dark chocolate, crisp shell.', 'Deux barres de chocolat noir, croûte croustillante.', 'قطعتان من الشوكولاتة الداكنة وقشرة مقرمشة.'), opts: ['warm'] },
  { id: 'almondcr', cat: 'bakery', kind: 'food', art: 'croissant', price: 24, kcal: 420, tags: ['sig'],
    name: L('Almond & orange-blossom croissant', 'Croissant amande & fleur d’oranger', 'كرواسون باللوز وماء الزهر'), desc: L('Twice-baked with frangipane and orange-blossom syrup.', 'Cuit deux fois, frangipane et sirop de fleur d’oranger.', 'مخبوز مرتين مع فرانجيبان وشراب ماء الزهر.'), opts: ['warm'] },
  { id: 'msemen', cat: 'bakery', kind: 'food', art: 'msemen', price: 22, kcal: 380, tags: [],
    name: L('Msemen, honey & amlou', 'Msemen, miel & amlou', 'مسمن بالعسل والأملو'), desc: L('Flaky Moroccan flatbread, warm, with honey and almond-argan amlou.', 'Galette feuilletée marocaine, tiède, miel et amlou.', 'مسمن ساخن مع العسل وأملو اللوز والأركان.'), opts: [] },
  { id: 'banana', cat: 'bakery', kind: 'food', art: 'loaf', price: 22, kcal: 310, tags: ['v', 'df'],
    name: L('Vegan banana bread', 'Banana bread vegan', 'خبز الموز النباتي'), desc: L('Brown butter-free, walnut crumble, toasted to order.', 'Sans beurre, crumble de noix, toasté à la minute.', 'بدون زبدة مع فتات الجوز، يُحمّص عند الطلب.'), opts: ['warm'] },
  { id: 'bun', cat: 'bakery', kind: 'food', art: 'bun', price: 22, kcal: 340, tags: ['new'],
    name: L('Cardamom bun', 'Brioche à la cardamome', 'لفافة الهيل'), desc: L('Swedish-style knot with fresh cardamom sugar.', 'Nœud à la suédoise, sucre à la cardamome fraîche.', 'عقدة على الطريقة السويدية مع سكر الهيل.'), opts: ['warm'] },
  // ── Brunch
  { id: 'avo', cat: 'brunch', kind: 'food', art: 'toast', price: 58, kcal: 520, tags: ['v', 'df'],
    name: L('Avocado & dukkah toast', 'Toast avocat & dukkah', 'توست أفوكادو ودقّة'), desc: L('Sourdough, smashed avocado, lime, dukkah and chili oil.', 'Pain au levain, avocat écrasé, citron vert, dukkah et huile pimentée.', 'خبز العجين المخمّر وأفوكادو وليمون ودقّة وزيت الفلفل.'), opts: ['addEgg'] },
  { id: 'shak', cat: 'brunch', kind: 'food', art: 'pan', price: 62, kcal: 560, tags: ['gf', 'sig'],
    name: L('Shakshuka', 'Chakchouka', 'شكشوكة'), desc: L('Two eggs baked in spiced tomato, feta, herbs, bread on the side.', 'Deux œufs cuits dans une sauce tomate épicée, feta, herbes, pain.', 'بيضتان في صلصة طماطم متبّلة مع فيتا وأعشاب وخبز.'), opts: ['spice'] },
  { id: 'granola', cat: 'brunch', kind: 'food', art: 'bowl', price: 45, kcal: 430, tags: ['gf'],
    name: L('Granola bowl', 'Bol granola', 'وعاء الجرانولا'), desc: L('House granola, Greek yogurt, seasonal fruit, date syrup.', 'Granola maison, yaourt grec, fruits de saison, sirop de datte.', 'جرانولا منزلية وزبادي يوناني وفاكهة الموسم ودبس التمر.'), opts: [] },
  { id: 'eggs', cat: 'brunch', kind: 'food', art: 'plate', price: 48, kcal: 450, tags: [],
    name: L('Eggs your way', 'Œufs comme vous aimez', 'بيض حسب رغبتك'), desc: L('Scrambled, fried or poached, on sourdough with herb butter.', 'Brouillés, au plat ou pochés, sur levain et beurre aux herbes.', 'مخفوق أو مقلي أو مسلوق، على خبز مخمّر مع زبدة الأعشاب.'), opts: ['eggStyle'] },
];

// Customiser groups. `d` = price delta, applied once per item.
export const OPTS = {
  size: { label: L('Size', 'Taille', 'الحجم'), type: 'one', choices: [
    { id: 's', label: L('Small · 8 oz', 'Petit · 25 cl', 'صغير'), d: -4, scale: 0.84 },
    { id: 'm', label: L('Regular · 12 oz', 'Normal · 35 cl', 'عادي'), d: 0, scale: 1 },
    { id: 'l', label: L('Large · 16 oz', 'Grand · 45 cl', 'كبير'), d: 5, scale: 1.14 }], def: 'm' },
  milk: { label: L('Milk', 'Lait', 'الحليب'), type: 'one', choices: [
    { id: 'milk', label: L('Whole milk', 'Lait entier', 'حليب كامل'), d: 0 },
    { id: 'oat', label: L('Oat', 'Avoine', 'شوفان'), d: 5 },
    { id: 'almond', label: L('Almond', 'Amande', 'لوز'), d: 5 },
    { id: 'lactosefree', label: L('Lactose-free', 'Sans lactose', 'بدون لاكتوز'), d: 3 }], def: 'milk' },
  shots: { label: L('Espresso', 'Espresso', 'الإسبريسو'), type: 'one', choices: [
    { id: '2', label: L('Double (house)', 'Double (maison)', 'مزدوج'), d: 0 },
    { id: '3', label: L('Triple', 'Triple', 'ثلاثي'), d: 6 },
    { id: 'decaf', label: L('Decaf', 'Déca', 'منزوع الكافيين'), d: 2 }], def: '2' },
  syrup: { label: L('Syrup', 'Sirop', 'شراب'), type: 'one', choices: [
    { id: 'none', label: L('None', 'Aucun', 'بدون'), d: 0 },
    { id: 'vanilla', label: L('Vanilla', 'Vanille', 'فانيليا'), d: 4 },
    { id: 'caramel', label: L('Salted caramel', 'Caramel salé', 'كراميل مملّح'), d: 4 },
    { id: 'blossom', label: L('Orange blossom', 'Fleur d’oranger', 'ماء الزهر'), d: 4 }], def: 'none' },
  sugar: { label: L('Sweetness', 'Sucre', 'السكر'), type: 'one', choices: [
    { id: '0', label: L('None', 'Sans', 'بدون'), d: 0 },
    { id: '1', label: L('A little', 'Un peu', 'قليل'), d: 0 },
    { id: '2', label: L('Sweet', 'Sucré', 'محلّى'), d: 0 }], def: '0' },
  temp: { label: L('Temperature', 'Température', 'الحرارة'), type: 'one', choices: [
    { id: 'hot', label: L('Hot', 'Chaud', 'ساخن'), d: 0 },
    { id: 'iced', label: L('Iced', 'Glacé', 'مثلّج'), d: 2 }], def: 'hot' },
  bean: { label: L('Coffee', 'Café', 'القهوة'), type: 'one', choices: 'beans', def: null },
  warm: { label: L('Serve', 'Service', 'التقديم'), type: 'one', choices: [
    { id: 'room', label: L('As is', 'Tel quel', 'كما هو'), d: 0 },
    { id: 'warm', label: L('Warmed', 'Réchauffé', 'مُسخّن'), d: 0 }], def: 'room' },
  addEgg: { label: L('Add', 'Ajouter', 'إضافة'), type: 'many', choices: [
    { id: 'egg', label: L('Poached egg', 'Œuf poché', 'بيضة مسلوقة'), d: 8 },
    { id: 'feta', label: L('Feta', 'Feta', 'فيتا'), d: 7 }] },
  spice: { label: L('Heat', 'Piquant', 'الحرارة'), type: 'one', choices: [
    { id: 'mild', label: L('Mild', 'Doux', 'خفيف'), d: 0 },
    { id: 'hot', label: L('Spicy', 'Relevé', 'حار'), d: 0 }], def: 'mild' },
  eggStyle: { label: L('Eggs', 'Œufs', 'البيض'), type: 'one', choices: [
    { id: 'scr', label: L('Scrambled', 'Brouillés', 'مخفوق'), d: 0 },
    { id: 'fried', label: L('Fried', 'Au plat', 'مقلي'), d: 0 },
    { id: 'poached', label: L('Poached', 'Pochés', 'مسلوق'), d: 0 }], def: 'scr' },
};

/*
  Beans. Flavour compass: x −1 fruity → +1 chocolatey · y −1 delicate → +1 bold.
*/
export const BEANS = [
  { id: 'guji', origin: L('Ethiopia · Guji', 'Éthiopie · Guji', 'إثيوبيا · غوجي'), process: L('Washed', 'Lavé', 'مغسولة'), alt: 2100, roast: 'light',
    notes: L('Peach · jasmine · bergamot', 'Pêche · jasmin · bergamote', 'خوخ · ياسمين · برغموت'), x: -0.82, y: -0.72, price: 120, color: '#f2b880', badge: 'today' },
  { id: 'nyeri', origin: L('Kenya · Nyeri AA', 'Kenya · Nyeri AA', 'كينيا · نييري'), process: L('Washed', 'Lavé', 'مغسولة'), alt: 1800, roast: 'light',
    notes: L('Blackcurrant · grapefruit · brown sugar', 'Cassis · pamplemousse · cassonade', 'كشمش أسود · جريب فروت · سكر بني'), x: -0.62, y: 0.12, price: 140, color: '#c45b6a' },
  { id: 'rwanda', origin: L('Rwanda · Nyamasheke', 'Rwanda · Nyamasheke', 'رواندا · نياماشيكي'), process: L('Washed', 'Lavé', 'مغسولة'), alt: 1900, roast: 'light',
    notes: L('Red berries · hibiscus · honey', 'Fruits rouges · hibiscus · miel', 'توت أحمر · كركديه · عسل'), x: -0.45, y: -0.3, price: 125, color: '#e07a5f' },
  { id: 'huila', origin: L('Colombia · Huila', 'Colombie · Huila', 'كولومبيا · ويلا'), process: L('Honey', 'Honey', 'هاني'), alt: 1700, roast: 'medium',
    notes: L('Red apple · caramel · cacao nib', 'Pomme rouge · caramel · grué de cacao', 'تفاح أحمر · كراميل · حبيبات الكاكاو'), x: 0.12, y: 0.05, price: 110, color: '#d9a05b' },
  { id: 'cerrado', origin: L('Brazil · Cerrado', 'Brésil · Cerrado', 'البرازيل · سيرادو'), process: L('Natural', 'Nature', 'طبيعية'), alt: 1150, roast: 'medium',
    notes: L('Milk chocolate · hazelnut · toffee', 'Chocolat au lait · noisette · toffee', 'شوكولاتة بالحليب · بندق · توفي'), x: 0.72, y: 0.45, price: 95, color: '#8a5a3b' },
  { id: 'atlas', origin: L('Atlas house espresso', 'Espresso maison Atlas', 'إسبريسو أطلس'), process: L('Brazil + Colombia', 'Brésil + Colombie', 'البرازيل + كولومبيا'), alt: null, roast: 'medium-dark',
    notes: L('Dark chocolate · almond · date', 'Chocolat noir · amande · datte', 'شوكولاتة داكنة · لوز · تمر'), x: 0.82, y: 0.8, price: 98, color: '#5b3a29', badge: 'espresso' },
];

export const BEAN_SIZES = [
  { id: '250', label: '250 g', mult: 1 },
  { id: '1000', label: '1 kg', mult: 3.5 },
];
export const GRINDS = [
  { id: 'whole', label: L('Whole bean', 'Grains', 'حبوب كاملة') },
  { id: 'espresso', label: L('Espresso', 'Espresso', 'إسبريسو') },
  { id: 'filter', label: L('Filter / V60', 'Filtre / V60', 'فلتر / V60') },
  { id: 'moka', label: L('Moka pot', 'Cafetière italienne', 'موكا') },
  { id: 'french', label: L('French press', 'Piston', 'مكبس فرنسي') },
];
export const SUB_PLANS = [
  { id: 'once', label: L('One-time', 'Une fois', 'مرة واحدة'), off: 0 },
  { id: 'w2', label: L('Every 2 weeks · −10%', 'Toutes les 2 semaines · −10 %', 'كل أسبوعين · −10%'), off: 0.1 },
  { id: 'w4', label: L('Every 4 weeks · −10%', 'Toutes les 4 semaines · −10 %', 'كل 4 أسابيع · −10%'), off: 0.1 },
];

// Brew guide recipes (per 1 cup = 250 ml).
export const BREW = [
  { id: 'v60', name: 'V60', ratio: 16, grind: L('Medium-fine', 'Moyenne-fine', 'متوسط-ناعم'), temp: 94, time: 180,
    steps: [[0, L('Bloom with twice the coffee weight', 'Pré-infusez avec 2× le poids du café', 'رطّب البن بضعف وزنه ماءً')], [45, L('Pour slowly to 60 %', 'Versez doucement jusqu’à 60 %', 'اصبب ببطء حتى 60%')], [90, L('Finish the pour, gentle swirl', 'Terminez, légère rotation', 'أكمل الصبّ مع تحريك خفيف')], [180, L('Drawdown done — enjoy', 'Écoulement terminé — dégustez', 'انتهى التقطير — بالهناء')]] },
  { id: 'aero', name: 'AeroPress', ratio: 14, grind: L('Fine', 'Fine', 'ناعم'), temp: 88, time: 120,
    steps: [[0, L('Add coffee, pour all the water', 'Café, puis toute l’eau', 'أضف البن ثم كل الماء')], [10, L('Stir 3 times, cap on', 'Remuez 3 fois, bouchon', 'حرّك 3 مرات وأغلق')], [90, L('Press slowly for 30 s', 'Pressez lentement 30 s', 'اضغط ببطء لمدة 30 ثانية')], [120, L('Done — dilute to taste', 'Terminé — allongez à votre goût', 'جاهز — خفّف حسب ذوقك')]] },
  { id: 'french', name: 'French press', ratio: 15, grind: L('Coarse', 'Grossière', 'خشن'), temp: 95, time: 240,
    steps: [[0, L('Pour all the water', 'Versez toute l’eau', 'اصبب كل الماء')], [60, L('Break the crust, skim', 'Cassez la croûte, écumez', 'اكسر القشرة وأزل الرغوة')], [240, L('Plunge gently and serve', 'Pressez doucement et servez', 'اضغط برفق وقدّم')]] },
  { id: 'moka', name: 'Moka', ratio: 8, grind: L('Fine-medium', 'Fine-moyenne', 'ناعم-متوسط'), temp: 70, time: 300,
    steps: [[0, L('Hot water to the valve, coffee level', 'Eau chaude jusqu’à la valve, café à ras', 'ماء ساخن حتى الصمام والبن مستوٍ')], [180, L('Low heat, lid open', 'Feu doux, couvercle ouvert', 'نار هادئة والغطاء مفتوح')], [300, L('Off the heat at the first gurgle', 'Retirez au premier gargouillis', 'ارفعها عند أول قرقرة')]] },
];

// Workshops & events — dates are generated relative to today (next occurrence of `dow`).
export const EVENTS = [
  { id: 'latteart', dow: 6, at: 600, mins: 120, price: 250, seats: 8, taken: 5, color: '#ff5a1f',
    name: L('Latte art basics', 'Initiation latte art', 'أساسيات فن اللاتيه'), desc: L('Steam milk like a barista and pour your first heart and tulip. Small group, all equipment included.', 'Texturez le lait comme un barista et réalisez vos premiers cœur et tulipe. Petit groupe, matériel fourni.', 'بخّر الحليب مثل الباريستا وارسم أول قلب وزهرة. مجموعة صغيرة وكل المعدات متوفرة.') },
  { id: 'homebrew', dow: 0, at: 660, mins: 90, price: 200, seats: 10, taken: 4, color: '#0f3d2e',
    name: L('Home brewing: V60 & AeroPress', 'Café maison : V60 & AeroPress', 'التحضير المنزلي: V60 وإيروبريس'), desc: L('Ratios, grind and water — leave with a recipe card and 100 g of beans.', 'Ratios, mouture et eau — repartez avec une fiche recette et 100 g de café.', 'النِّسب والطحن والماء — تخرج ببطاقة وصفة و100 غ من البن.') },
  { id: 'cupping', dow: 6, at: 960, mins: 60, price: 0, seats: 12, taken: 9, color: '#c48a2c',
    name: L('Saturday cupping', 'Cupping du samedi', 'تذوّق السبت'), desc: L('Taste our new arrivals side by side with the roaster. Free, just book a spot.', 'Dégustez nos nouveautés avec le torréfacteur. Gratuit, réservez votre place.', 'تذوّق وصولاتنا الجديدة مع المحمّص. مجاناً، احجز مكانك فقط.') },
  { id: 'acoustic', dow: 4, at: 1170, mins: 120, price: 0, seats: 30, taken: 18, color: '#3d2c8d',
    name: L('Acoustic Thursday', 'Jeudi acoustique', 'خميس الموسيقى الهادئة'), desc: L('Live oud & guitar on the terrace. Free entry — reserve a table.', 'Oud & guitare en live sur la terrasse. Entrée libre — réservez une table.', 'عود وغيتار مباشر على التراس. دخول مجاني — احجز طاولة.') },
];

export const GIFT_AMOUNTS = [100, 200, 300, 500];
export const GIFT_DESIGNS = [
  { id: 'sun', label: L('Morning sun', 'Soleil du matin', 'شمس الصباح') },
  { id: 'zellige', label: L('Zellige', 'Zellige', 'زليج') },
  { id: 'night', label: L('Night shift', 'Service de nuit', 'المناوبة الليلية') },
];

// Product photos (img/<id>.webp, 800 × 800). Items not listed keep their drawn art.
export const PHOTOS = new Set(['esp', 'cortado', 'flat', 'capp', 'latte', 'spanish', 'mocha', 'v60', 'aero', 'icedlatte', 'frappe', 'matcha', 'choc', 'chai', 'orangemint', 'lemonade', 'infusion', 'batch', 'coldbrew', 'tonic', 'blossom', 'atay']);
export const photoOf = (id) => (PHOTOS.has(id) ? `/demos/coffee/img/${id}.webp` : null);

export const AMENITIES = [
  ['wifi', L('Fast Wi-Fi', 'Wi-Fi rapide', 'واي فاي سريع')],
  ['plug', L('Sockets at every table', 'Prises à chaque table', 'مقابس في كل طاولة')],
  ['sun', L('Shaded terrace', 'Terrasse ombragée', 'تراس مظلّل')],
  ['paw', L('Dog-friendly', 'Chiens bienvenus', 'نرحّب بالكلاب')],
  ['wheel', L('Step-free access', 'Accès de plain-pied', 'دخول بدون درج')],
  ['quiet', L('Quiet room upstairs', 'Salle calme à l’étage', 'غرفة هادئة في الطابق العلوي')],
];
