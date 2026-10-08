// MBN Menu — shared copy and helpers for the public menu (/m/[id]) and the
// owner dashboard (/menu).
import type { Localized, MenuHours, MenuLang } from '@/lib/api';

export const MENU_LANGS: { id: MenuLang; label: string; native: string; locale: string }[] = [
  { id: 'en', label: 'English',    native: 'English',   locale: 'en-IE' },
  { id: 'fr', label: 'French',     native: 'Français',  locale: 'fr-FR' },
  { id: 'es', label: 'Spanish',    native: 'Español',   locale: 'es-ES' },
  { id: 'pt', label: 'Portuguese', native: 'Português', locale: 'pt-PT' },
  { id: 'it', label: 'Italian',    native: 'Italiano',  locale: 'it-IT' },
  { id: 'de', label: 'German',     native: 'Deutsch',   locale: 'de-DE' },
  { id: 'ar', label: 'Arabic',     native: 'العربية',   locale: 'ar-MA' },
];
export const MENU_LANG_IDS = MENU_LANGS.map((l) => l.id);
export const localeOf = (lang: MenuLang) => MENU_LANGS.find((l) => l.id === lang)?.locale ?? 'en-IE';

export const CURRENCIES = ['EUR', 'MAD', 'USD', 'GBP', 'CHF'];
export const PAYMENT_IDS = ['card', 'cash', 'mbway', 'bizum', 'applepay', 'googlepay', 'paypal', 'satispay', 'ticket'] as const;
const PAYMENT_BRANDS: Record<string, string> = { mbway: 'MB Way', bizum: 'Bizum', applepay: 'Apple Pay', googlepay: 'Google Pay', paypal: 'PayPal', satispay: 'Satispay' };

/** The 14 allergens of EU Regulation 1169/2011, in the order of its Annex II. */
export const ALLERGENS: Record<number, Record<MenuLang, string>> = {
  1:  { en: 'Gluten', fr: 'Gluten', es: 'Gluten', pt: 'Glúten', it: 'Glutine', de: 'Gluten', ar: 'الغلوتين' },
  2:  { en: 'Crustaceans', fr: 'Crustacés', es: 'Crustáceos', pt: 'Crustáceos', it: 'Crostacei', de: 'Krebstiere', ar: 'القشريات' },
  3:  { en: 'Eggs', fr: 'Œufs', es: 'Huevos', pt: 'Ovos', it: 'Uova', de: 'Eier', ar: 'البيض' },
  4:  { en: 'Fish', fr: 'Poisson', es: 'Pescado', pt: 'Peixe', it: 'Pesce', de: 'Fisch', ar: 'السمك' },
  5:  { en: 'Peanuts', fr: 'Arachides', es: 'Cacahuetes', pt: 'Amendoins', it: 'Arachidi', de: 'Erdnüsse', ar: 'الفول السوداني' },
  6:  { en: 'Soy', fr: 'Soja', es: 'Soja', pt: 'Soja', it: 'Soia', de: 'Soja', ar: 'الصويا' },
  7:  { en: 'Milk', fr: 'Lait', es: 'Leche', pt: 'Leite', it: 'Latte', de: 'Milch', ar: 'الحليب' },
  8:  { en: 'Tree nuts', fr: 'Fruits à coque', es: 'Frutos de cáscara', pt: 'Frutos de casca rija', it: 'Frutta a guscio', de: 'Schalenfrüchte', ar: 'المكسرات' },
  9:  { en: 'Celery', fr: 'Céleri', es: 'Apio', pt: 'Aipo', it: 'Sedano', de: 'Sellerie', ar: 'الكرفس' },
  10: { en: 'Mustard', fr: 'Moutarde', es: 'Mostaza', pt: 'Mostarda', it: 'Senape', de: 'Senf', ar: 'الخردل' },
  11: { en: 'Sesame', fr: 'Sésame', es: 'Sésamo', pt: 'Sésamo', it: 'Sesamo', de: 'Sesam', ar: 'السمسم' },
  12: { en: 'Sulphites', fr: 'Sulfites', es: 'Sulfitos', pt: 'Sulfitos', it: 'Solfiti', de: 'Sulfite', ar: 'الكبريتيت' },
  13: { en: 'Lupin', fr: 'Lupin', es: 'Altramuces', pt: 'Tremoço', it: 'Lupini', de: 'Lupinen', ar: 'الترمس' },
  14: { en: 'Molluscs', fr: 'Mollusques', es: 'Moluscos', pt: 'Moluscos', it: 'Molluschi', de: 'Weichtiere', ar: 'الرخويات' },
};

