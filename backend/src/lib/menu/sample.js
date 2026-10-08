// A ready-made Mediterranean menu in 5 languages, so a new owner sees a full,
// working menu straight away and edits it instead of starting from a blank page.
const SAMPLE_MENU = require('./sample-menu.json');

function sampleRestaurant() {
  return {
    name: 'MBN Restaurant Demo',
    tagline: {
      pt: 'Cozinha mediterrânica de mercado, vinhos ibéricos e esplanada.',
      en: 'Mediterranean market cooking, Iberian wines and a terrace.',
      es: 'Cocina mediterránea de mercado, vinos ibéricos y terraza.',
      fr: 'Cuisine méditerranéenne du marché, vins ibériques et terrasse.',
      it: 'Cucina mediterranea di mercato, vini iberici e terrazza.',
    },
    about: {
      pt: 'Pratos de época feitos com produtos do mercado, para partilhar com calma.',
      en: 'Seasonal plates made with market produce, made for sharing.',
      es: 'Platos de temporada con producto de mercado, para compartir.',
      fr: 'Des assiettes de saison avec les produits du marché, à partager.',
      it: 'Piatti di stagione con prodotti del mercato, da condividere.',
    },
    color: '#1f4fd1',
    languages: ['pt', 'en', 'es', 'fr', 'it'],
    defaultLanguage: 'pt',
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
    address: 'Avenida da Demonstração 1, 1000-001 Lisboa',
    phone: '+351 210 000 000',
    instagram: 'mbn.restaurant.demo',
    wifiName: 'Restaurant-Guests',
    wifiPassword: 'mesa2026',
    hours: { 0: [[720, 960]], 1: [], 2: [[720, 900], [1140, 1380]], 3: [[720, 900], [1140, 1380]], 4: [[720, 900], [1140, 1380]], 5: [[720, 930], [1140, 1440]], 6: [[720, 930], [1140, 1440]] },
    payments: ['card', 'cash', 'mbway', 'applepay', 'googlepay'],
    coverCharge: 1.5,
    menu: JSON.parse(JSON.stringify(SAMPLE_MENU)),
  };
}

module.exports = { sampleRestaurant };
