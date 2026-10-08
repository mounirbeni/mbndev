// The live demo at /m/demo — the sample menu new owners start from, shown
// without the API (orders, calls and bookings are simulated in the browser).
import type { MenuDoc, MenuRestaurant } from '@/lib/api';
import SAMPLE from './menu-sample.json';
import { CARAMELIO_DEMO } from './menuDemos/caramelio';

export const DEMO_RESTAURANT: MenuRestaurant = {
  id: 'demo',
  name: 'MBN Restaurant',
  tagline: {
    pt: 'Cozinha mediterrânica de mercado, vinhos ibéricos e esplanada.',
    en: 'Mediterranean market cooking, Iberian wines and a terrace.',
    es: 'Cocina mediterránea de mercado, vinos ibéricos y terraza.',
    fr: 'Cuisine méditerranéenne du marché, vins ibériques et terrasse.',
    it: 'Cucina mediterranea di mercato, vini iberici e terrazza.',
  },
  about: {
    pt: 'Restaurante de demonstração do MBN Menu. Experimente encomendar, chamar o empregado ou reservar — aqui tudo é simulado.',
    en: 'MBN Menu demo restaurant. Try ordering, calling the waiter or booking — everything here is simulated.',
    es: 'Restaurante de demostración de MBN Menu. Prueba a pedir, llamar al camarero o reservar: aquí todo es simulado.',
    fr: 'Restaurant de démonstration MBN Menu. Essayez de commander, d’appeler le serveur ou de réserver — tout est simulé ici.',
    it: 'Ristorante dimostrativo di MBN Menu. Prova a ordinare, chiamare il cameriere o prenotare: qui è tutto simulato.',
  },
  color: '#1f4fd1',
  languages: ['pt', 'en', 'es', 'fr', 'it'],
  defaultLanguage: 'en',
  currency: 'EUR',
  timezone: 'Europe/Lisbon',
  address: 'Avenida da Demonstração 1, Lisboa',
  phone: null,
  whatsapp: null,
  email: null,
  instagram: null,
  website: 'https://mbndev.ma/products/menu',
  wifiName: 'Restaurant-Guests',
  wifiPassword: 'mesa2026',
  logoPhotoId: null,
  coverPhotoId: null,
  hours: { 0: [[600, 1380]], 1: [[600, 1380]], 2: [[600, 1380]], 3: [[600, 1380]], 4: [[600, 1380]], 5: [[600, 1440]], 6: [[600, 1440]] },
  payments: ['card', 'cash', 'mbway', 'applepay', 'googlepay'],
  ordering: true,
  booking: true,
  waiterCall: true,
  coverCharge: 1.5,
  menu: SAMPLE as MenuDoc,
  branding: true,
};

// Sales demos served without the API, by URL id (/m/<id>).
export const DEMO_MENUS: Record<string, MenuRestaurant> = {
  demo: DEMO_RESTAURANT,
  caramelio: CARAMELIO_DEMO,
};