/** Guest-facing interface text. */
const EN = {
  search: 'Search dishes…', filters: 'Filters', veg: 'Vegetarian', vegan: 'Vegan', gf: 'Gluten-free', mild: 'Not spicy',
  chef: "Chef's pick", isNew: 'New', soldOut: 'Sold out', from: 'from', allergens: 'Allergens', noAl: 'No declared allergens',
  choose: 'Choose', extras: 'Extras', note: 'Note for the kitchen', notePh: 'e.g. no onion', add: 'Add', added: 'Added to your order',
  avoid: "I'm allergic to… (hide dishes with)", diet: 'Preferences', show: 'Show dishes', reset: 'Reset',
  empty: 'No dishes match. Try removing a filter.', navMenu: 'Menu', navBook: 'Book', navInfo: 'Info', navOrder: 'Order',
  odTitle: 'Your order', odSub: 'Check your order, send it to the kitchen and ask for the bill from your table.',
  odEmpty: "You haven't picked anything yet.", browse: 'Browse the menu', tableNo: 'Table no.', subtotal: 'Subtotal',
  cover: 'Cover charge', total: 'Total', split: 'Split between', each: 'each', send: 'Send to the kitchen', sending: 'Sending…',
  needTable: 'Enter your table number', sentTitle: 'Sent to the kitchen', addMore: 'Add more', waiter: 'Call a waiter',
  waiterOk: 'A waiter is on the way', bill: 'Ask for the bill', payHow: 'How would you like to pay?', billOk: 'Your bill is on its way',
  clear: 'Clear', bkTitle: 'Book a table', bkSub: 'Send your request — the restaurant confirms it here.', date: 'Date', guests: 'Guests',
  time: 'Time', name: 'Name', phone: 'Mobile', terrace: 'I prefer the terrace', notes: 'Special requests (birthday, high chair…)',
  confirm: 'Request booking', missing: 'Pick a time and fill in your name and mobile.', closedDay: 'Closed on this day. Pick another date.',
  booked: 'Booking request sent', bookedNote: 'Keep this page open or come back later to see the confirmation.', newBooking: 'New booking',
  about: 'About us', hours: 'Opening hours', closed: 'Closed', addr: 'Address', directions: 'Map', phoneL: 'Phone', copy: 'Copy',
  copied: 'Copied', pay: 'Payments', alTitle: 'Allergens (EU Reg. 1169/2011)', alText: 'Each dish lists its allergens by number. Use the filters to hide what you cannot eat. If in doubt, ask our team.',
  openNow: 'Open now · closes', closedNow: 'Closed · opens', today: 'today at', tomorrow: 'tomorrow at', at: 'at', table: 'Table',
  spicy: 'Spicy', language: 'Language', poweredBy: 'Digital menu by MBN DEV', error: 'Could not send — please try again or ask the staff.',
  specials: "Chef's picks", call: 'Call', card: 'Card', cash: 'Cash', perUnit: 'each', yourRequests: 'Your requests',
  st_new: 'Received', st_preparing: 'Preparing', st_ready: 'On its way', st_done: 'Served', st_cancelled: 'Cancelled',
  bk_new: 'Waiting for confirmation', bk_confirmed: 'Confirmed', bk_declined: 'Not available — please call us',
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
export type MenuCopy = typeof EN;

export const MENU_COPY: Record<MenuLang, MenuCopy> = {
  en: EN,
  fr: {
    search: 'Chercher un plat…', filters: 'Filtres', veg: 'Végétarien', vegan: 'Vegan', gf: 'Sans gluten', mild: 'Non épicé',
    chef: 'Coup de cœur', isNew: 'Nouveau', soldOut: 'Épuisé', from: 'dès', allergens: 'Allergènes', noAl: 'Aucun allergène déclaré',
    choose: 'Choisir', extras: 'Suppléments', note: 'Note pour la cuisine', notePh: 'Ex. : sans oignon', add: 'Ajouter', added: 'Ajouté à la commande',
    avoid: 'Je suis allergique à… (masquer les plats avec)', diet: 'Préférences', show: 'Voir les plats', reset: 'Réinitialiser',
    empty: 'Aucun plat ne correspond. Retirez un filtre.', navMenu: 'Menu', navBook: 'Réserver', navInfo: 'Infos', navOrder: 'Commande',
    odTitle: 'Votre commande', odSub: "Vérifiez, envoyez en cuisine et demandez l'addition depuis votre table.",
    odEmpty: "Vous n'avez encore rien choisi.", browse: 'Voir le menu', tableNo: 'N° de table', subtotal: 'Sous-total',
    cover: 'Couvert', total: 'Total', split: 'Partager entre', each: 'chacun', send: 'Envoyer en cuisine', sending: 'Envoi…',
    needTable: 'Indiquez le numéro de table', sentTitle: 'Envoyée en cuisine', addMore: 'Ajouter', waiter: 'Appeler le serveur',
    waiterOk: 'Un serveur arrive', bill: "Demander l'addition", payHow: 'Comment souhaitez-vous payer ?', billOk: "L'addition arrive",
    clear: 'Vider', bkTitle: 'Réserver une table', bkSub: 'Envoyez votre demande — le restaurant la confirme ici.', date: 'Date', guests: 'Personnes',
    time: 'Heure', name: 'Nom', phone: 'Mobile', terrace: 'Je préfère la terrasse', notes: 'Demandes spéciales (anniversaire, chaise bébé…)',
    confirm: 'Demander la réservation', missing: 'Choisissez une heure et indiquez nom et mobile.', closedDay: 'Fermé ce jour-là. Choisissez une autre date.',
    booked: 'Demande de réservation envoyée', bookedNote: 'Gardez cette page ouverte ou revenez plus tard pour voir la confirmation.', newBooking: 'Nouvelle réservation',
    about: 'À propos', hours: 'Horaires', closed: 'Fermé', addr: 'Adresse', directions: 'Plan', phoneL: 'Téléphone', copy: 'Copier',
    copied: 'Copié', pay: 'Paiements', alTitle: 'Allergènes (Règl. UE 1169/2011)', alText: 'Chaque plat indique ses allergènes par numéro. Utilisez les filtres pour masquer ce que vous ne pouvez pas manger. En cas de doute, demandez-nous.',
    openNow: 'Ouvert · ferme à', closedNow: 'Fermé · ouvre', today: "aujourd'hui à", tomorrow: 'demain à', at: 'à', table: 'Table',
    spicy: 'Épicé', language: 'Langue', poweredBy: 'Menu digital par MBN DEV', error: "Envoi impossible — réessayez ou demandez au personnel.",
    specials: 'Les coups de cœur', call: 'Appeler', card: 'Carte', cash: 'Espèces', perUnit: "l'unité", yourRequests: 'Vos demandes',
    st_new: 'Reçue', st_preparing: 'En préparation', st_ready: 'En route', st_done: 'Servie', st_cancelled: 'Annulée',
    bk_new: 'En attente de confirmation', bk_confirmed: 'Confirmée', bk_declined: 'Indisponible — appelez-nous',
    days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  },
  es: {
    search: 'Buscar plato…', filters: 'Filtros', veg: 'Vegetariano', vegan: 'Vegano', gf: 'Sin gluten', mild: 'Sin picante',
    chef: 'Del chef', isNew: 'Nuevo', soldOut: 'Agotado', from: 'desde', allergens: 'Alérgenos', noAl: 'Sin alérgenos declarados',
    choose: 'Elige', extras: 'Extras', note: 'Nota para cocina', notePh: 'Ej.: sin cebolla', add: 'Añadir', added: 'Añadido al pedido',
    avoid: 'Tengo alergia a… (ocultar platos con)', diet: 'Preferencias', show: 'Ver platos', reset: 'Restablecer',
    empty: 'Ningún plato coincide. Prueba a quitar un filtro.', navMenu: 'Carta', navBook: 'Reservar', navInfo: 'Info', navOrder: 'Pedido',
    odTitle: 'Tu pedido', odSub: 'Revisa, envía a cocina y pide la cuenta desde tu mesa.',
    odEmpty: 'Aún no has elegido nada.', browse: 'Ver la carta', tableNo: 'N.º de mesa', subtotal: 'Subtotal',
    cover: 'Cubierto', total: 'Total', split: 'Dividir entre', each: 'cada uno', send: 'Enviar a cocina', sending: 'Enviando…',
    needTable: 'Indica el número de mesa', sentTitle: 'Enviado a cocina', addMore: 'Añadir más', waiter: 'Llamar al camarero',
    waiterOk: 'El camarero viene enseguida', bill: 'Pedir la cuenta', payHow: '¿Cómo prefieres pagar?', billOk: 'La cuenta va en camino',
    clear: 'Vaciar', bkTitle: 'Reserva tu mesa', bkSub: 'Envía tu solicitud — el restaurante la confirma aquí.', date: 'Fecha', guests: 'Personas',
    time: 'Hora', name: 'Nombre', phone: 'Móvil', terrace: 'Prefiero terraza', notes: 'Peticiones especiales (cumpleaños, trona…)',
    confirm: 'Solicitar reserva', missing: 'Elige una hora y rellena nombre y móvil.', closedDay: 'Cerrado este día. Elige otra fecha.',
    booked: 'Solicitud de reserva enviada', bookedNote: 'Mantén esta página abierta o vuelve más tarde para ver la confirmación.', newBooking: 'Nueva reserva',
    about: 'Sobre nosotros', hours: 'Horario', closed: 'Cerrado', addr: 'Dirección', directions: 'Mapa', phoneL: 'Teléfono', copy: 'Copiar',
    copied: 'Copiado', pay: 'Pagos', alTitle: 'Alérgenos (Reg. UE 1169/2011)', alText: 'Cada plato indica sus alérgenos por número. Usa los filtros para ocultar lo que no puedes comer. Si tienes dudas, pregúntanos.',
    openNow: 'Abierto · cierra a las', closedNow: 'Cerrado · abre', today: 'hoy a las', tomorrow: 'mañana a las', at: 'a las', table: 'Mesa',
    spicy: 'Picante', language: 'Idioma', poweredBy: 'Carta digital de MBN DEV', error: 'No se pudo enviar — inténtalo de nuevo o pregunta al personal.',
    specials: 'Recomendados', call: 'Llamar', card: 'Tarjeta', cash: 'Efectivo', perUnit: 'c/u', yourRequests: 'Tus solicitudes',
    st_new: 'Recibido', st_preparing: 'En preparación', st_ready: 'En camino', st_done: 'Servido', st_cancelled: 'Cancelado',
    bk_new: 'Pendiente de confirmación', bk_confirmed: 'Confirmada', bk_declined: 'No disponible — llámanos',
    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  },
  pt: {
    search: 'Procurar prato…', filters: 'Filtros', veg: 'Vegetariano', vegan: 'Vegan', gf: 'Sem glúten', mild: 'Sem picante',
    chef: 'Do chef', isNew: 'Novo', soldOut: 'Esgotado', from: 'desde', allergens: 'Alergénios', noAl: 'Sem alergénios declarados',
    choose: 'Escolha', extras: 'Extras', note: 'Nota para a cozinha', notePh: 'Ex.: sem cebola', add: 'Adicionar', added: 'Adicionado ao pedido',
    avoid: 'Tenho alergia a… (esconder pratos com)', diet: 'Preferências', show: 'Ver pratos', reset: 'Repor',
    empty: 'Nenhum prato corresponde. Experimente remover um filtro.', navMenu: 'Menu', navBook: 'Reservar', navInfo: 'Info', navOrder: 'Pedido',
    odTitle: 'O seu pedido', odSub: 'Reveja, envie para a cozinha e peça a conta a partir da mesa.',
    odEmpty: 'Ainda não escolheu nada.', browse: 'Ver o menu', tableNo: 'N.º da mesa', subtotal: 'Subtotal',
    cover: 'Couvert', total: 'Total', split: 'Dividir por', each: 'cada', send: 'Enviar para a cozinha', sending: 'A enviar…',
    needTable: 'Indique o número da mesa', sentTitle: 'Enviado para a cozinha', addMore: 'Adicionar mais', waiter: 'Chamar empregado',
    waiterOk: 'O empregado vem já à mesa', bill: 'Pedir a conta', payHow: 'Como prefere pagar?', billOk: 'A conta vem a caminho',
    clear: 'Limpar', bkTitle: 'Reserve a sua mesa', bkSub: 'Envie o pedido — o restaurante confirma aqui.', date: 'Data', guests: 'Pessoas',
    time: 'Hora', name: 'Nome', phone: 'Telemóvel', terrace: 'Prefiro esplanada', notes: 'Pedidos especiais (aniversário, cadeira de bebé…)',
    confirm: 'Pedir reserva', missing: 'Escolha uma hora e preencha nome e telemóvel.', closedDay: 'Encerrado neste dia. Escolha outra data.',
    booked: 'Pedido de reserva enviado', bookedNote: 'Mantenha esta página aberta ou volte mais tarde para ver a confirmação.', newBooking: 'Nova reserva',
    about: 'Sobre nós', hours: 'Horário', closed: 'Encerrado', addr: 'Morada', directions: 'Mapa', phoneL: 'Telefone', copy: 'Copiar',
    copied: 'Copiado', pay: 'Pagamentos', alTitle: 'Alergénios (Reg. UE 1169/2011)', alText: 'Cada prato indica os alergénios pelo número. Use os filtros para esconder o que não pode comer. Em caso de dúvida, fale connosco.',
    openNow: 'Aberto agora · fecha às', closedNow: 'Fechado · abre', today: 'hoje às', tomorrow: 'amanhã às', at: 'às', table: 'Mesa',
    spicy: 'Picante', language: 'Idioma', poweredBy: 'Menu digital por MBN DEV', error: 'Não foi possível enviar — tente de novo ou fale com a equipa.',
    specials: 'Sugestões do chef', call: 'Ligar', card: 'Cartão', cash: 'Dinheiro', perUnit: 'cada', yourRequests: 'Os seus pedidos',
    st_new: 'Recebido', st_preparing: 'Em preparação', st_ready: 'A caminho', st_done: 'Servido', st_cancelled: 'Cancelado',
    bk_new: 'A aguardar confirmação', bk_confirmed: 'Confirmada', bk_declined: 'Indisponível — ligue-nos',
    days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  },
  it: {
    search: 'Cerca un piatto…', filters: 'Filtri', veg: 'Vegetariano', vegan: 'Vegano', gf: 'Senza glutine', mild: 'Non piccante',
    chef: 'Dello chef', isNew: 'Novità', soldOut: 'Esaurito', from: 'da', allergens: 'Allergeni', noAl: 'Nessun allergene dichiarato',
    choose: 'Scegli', extras: 'Extra', note: 'Nota per la cucina', notePh: 'Es.: senza cipolla', add: 'Aggiungi', added: "Aggiunto all'ordine",
    avoid: 'Sono allergico a… (nascondi piatti con)', diet: 'Preferenze', show: 'Mostra piatti', reset: 'Azzera',
    empty: 'Nessun piatto corrisponde. Prova a togliere un filtro.', navMenu: 'Menù', navBook: 'Prenota', navInfo: 'Info', navOrder: 'Ordine',
    odTitle: 'Il tuo ordine', odSub: 'Controlla, invia in cucina e chiedi il conto dal tavolo.',
    odEmpty: 'Non hai ancora scelto nulla.', browse: 'Vedi il menù', tableNo: 'N. tavolo', subtotal: 'Subtotale',
    cover: 'Coperto', total: 'Totale', split: 'Dividi tra', each: 'a testa', send: 'Invia in cucina', sending: 'Invio…',
    needTable: 'Indica il numero del tavolo', sentTitle: 'Inviato in cucina', addMore: 'Aggiungi altro', waiter: 'Chiama il cameriere',
    waiterOk: 'Il cameriere arriva subito', bill: 'Chiedi il conto', payHow: 'Come preferisci pagare?', billOk: 'Il conto sta arrivando',
    clear: 'Svuota', bkTitle: 'Prenota un tavolo', bkSub: 'Invia la richiesta — il ristorante la conferma qui.', date: 'Data', guests: 'Persone',
    time: 'Ora', name: 'Nome', phone: 'Cellulare', terrace: 'Preferisco la terrazza', notes: 'Richieste speciali (compleanno, seggiolone…)',
    confirm: 'Richiedi prenotazione', missing: 'Scegli un orario e inserisci nome e cellulare.', closedDay: "Chiuso in questo giorno. Scegli un'altra data.",
    booked: 'Richiesta di prenotazione inviata', bookedNote: 'Tieni aperta questa pagina o torna più tardi per vedere la conferma.', newBooking: 'Nuova prenotazione',
    about: 'Chi siamo', hours: 'Orari', closed: 'Chiuso', addr: 'Indirizzo', directions: 'Mappa', phoneL: 'Telefono', copy: 'Copia',
    copied: 'Copiato', pay: 'Pagamenti', alTitle: 'Allergeni (Reg. UE 1169/2011)', alText: 'Ogni piatto indica gli allergeni con un numero. Usa i filtri per nascondere ciò che non puoi mangiare. Nel dubbio, chiedici.',
    openNow: 'Aperto · chiude alle', closedNow: 'Chiuso · apre', today: 'oggi alle', tomorrow: 'domani alle', at: 'alle', table: 'Tavolo',
    spicy: 'Piccante', language: 'Lingua', poweredBy: 'Menù digitale di MBN DEV', error: 'Invio non riuscito — riprova o chiedi al personale.',
    specials: 'Consigli dello chef', call: 'Chiama', card: 'Carta', cash: 'Contanti', perUnit: "l'uno", yourRequests: 'Le tue richieste',
    st_new: 'Ricevuto', st_preparing: 'In preparazione', st_ready: 'In arrivo', st_done: 'Servito', st_cancelled: 'Annullato',
    bk_new: 'In attesa di conferma', bk_confirmed: 'Confermata', bk_declined: 'Non disponibile — chiamaci',
    days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  },
  de: {
    search: 'Gericht suchen…', filters: 'Filter', veg: 'Vegetarisch', vegan: 'Vegan', gf: 'Glutenfrei', mild: 'Nicht scharf',
    chef: 'Tipp vom Koch', isNew: 'Neu', soldOut: 'Ausverkauft', from: 'ab', allergens: 'Allergene', noAl: 'Keine deklarierten Allergene',
    choose: 'Auswählen', extras: 'Extras', note: 'Hinweis für die Küche', notePh: 'z. B. ohne Zwiebeln', add: 'Hinzufügen', added: 'Zur Bestellung hinzugefügt',
    avoid: 'Ich bin allergisch gegen… (Gerichte damit ausblenden)', diet: 'Vorlieben', show: 'Gerichte zeigen', reset: 'Zurücksetzen',
    empty: 'Keine passenden Gerichte. Entfernen Sie einen Filter.', navMenu: 'Karte', navBook: 'Reservieren', navInfo: 'Info', navOrder: 'Bestellung',
    odTitle: 'Ihre Bestellung', odSub: 'Prüfen, an die Küche senden und die Rechnung vom Tisch aus anfordern.',
    odEmpty: 'Sie haben noch nichts ausgewählt.', browse: 'Zur Speisekarte', tableNo: 'Tisch-Nr.', subtotal: 'Zwischensumme',
    cover: 'Gedeck', total: 'Gesamt', split: 'Teilen durch', each: 'pro Person', send: 'An die Küche senden', sending: 'Wird gesendet…',
    needTable: 'Bitte Tischnummer eingeben', sentTitle: 'An die Küche gesendet', addMore: 'Mehr hinzufügen', waiter: 'Kellner rufen',
    waiterOk: 'Ein Kellner kommt gleich', bill: 'Rechnung anfordern', payHow: 'Wie möchten Sie bezahlen?', billOk: 'Die Rechnung kommt gleich',
    clear: 'Leeren', bkTitle: 'Tisch reservieren', bkSub: 'Anfrage senden — das Restaurant bestätigt sie hier.', date: 'Datum', guests: 'Personen',
    time: 'Uhrzeit', name: 'Name', phone: 'Handy', terrace: 'Lieber auf der Terrasse', notes: 'Besondere Wünsche (Geburtstag, Kinderstuhl…)',
    confirm: 'Reservierung anfragen', missing: 'Bitte Uhrzeit wählen und Name und Handynummer angeben.', closedDay: 'An diesem Tag geschlossen. Bitte anderes Datum wählen.',
    booked: 'Reservierungsanfrage gesendet', bookedNote: 'Lassen Sie diese Seite offen oder schauen Sie später wieder vorbei.', newBooking: 'Neue Reservierung',
    about: 'Über uns', hours: 'Öffnungszeiten', closed: 'Geschlossen', addr: 'Adresse', directions: 'Karte', phoneL: 'Telefon', copy: 'Kopieren',
    copied: 'Kopiert', pay: 'Zahlung', alTitle: 'Allergene (EU-VO 1169/2011)', alText: 'Jedes Gericht nennt seine Allergene als Nummer. Mit den Filtern blenden Sie aus, was Sie nicht essen dürfen. Im Zweifel fragen Sie uns.',
    openNow: 'Geöffnet · schließt um', closedNow: 'Geschlossen · öffnet', today: 'heute um', tomorrow: 'morgen um', at: 'um', table: 'Tisch',
    spicy: 'Scharf', language: 'Sprache', poweredBy: 'Digitale Speisekarte von MBN DEV', error: 'Senden fehlgeschlagen — bitte erneut versuchen oder das Personal fragen.',
    specials: 'Empfehlungen', call: 'Anrufen', card: 'Karte', cash: 'Bar', perUnit: 'pro Stück', yourRequests: 'Ihre Anfragen',
    st_new: 'Erhalten', st_preparing: 'In Zubereitung', st_ready: 'Unterwegs', st_done: 'Serviert', st_cancelled: 'Storniert',
    bk_new: 'Wartet auf Bestätigung', bk_confirmed: 'Bestätigt', bk_declined: 'Nicht verfügbar — bitte anrufen',
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  },
  ar: {
    search: 'ابحث عن طبق…', filters: 'تصفية', veg: 'نباتي', vegan: 'نباتي صرف', gf: 'خالٍ من الغلوتين', mild: 'غير حار',
    chef: 'اختيار الشيف', isNew: 'جديد', soldOut: 'نفد', from: 'من', allergens: 'مسببات الحساسية', noAl: 'لا توجد مسببات حساسية معلنة',
    choose: 'اختر', extras: 'إضافات', note: 'ملاحظة للمطبخ', notePh: 'مثال: بدون بصل', add: 'أضف', added: 'أضيف إلى طلبك',
    avoid: 'لدي حساسية من… (إخفاء الأطباق التي تحتويها)', diet: 'التفضيلات', show: 'عرض الأطباق', reset: 'إعادة ضبط',
    empty: 'لا توجد أطباق مطابقة. جرّب إزالة أحد الفلاتر.', navMenu: 'القائمة', navBook: 'حجز', navInfo: 'معلومات', navOrder: 'الطلب',
    odTitle: 'طلبك', odSub: 'راجع طلبك وأرسله إلى المطبخ واطلب الحساب من طاولتك.',
    odEmpty: 'لم تختر أي شيء بعد.', browse: 'تصفح القائمة', tableNo: 'رقم الطاولة', subtotal: 'المجموع الفرعي',
    cover: 'رسوم الخدمة', total: 'المجموع', split: 'تقسيم على', each: 'لكل شخص', send: 'أرسل إلى المطبخ', sending: 'جارٍ الإرسال…',
    needTable: 'أدخل رقم طاولتك', sentTitle: 'أُرسل إلى المطبخ', addMore: 'أضف المزيد', waiter: 'نادِ النادل',
    waiterOk: 'النادل في الطريق إليك', bill: 'اطلب الحساب', payHow: 'كيف تفضّل الدفع؟', billOk: 'الحساب في الطريق إليك',
    clear: 'مسح', bkTitle: 'احجز طاولة', bkSub: 'أرسل طلبك وسيؤكده المطعم هنا.', date: 'التاريخ', guests: 'الأشخاص',
    time: 'الوقت', name: 'الاسم', phone: 'الهاتف', terrace: 'أفضّل الجلوس في التراس', notes: 'طلبات خاصة (عيد ميلاد، كرسي أطفال…)',
    confirm: 'اطلب الحجز', missing: 'اختر وقتاً وأدخل اسمك ورقم هاتفك.', closedDay: 'المطعم مغلق في هذا اليوم. اختر تاريخاً آخر.',
    booked: 'تم إرسال طلب الحجز', bookedNote: 'أبقِ هذه الصفحة مفتوحة أو عد لاحقاً لرؤية التأكيد.', newBooking: 'حجز جديد',
    about: 'من نحن', hours: 'أوقات العمل', closed: 'مغلق', addr: 'العنوان', directions: 'الخريطة', phoneL: 'الهاتف', copy: 'نسخ',
    copied: 'تم النسخ', pay: 'طرق الدفع', alTitle: 'مسببات الحساسية (لائحة الاتحاد الأوروبي 1169/2011)', alText: 'كل طبق يذكر مسببات الحساسية برقمها. استخدم الفلاتر لإخفاء ما لا يمكنك تناوله. إن كان لديك شك فاسألنا.',
    openNow: 'مفتوح الآن · يغلق', closedNow: 'مغلق · يفتح', today: 'اليوم', tomorrow: 'غداً', at: '', table: 'طاولة',
    spicy: 'حار', language: 'اللغة', poweredBy: 'قائمة رقمية من MBN DEV', error: 'تعذّر الإرسال — حاول مرة أخرى أو اسأل الطاقم.',
    specials: 'اختيارات الشيف', call: 'اتصال', card: 'بطاقة', cash: 'نقداً', perUnit: 'للواحد', yourRequests: 'طلباتك',
    st_new: 'تم الاستلام', st_preparing: 'قيد التحضير', st_ready: 'في الطريق', st_done: 'تم التقديم', st_cancelled: 'أُلغي',
    bk_new: 'بانتظار التأكيد', bk_confirmed: 'مؤكد', bk_declined: 'غير متاح — اتصل بنا',
    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  },
};

export const paymentLabel = (id: string, copy: MenuCopy) => (id === 'card' ? copy.card : id === 'cash' ? copy.cash : id === 'ticket' ? 'Ticket Restaurant' : PAYMENT_BRANDS[id] ?? id);

/** Text in the guest's language, else the restaurant's default, else any. */
export function loc(v: Localized | undefined, lang: MenuLang, fallback: MenuLang): string {
  if (!v) return '';
  return v[lang] || v[fallback] || Object.values(v).find(Boolean) || '';
}

export const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Weekday (0 = Sunday), minute of day and date (YYYY-MM-DD) in the restaurant's time zone. */
export function zonedNow(timezone: string, now = new Date()) {
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
    }).formatToParts(now).map((p) => [p.type, p.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute), date: `${parts.year}-${parts.month}-${parts.day}` };
  } catch {
    return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes(), date: now.toISOString().slice(0, 10) };
  }
}

