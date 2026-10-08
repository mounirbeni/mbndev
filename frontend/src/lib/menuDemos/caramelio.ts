// Sales demo: Caramelio (pâtisserie · boulangerie · café-restaurant, Route de
// Targa, Marrakech) shown at /m/caramelio. Like /m/demo it runs without the
// API — orders, calls and bookings are simulated in the browser. Dishes and
// prices are illustrative, not the restaurant's official menu (the about text
// says so to guests).
import type { Localized, MenuChoice, MenuItem, MenuRestaurant } from '@/lib/api';

type T3 = [fr: string, ar: string, en: string];
const L = ([fr, ar, en]: T3): Localized => ({ fr, ar, en });

let seq = 0;
const nid = () => `c${String(++seq).padStart(3, '0')}`;

const choice = (name: T3, price: number): MenuChoice => ({ id: nid(), name: L(name), price });

function dish(
  name: T3, desc: T3, price: number, allergens: number[],
  f: Partial<Pick<MenuItem, 'veg' | 'vegan' | 'spicy' | 'chef' | 'isNew' | 'available' | 'kcal'>> & { options?: MenuChoice[]; extras?: MenuChoice[] } = {},
): MenuItem {
  return {
    id: nid(), name: L(name), desc: L(desc), price, photo: null, allergens,
    veg: f.veg ?? false, vegan: f.vegan ?? false, spicy: f.spicy ?? 0, chef: f.chef ?? false, isNew: f.isNew ?? false,
    available: f.available ?? true, kcal: f.kcal ?? null, options: f.options ?? [], extras: f.extras ?? [],
  };
}

const cat = (name: T3, items: MenuItem[]) => ({ id: nid(), name: L(name), items });