/** "Open now · closes 23:00" / "Closed · opens tomorrow at 12:00". Handles hours past midnight. */
export function openState(hours: MenuHours, timezone: string, copy: MenuCopy, now = new Date()): { open: boolean; text: string } | null {
  if (!hours || !Object.values(hours).some((r) => r?.length)) return null;
  const { day, minutes } = zonedNow(timezone, now);
  const yesterday = (day + 6) % 7;
  for (const [, c] of hours[yesterday] || []) if (c > 1440 && minutes < c - 1440) return { open: true, text: `${copy.openNow} ${hhmm(c)}` };
  for (const [o, c] of hours[day] || []) if (minutes >= o && minutes < c) return { open: true, text: `${copy.openNow} ${hhmm(c)}` };
  for (const [o] of hours[day] || []) if (o > minutes) return { open: false, text: `${copy.closedNow} ${copy.today} ${hhmm(o)}`.replace(/\s+/g, ' ') };
  for (let k = 1; k <= 7; k++) {
    const d = (day + k) % 7;
    if (hours[d]?.length) return { open: false, text: `${copy.closedNow} ${k === 1 ? copy.tomorrow : `${copy.days[d]} ${copy.at}`} ${hhmm(hours[d][0][0])}`.replace(/\s+/g, ' ') };
  }
  return { open: false, text: copy.closed };
}

/** Booking slots for a weekday: every 30 minutes, the last one an hour before closing. Mirrors the backend. */
export function slotsFor(hours: MenuHours, weekday: number): number[] {
  const out: number[] = [];
  for (const [o, c] of hours?.[weekday] || []) for (let m = Math.ceil(o / 30) * 30; m <= c - 60; m += 30) out.push(m);
  return out;
}

export const photoUrl = (id: string | null | undefined) => (id ? `/api/menu/photo/${id}` : null);

export const formatMoney = (n: number, currency: string, lang: MenuLang) =>
  new Intl.NumberFormat(localeOf(lang), { style: 'currency', currency }).format(n);