// Allergen ids (EU 14): 1 gluten · 2 crustaceans · 3 eggs · 4 fish · 7 milk · 8 tree nuts · 10 mustard · 11 sesame · 14 molluscs
const MENU = {
  categories: [
    cat(['Petit-déjeuner', 'الفطور', 'Breakfast'], [
      dish(['Petit-déjeuner marocain', 'فطور مغربي', 'Moroccan breakfast'],
        ['Msemen, baghrir, harcha, amlou, miel, beurre, olives, fromage frais et thé à la menthe.', 'مسمن، بغرير، حرشة، أملو، عسل، زبدة، زيتون، جبن طري وأتاي بالنعناع.', 'Msemen, baghrir, harcha, amlou, honey, butter, olives, fresh cheese and mint tea.'],
        45, [1, 7, 8], { veg: true, chef: true }),
      dish(['Petit-déjeuner continental', 'فطور قاري', 'Continental breakfast'],
        ['Croissant, pain maison, beurre, confiture, jus d’orange pressé et boisson chaude.', 'كرواسون، خبز الدار، زبدة، مربى، عصير برتقال طبيعي ومشروب ساخن.', 'Croissant, house bread, butter, jam, fresh orange juice and a hot drink.'],
        40, [1, 3, 7], { veg: true }),
      dish(['Omelette berbère', 'أومليت أمازيغية', 'Berber omelette'],
        ['Œufs, tomates, oignons et épices, servie dans un petit tajine avec du pain.', 'بيض بالطماطم والبصل والتوابل، يقدم في طاجين صغير مع الخبز.', 'Eggs with tomato, onion and spices, served in a small tagine with bread.'],
        35, [1, 3], { veg: true, spicy: 1 }),
    ]),
    cat(['Boulangerie & viennoiseries', 'المخبزة والمعجنات', 'Bakery & pastries'], [
      dish(['Croissant pur beurre', 'كرواسون بالزبدة', 'Butter croissant'], ['Feuilleté chaque matin.', 'محضر كل صباح.', 'Baked every morning.'], 6, [1, 3, 7], { veg: true }),
      dish(['Pain au chocolat', 'خبز بالشوكولاتة', 'Pain au chocolat'], ['Pâte feuilletée et deux barres de chocolat noir.', 'عجينة مورقة وقطعتان من الشوكولاتة الداكنة.', 'Flaky pastry with two dark chocolate bars.'], 7, [1, 3, 7, 6], { veg: true }),
      dish(['Msemen au miel', 'مسمن بالعسل', 'Msemen with honey'], ['Crêpe feuilletée marocaine, beurre et miel.', 'مسمن مورق بالزبدة والعسل.', 'Flaky Moroccan pancake with butter and honey.'], 8, [1, 7], { veg: true }),
      dish(['Millefeuille', 'ميلفاي', 'Mille-feuille'], ['Crème pâtissière vanille entre trois feuilletages caramélisés.', 'كريمة الفانيليا بين ثلاث طبقات مورقة مكرملة.', 'Vanilla custard between three caramelised puff layers.'], 15, [1, 3, 7], { veg: true }),
      dish(['Tarte citron meringuée', 'تارت الليمون بالمرينغ', 'Lemon meringue tart'], ['Crème citron acidulée et meringue dorée.', 'كريمة ليمون منعشة ومرينغ ذهبي.', 'Zesty lemon cream and golden meringue.'], 18, [1, 3, 7], { veg: true }),
      dish(['Cornes de gazelle (100 g)', 'كعب غزال (100 غ)', 'Gazelle horns (100 g)'], ['Pâte d’amande à la fleur d’oranger.', 'عجينة اللوز بماء الزهر.', 'Almond paste with orange blossom.'], 25, [1, 8], { veg: true, chef: true }),
    ]),
    cat(['Boissons chaudes', 'مشروبات ساخنة', 'Hot drinks'], [
      dish(['Espresso', 'إسبريسو', 'Espresso'], ['Café serré.', 'قهوة مركزة.', 'Short black coffee.'], 12, [], { vegan: true, veg: true }),
      dish(['Nous-nous', 'نص نص', 'Nous-nous'], ['Moitié café, moitié lait, servi en verre.', 'نص قهوة ونص حليب في كأس.', 'Half coffee, half milk, served in a glass.'], 13, [7], { veg: true }),
      dish(['Café crème', 'قهوة بالحليب', 'Café crème'], ['Espresso allongé et lait mousseux.', 'إسبريسو مع حليب برغوة.', 'Espresso topped with frothy milk.'], 15, [7], { veg: true,
        options: [choice(['Lait entier', 'حليب كامل', 'Whole milk'], 0), choice(['Lait d’amande', 'حليب اللوز', 'Almond milk'], 5)] }),
      dish(['Thé à la menthe', 'أتاي بالنعناع', 'Mint tea'], ['Thé vert, menthe fraîche — sucré ou sans sucre.', 'شاي أخضر بالنعناع الطري — بالسكر أو بدون.', 'Green tea with fresh mint — sweet or unsweetened.'], 15, [], { vegan: true, veg: true,
        options: [choice(['Sucré', 'بالسكر', 'Sweet'], 0), choice(['Sans sucre', 'بدون سكر', 'No sugar'], 0)] }),
      dish(['Chocolat chaud', 'شوكولاتة ساخنة', 'Hot chocolate'], ['Chocolat fondu et lait, chantilly maison.', 'شوكولاتة ذائبة وحليب مع كريمة شانتي.', 'Melted chocolate and milk with whipped cream.'], 20, [7], { veg: true }),
    ]),
    cat(['Jus & smoothies', 'عصائر وسموذي', 'Juices & smoothies'], [
      dish(['Jus d’orange pressé', 'عصير برتقال طبيعي', 'Fresh orange juice'], ['Oranges pressées à la commande.', 'برتقال معصور عند الطلب.', 'Squeezed to order.'], 18, [], { vegan: true, veg: true }),
      dish(['Panaché', 'باناشي', 'Panaché'], ['Avocat, banane, fraise, lait et une touche d’amande.', 'أفوكادو، موز، فراولة، حليب ولمسة لوز.', 'Avocado, banana, strawberry, milk and a hint of almond.'], 30, [7, 8], { veg: true, chef: true }),
      dish(['Smoothie mangue-passion', 'سموذي مانجو وفاكهة الآلام', 'Mango-passion smoothie'], ['Mangue, fruit de la passion et yaourt.', 'مانجو، فاكهة الآلام وياغورت.', 'Mango, passion fruit and yoghurt.'], 28, [7], { veg: true, isNew: true }),
    ]),
    cat(['Salades', 'سلطات', 'Salads'], [
      dish(['Salade marocaine', 'سلطة مغربية', 'Moroccan salad'], ['Tomates, concombres, oignons, coriandre et huile d’olive.', 'طماطم، خيار، بصل، قزبر وزيت الزيتون.', 'Tomato, cucumber, onion, coriander and olive oil.'], 25, [], { vegan: true, veg: true }),
      dish(['Salade César', 'سلطة سيزر', 'Caesar salad'], ['Poulet grillé, romaine, parmesan, croûtons et sauce César.', 'دجاج مشوي، خس روماني، بارميزان، خبز محمص وصلصة سيزر.', 'Grilled chicken, romaine, parmesan, croutons and Caesar dressing.'], 45, [1, 3, 4, 7, 10]),
      dish(['Salade niçoise', 'سلطة نيسواز', 'Niçoise salad'], ['Thon, œuf, pommes de terre, haricots verts et olives.', 'تونة، بيض، بطاطس، فاصوليا خضراء وزيتون.', 'Tuna, egg, potatoes, green beans and olives.'], 45, [3, 4, 10]),
    ]),
    cat(['Tajines', 'طواجن', 'Tagines'], [
      dish(['Tajine poulet citron confit & olives', 'طاجين دجاج بالحامض المرقد والزيتون', 'Chicken tagine with preserved lemon & olives'], ['Poulet fondant, citron confit, olives violettes, servi avec du pain.', 'دجاج طري بالحامض المرقد والزيتون، يقدم مع الخبز.', 'Tender chicken, preserved lemon and violet olives, served with bread.'], 60, [1, 9], { chef: true }),
      dish(['Tajine kefta aux œufs', 'طاجين الكفتة بالبيض', 'Kefta tagine with eggs'], ['Boulettes de viande hachée, sauce tomate épicée et œufs.', 'كرات الكفتة في صلصة طماطم متبلة مع البيض.', 'Spiced meatballs in tomato sauce, finished with eggs.'], 55, [1, 3], { spicy: 1 }),
      dish(['Tajine de légumes', 'طاجين الخضر', 'Vegetable tagine'], ['Légumes de saison mijotés aux épices douces.', 'خضر الموسم مطهوة على نار هادئة بالتوابل.', 'Seasonal vegetables slow-cooked with mild spices.'], 45, [1, 9], { vegan: true, veg: true }),
    ]),
    cat(['Pizzas', 'بيتزا', 'Pizzas'], [
      dish(['Margherita', 'مارغريتا', 'Margherita'], ['Sauce tomate, mozzarella, basilic.', 'صلصة طماطم، موزاريلا، حبق.', 'Tomato sauce, mozzarella, basil.'], 45, [1, 7], { veg: true }),
      dish(['Quatre fromages', 'أربعة أجبان', 'Four cheese'], ['Mozzarella, edam, chèvre et bleu.', 'موزاريلا، إيدام، جبن الماعز والجبن الأزرق.', 'Mozzarella, edam, goat cheese and blue cheese.'], 60, [1, 7], { veg: true }),
      dish(['Pizza Caramelio', 'بيتزا كاراميليو', 'Caramelio pizza'], ['Viande hachée, poivrons, oignons, olives et œuf.', 'لحم مفروم، فلفل، بصل، زيتون وبيض.', 'Minced beef, peppers, onions, olives and egg.'], 65, [1, 3, 7], { chef: true }),
    ]),
    cat(['Burgers & pâtes', 'برغر وعجائن', 'Burgers & pasta'], [
      dish(['Burger classique', 'برغر كلاسيك', 'Classic burger'], ['Steak haché, cheddar, salade, tomate, sauce maison et frites.', 'شريحة لحم مفروم، شيدر، خس، طماطم، صلصة الدار وبطاطس مقلية.', 'Beef patty, cheddar, lettuce, tomato, house sauce and fries.'], 50, [1, 3, 7, 10], {
        extras: [choice(['Œuf', 'بيضة', 'Egg'], 5), choice(['Cheddar en plus', 'شيدر إضافي', 'Extra cheddar'], 5)] }),
      dish(['Chicken burger', 'برغر الدجاج', 'Chicken burger'], ['Poulet croustillant, sauce blanche, salade et frites.', 'دجاج مقرمش، صلصة بيضاء، خس وبطاطس مقلية.', 'Crispy chicken, white sauce, lettuce and fries.'], 50, [1, 3, 7]),
      dish(['Pâtes bolognaise', 'معكرونة بولونيز', 'Pasta bolognese'], ['Sauce à la viande hachée mijotée, parmesan.', 'صلصة اللحم المفروم مطهوة ببطء مع البارميزان.', 'Slow-cooked meat sauce with parmesan.'], 50, [1, 3, 7, 9]),
      dish(['Pâtes aux fruits de mer', 'معكرونة بفواكه البحر', 'Seafood pasta'], ['Crevettes, calamars, ail et crème légère.', 'قمرون، كلامار، ثوم وكريمة خفيفة.', 'Prawns, squid, garlic and a light cream sauce.'], 70, [1, 2, 3, 7, 14]),
    ]),
    cat(['Desserts', 'حلويات', 'Desserts'], [
      dish(['Crêpe Nutella', 'كريب بالنوتيلا', 'Nutella crêpe'], ['Crêpe fine, Nutella et noisettes.', 'كريب رقيق بالنوتيلا والبندق.', 'Thin crêpe with Nutella and hazelnuts.'], 25, [1, 3, 7, 8], { veg: true }),
      dish(['Salade de fruits', 'سلطة فواكه', 'Fruit salad'], ['Fruits frais de saison, jus d’orange et cannelle.', 'فواكه الموسم الطازجة بعصير البرتقال والقرفة.', 'Fresh seasonal fruit with orange juice and cinnamon.'], 25, [], { vegan: true, veg: true }),
      dish(['Glace (2 boules)', 'مثلجات (كرتان)', 'Ice cream (2 scoops)'], ['Vanille, chocolat, fraise ou pistache.', 'فانيليا، شوكولاتة، فراولة أو فستق.', 'Vanilla, chocolate, strawberry or pistachio.'], 20, [7, 8], { veg: true,
        options: [choice(['Vanille', 'فانيليا', 'Vanilla'], 0), choice(['Chocolat', 'شوكولاتة', 'Chocolate'], 0), choice(['Fraise', 'فراولة', 'Strawberry'], 0), choice(['Pistache', 'فستق', 'Pistachio'], 0)] }),
    ]),
  ],
};

const EVERY_DAY: [number, number][] = [[405, 1380]]; // 06:45 – 23:00

export const CARAMELIO_DEMO: MenuRestaurant = {
  id: 'caramelio',
  name: 'Caramelio',
  tagline: L(['Pâtisserie · Boulangerie · Café · Restaurant', 'حلويات · مخبزة · مقهى · مطعم', 'Pastry · Bakery · Café · Restaurant']),
  about: L([
    'Démo réalisée par MBN DEV : voici à quoi pourrait ressembler le menu digital de Caramelio. Les plats et les prix sont indicatifs — ce n’est pas la carte officielle. Commandes, appels et réservations sont simulés.',
    'عرض تجريبي من MBN DEV: هكذا يمكن أن تبدو قائمة كاراميليو الرقمية. الأطباق والأسعار للتوضيح فقط وليست القائمة الرسمية. الطلبات والنداءات والحجوزات هنا محاكاة.',
    'A demo by MBN DEV: this is what Caramelio’s digital menu could look like. Dishes and prices are illustrative — this is not the official menu. Orders, calls and bookings are simulated.',
  ]),
  color: '#b5651d',
  languages: ['fr', 'ar', 'en'],
  defaultLanguage: 'fr',
  currency: 'MAD',
  timezone: 'Africa/Casablanca',
  address: 'Route de Targa, 42 Lotissement El Ouasis, Marrakech',
  phone: null,
  whatsapp: null,
  email: null,
  instagram: null,
  website: 'https://mbndev.ma/products/menu',
  wifiName: 'Caramelio-Clients',
  wifiPassword: 'caramelio2026',
  logoPhotoId: null,
  coverPhotoId: null,
  hours: { 0: EVERY_DAY, 1: EVERY_DAY, 2: EVERY_DAY, 3: EVERY_DAY, 4: EVERY_DAY, 5: EVERY_DAY, 6: EVERY_DAY },
  payments: ['cash', 'card'],
  ordering: true,
  booking: true,
  waiterCall: true,
  coverCharge: 0,
  menu: MENU,
  branding: true,
};
