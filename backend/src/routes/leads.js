const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const prisma   = require('../lib/prisma');
const { sendEmail, templates } = require('../lib/email');

// ─── Default leads seed (89 prospects found in Morocco) ──────────────────────
const DEFAULT_LEADS = [
  // ═══ ORIGINAL 22 LEADS ═══════════════════════════════════════════════════
  // ── HOT: no website + has contact info ───────────────────────────────────
  { name: 'Riad Puchka',                type: 'riad',       city: 'Marrakech',   phone: '+212 682 875 839',  email: 'riad.puchka@gmail.com', instagram: '@riadpuchka', website: 'none', priority: 'hot', outreachAngle: 'Instagram-only riad. Offer Starter ($799) — show RiadConnect as proof.', source: 'Instagram' },
  { name: 'Riad Imndi',                 type: 'riad',       city: 'Marrakech',   instagram: '@riadimndi',                                          website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only. DM with RiadConnect demo — direct match.',                       source: 'Instagram' },
  { name: 'Riad Sakura Chefchaouen',    type: 'riad',       city: 'Chefchaouen', instagram: '@riad_sakura_chefchaouen',                             website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only Chefchaouen riad. Offer Starter package.',                        source: 'Instagram' },
  { name: 'Nelia Marrakech',            type: 'riad',       city: 'Marrakech',   instagram: '@nelia.marrakech',                                    website: 'none',  priority: 'hot',  outreachAngle: '4 riads + spa + rooftop — serious business, Instagram-only (11K followers).',    source: 'Instagram' },
  { name: 'Mohamed Daif',               type: 'tour_guide', city: 'Marrakech',   phone: '+212 661 370 749',  email: 'daif996@gmail.com',             website: 'none',  priority: 'hot',  outreachAngle: 'WhatsApp + Gmail only. Offer landing page to capture bookings directly.',       source: 'Travel blog' },
  { name: 'Ismail Artisanat Marocain',  type: 'boutique',   city: 'Marrakech',   phone: '+212 681 910 784',  email: 'carverne.artisanat@gmail.com',  instagram: '@ismail_artisanat_marocain', website: 'none', priority: 'hot', outreachAngle: '13K Instagram followers, no website. Show TyyMaroc as proof.', source: 'Instagram' },
  { name: "Ma Déco d'Ailleurs",         type: 'boutique',   city: 'Marrakech',   instagram: '@madeco.dailleurs',                                   website: 'none',  priority: 'hot',  outreachAngle: '65K followers! B2B artisan supplier — no website is a huge missed opportunity.', source: 'Instagram' },
  { name: 'Boutique Artisanat Marrakech', type: 'boutique', city: 'Marrakech',   instagram: '@boutique_artisanat_marrakech',                        website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only artisan shop. Pitch e-commerce Starter package.',                source: 'Instagram' },
  { name: 'Hamsa Chaouen',              type: 'restaurant', city: 'Chefchaouen', instagram: '@hamsachaouen',                                       website: 'none',  priority: 'hot',  outreachAngle: 'Tea salon/restaurant Instagram-only. Pitch menu site + reservation form.',       source: 'Instagram' },
  { name: 'Riad Tizwa',                 type: 'riad',       city: 'Marrakech / Fes', email: 'Riadtizwa@gmail.com', instagram: '@riadtizwa',         website: 'none',  priority: 'warm', outreachAngle: 'Has Gmail — email directly. Two locations = needs a proper site.',              source: 'Search results' },
  { name: 'Riad Marrakech Doors',       type: 'riad',       city: 'Marrakech',   phone: '+212 524 378 637',  email: 'gm.riadmarrakechdoors@outlook.com', instagram: '@riad_marrakechdoors', website: 'none', priority: 'warm', outreachAngle: 'Has email + phone. Pitch Pro package — multi-room riad.', source: 'Search results' },
  { name: 'Riad Dar Saad',              type: 'riad',       city: 'Marrakech',   phone: '+212 524 378 562',  email: 'darsaadriad@gmail.com',         website: 'basic', priority: 'warm', outreachAngle: 'Basic site. Offer upgrade to Pro with booking dashboard.',                      source: 'Search results' },
  { name: 'Hamid Idbelaid',             type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: '31 reviews on TourHQ — no own website. Offer personal landing page.',            source: 'TourHQ' },
  { name: 'Hassan Fadil',               type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: '29 reviews. Pitch personal portfolio site to escape TourHQ commission.',         source: 'TourHQ' },
  { name: 'Abdelaziz (Aziz)',           type: 'tour_guide', city: 'Morocco',                                                                       website: 'none',  priority: 'warm', outreachAngle: '27 reviews. Nationwide guide — personal site = brand credibility.',              source: 'TourHQ' },
  { name: 'Houssaine Sliman',           type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: 'Mountain & desert specialist. Niche site = stand out from big operators.',        source: 'TourHQ' },
  { name: 'Noureddine Nour',            type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: 'Freelance guide since 2005, speaks 5 languages. High-value prospect.',           source: 'TourHQ (MA55445)' },
  { name: 'Café Medina Rouge',          type: 'restaurant', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: '#279 on Tripadvisor with no website. Pitch Starter with booking form.',          source: 'Tripadvisor' },
  { name: 'Restaurant Médina Saveurs',  type: 'restaurant', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: 'On Tripadvisor with no website. Easy sell — show menu + contact page.',          source: 'Tripadvisor' },
  { name: 'Café Restaurant Traditionnel', type: 'restaurant', city: 'Marrakech',                                                                   website: 'none',  priority: 'warm', outreachAngle: 'Traditional café on Tripadvisor with no website. Starter package is ideal.',     source: 'Tripadvisor' },
  { name: 'Artisanat et Décoration',    type: 'boutique',   city: 'Marrakech',   phone: '+212 657 595 760',  email: 'contact@artisanatetdecoration.com', website: 'basic', priority: 'warm', outreachAngle: 'Has basic site. Pitch modern redesign + integrated online shop.', source: 'Search results' },
  { name: 'Moroccan Artisans',          type: 'boutique',   city: 'Morocco',     instagram: '@moroccartisans',                                     website: 'none',  priority: 'warm', outreachAngle: 'Large community account 10K+ followers. Instagram-only e-shop opportunity.',     source: 'Instagram' },

  // ═══ 60 NEW LEADS — GOOGLE MAPS + INSTAGRAM SEARCH ═══════════════════════
  // ── Marrakech Riads — Instagram/No Website (HOT) ─────────────────────────
  { name: 'Alrashid Marrakech',         type: 'riad',       city: 'Marrakech',   phone: '+212 649 817 138',  instagram: '@alrashid.marrakech',       website: 'none',  priority: 'hot',  outreachAngle: 'Active Instagram riad in medina — no website. WhatsApp + DM combo.',           source: 'Instagram / Google Maps' },
  { name: 'Riad Dar Num',               type: 'riad',       city: 'Marrakech',   instagram: '@riaddarnum',                                          website: 'none',  priority: 'hot',  outreachAngle: 'Private boutique riad 4 bedrooms Instagram-only. Exclusive rental = needs direct booking site.', source: 'Instagram' },
  { name: 'Riad BE Marrakech',          type: 'riad',       city: 'Marrakech',   phone: '+212 670 364 105',  instagram: '@bemarrakech',              website: 'yes',   priority: 'warm', outreachAngle: '134K Instagram followers! Pitch premium custom redesign + rooftop restaurant booking system.', source: 'Instagram / Google Maps' },
  { name: 'Riad Arabkech',              type: 'riad',       city: 'Marrakech',   phone: '+212 700 172 522',  email: 'Arabkech05@gmail.com',          website: 'basic', priority: 'warm', outreachAngle: 'Has Gmail + phone. Old basic site — pitch modern redesign with booking system.',   source: 'riadarabkech.com' },
  { name: 'Riad Dar More',              type: 'riad',       city: 'Marrakech',   phone: '+212 662 165 599',  email: 'riad.darmore@gmail.com',        website: 'basic', priority: 'warm', outreachAngle: 'Gmail + phone. Dated website = upgrade with modern booking & multilingual support.', source: 'riaddarmore.com' },
  { name: 'Riad Houdou',                type: 'riad',       city: 'Marrakech',   phone: '+212 524 383 793',  email: 'le.riad.houdou@gmail.com',      website: 'basic', priority: 'warm', outreachAngle: 'Direct Gmail + phone. Old site. Offer modern redesign with reservation system.',    source: 'riadhoudou.com' },
  { name: 'Riad of The Light',          type: 'riad',       city: 'Marrakech',   phone: '+212 524 383 797',  email: 'riadofthelight@gmail.com',      website: 'basic', priority: 'warm', outreachAngle: 'Has email + phone. Basic old site — upgrade with modern booking-enabled design.',   source: 'riad-of-the-light.com' },
  { name: 'Le Riad Yasmine',            type: 'riad',       city: 'Marrakech',   phone: '+212 524 377 012',  email: 'leriadyasmine@gmail.com',       website: 'basic', priority: 'warm', outreachAngle: 'Gmail + phone. Basic site. Pitch redesign with EN/FR/AR multilingual support.',      source: 'riad-yasmine.com' },
  { name: 'Riad Tawargit',              type: 'riad',       city: 'Marrakech',   phone: '+212 524 378 078',  email: 'riad.tawargit@gmail.com',       website: 'basic', priority: 'warm', outreachAngle: 'Gmail + phone. Dated site — strong pitch for modern booking dashboard.',            source: 'riadtawargit.com' },
  { name: 'Riad Merzouga Kech',         type: 'riad',       city: 'Marrakech',   phone: '+212 524 390 273',  email: 'Riadmerzougakech@gmail.com',    instagram: '@riad_merzouga_marrakech', website: 'basic', priority: 'warm', outreachAngle: 'Gmail + Instagram + phone. Old site — redesign with integrated Stripe booking.', source: 'riadmerzouga.com' },
  { name: 'Riad Kasbah Marrakech',      type: 'riad',       city: 'Marrakech',   phone: '+212 524 389 770',  email: 'reservation.riadkasbah@gmail.com', website: 'basic', priority: 'warm', outreachAngle: 'Reservation Gmail + phone. Old site. Pitch Pro package with Stripe checkout.',  source: 'riadkasbahmarrakech.com' },
  // ── Marrakech Riads — Google Maps verified no website ────────────────────
  { name: 'Riad Al Amine Marrakech',   type: 'riad',       city: 'Marrakech',   phone: '+212 524 38 46 58',                                             website: 'none',  priority: 'hot',  outreachAngle: 'Verified no website on Google Maps. 87 reviews, 4.9 stars. Medina guest house losing bookings to OTAs.', source: 'Google Maps' },
  { name: 'Riad habib allah',          type: 'riad',       city: 'Marrakech',   phone: '+33 6 22 64 31 92',                                             website: 'none',  priority: 'hot',  outreachAngle: '100m from Jemaa el-Fnaa. Verified no website — Google Maps shows "Add website". 14 reviews, 4.9 stars.', source: 'Google Maps' },
  { name: 'Riad YallaHabibi',          type: 'riad',       city: 'Marrakech',   phone: '+212 635 20 35 03',                                             website: 'none',  priority: 'hot',  outreachAngle: 'Only Booking.com page — no dedicated website. 79 reviews, 3-star. Direct booking site = cut OTA fees.', source: 'Google Maps' },

  // ── Chefchaouen Riads — New/No Website (HOT) ─────────────────────────────
  { name: 'Dar Lella Chama',            type: 'riad',       city: 'Chefchaouen', phone: '+212 663 421 980',  instagram: '@riad_dar_chama_chefchaouen', website: 'none', priority: 'hot', outreachAngle: 'Newly opened riad Instagram-only. Perfect timing — offer launch website deal.',  source: 'Instagram / Google Maps' },
  { name: 'EL PALACIO SPA Riad',        type: 'riad',       city: 'Chefchaouen', phone: '+212 660 411 522',  email: 'Riad.elpalaciospa@gmail.com',   instagram: '@riad_elpalacio_spa', website: 'none', priority: 'hot', outreachAngle: 'Luxury spa riad with email + phone but no website. High-ticket client potential.', source: 'Instagram / Google Maps' },
  { name: 'DAR MUKTAB',                 type: 'riad',       city: 'Chefchaouen', phone: '+212 682 788 441',  email: 'darmuktab@gmail.com',           instagram: '@darmuktab',                website: 'none',  priority: 'hot',  outreachAngle: 'Has email + WhatsApp but zero website. 8-room guesthouse losing 15% per booking to OTAs.', source: 'darmuktab.com' },
  { name: 'Dar Kisania',                type: 'riad',       city: 'Chefchaouen',                                                                    website: 'none',  priority: 'hot',  outreachAngle: 'Recently renovated 8-room riad. No own website. Perfect candidate for Pro package.', source: 'Google Maps' },
  { name: 'Riad ALHAMBRA Chefchaouen',  type: 'riad',       city: 'Chefchaouen', phone: '+212 623 246 723',  email: 'info@alhambrariad.com',          instagram: '@riad_alhambra',             website: 'none',  priority: 'hot',  outreachAngle: 'Opened July 2024 — has email + WhatsApp but no booking website yet. Catch them early.', source: 'alhambrariad.com' },
  { name: 'Dar terrae plus',            type: 'riad',       city: 'Chefchaouen', instagram: '@darterraeplus',                                        website: 'none',  priority: 'hot',  outreachAngle: 'Opened May 2025 — Instagram-only brand new riad. Perfect timing to offer launch site.', source: 'Google Maps / Instagram' },
  { name: 'Dar MD',                     type: 'riad',       city: 'Chefchaouen',                                                                    website: 'none',  priority: 'hot',  outreachAngle: 'Opened April 2024 — recently launched riad no website. Early outreach advantage.',    source: 'Google Maps' },
  { name: 'Riad Bin Souaki',            type: 'riad',       city: 'Chefchaouen', instagram: '@riadbinsouaki',                                        website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only 4-room riad. Starter package perfect fit.',                           source: 'Instagram / riadbinsouaki.com' },
  { name: 'RIAD CHENGLI',               type: 'riad',       city: 'Chefchaouen',                                                                    website: 'none',  priority: 'hot',  outreachAngle: 'Opened Dec 2023. Chinese-Moroccan concept riad no website. Unique niche = premium site.', source: 'Google Maps' },
  { name: 'Dar Larbi',                  type: 'riad',       city: 'Chefchaouen',                                                                    website: 'none',  priority: 'hot',  outreachAngle: 'Opened October 2025 — brand new. Reach them before they build a site themselves.',     source: 'Google Maps' },
  { name: 'Dar Qaysar',                 type: 'riad',       city: 'Chefchaouen',                                                                    website: 'none',  priority: 'hot',  outreachAngle: '4-room boutique apartment-riad no website. Exclusive feel = pitch premium Starter.',   source: 'Google Maps' },
  { name: 'RIAD LA SANTA',              type: 'riad',       city: 'Chefchaouen',                                                                    website: 'none',  priority: 'hot',  outreachAngle: 'Recently renovated OTA-only. No own site. Pitch direct booking savings + brand story.', source: 'Google Maps' },
  { name: 'Dar Dadicilef',              type: 'riad',       city: 'Chefchaouen', phone: '+212 664 491 500',  email: 'dadicilef17@hotmail.com',        instagram: '@dardadicilef',              website: 'none',  priority: 'warm', outreachAngle: 'Oldest Andalusian house in Chefchaouen. Heritage angle = premium storytelling website.', source: 'Instagram / Google Maps' },
  { name: 'Riad Tassili Chaouen',       type: 'riad',       city: 'Chefchaouen', phone: '+212 765 148 716',  email: 'riadtassilichaouen@gmail.com',   website: 'basic', priority: 'warm', outreachAngle: 'Has email + phone. Basic/old site — offer modern upgrade with direct reservations.',  source: 'grouptassili.net' },
  { name: 'DAR BLANCA Chefchaouen',     type: 'riad',       city: 'Chefchaouen', email: 'infodarblanca@gmail.com',                                   instagram: '@darblanca_',               website: 'basic', priority: 'warm', outreachAngle: 'Has email + Instagram. Pool + garden riad. Offer modern redesign to stand out.',      source: 'darblanca.ma' },
  { name: 'Lina Ryad & Spa',            type: 'riad',       city: 'Chefchaouen', phone: '+212 660 239 906',  email: 'linaryadetspa@gmail.com',        website: 'basic', priority: 'warm', outreachAngle: 'Spa + pool riad with email + phone. Existing site outdated — premium redesign pitch.',  source: 'linaryad.com' },
  { name: 'Ryad A&B Sarai',             type: 'riad',       city: 'Chefchaouen', phone: '+212 666 283 486',  instagram: '@ryad_a.b_chaouen',          website: 'basic', priority: 'warm', outreachAngle: 'Has phone + Instagram. Indoor pool riad — pitch bike tour & spa booking integration.',  source: 'Instagram / Google Maps' },
  { name: 'Riad Cherifa',               type: 'riad',       city: 'Chefchaouen', phone: '+212 539 987 402',  email: 'reservations@riadcherifa.com',  instagram: '@riad.cherifa', website: 'basic', priority: 'warm', outreachAngle: 'Has all contacts + basic site. Upgrade to modern booking with direct payment.', source: 'Instagram / Google Maps' },
  { name: 'Riad Tassili Restaurant',    type: 'restaurant', city: 'Chefchaouen',                                                                    website: 'none',  priority: 'warm', outreachAngle: 'Riad + African/Moroccan restaurant no website. Menu + reservation site is quick win.', source: 'Google Maps' },
  { name: 'Dar Elrio',                  type: 'riad',       city: 'Chefchaouen', phone: '+212 663 485 608',  instagram: '@dar.elrio',               website: 'none',  priority: 'warm', outreachAngle: 'Has phone + Instagram. Rooftop terrace B&B no website — direct booking opportunity.',  source: 'Instagram / Google Maps' },
  { name: 'Dar Echchaouen',             type: 'riad',       city: 'Chefchaouen',                                                                    website: 'basic', priority: 'warm', outreachAngle: 'Has basic contact page only. Offer full website with galleries and booking system.',      source: 'darechchaouen.com' },

  // ── Fes Riads ─────────────────────────────────────────────────────────────
  { name: 'Riad Green House Fes',       type: 'riad',       city: 'Fes',         phone: '+212 658 516 343',  instagram: '@riadgreenhousefes',        website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only Fes riad with phone. Easy WhatsApp reach + DM combo.',              source: 'Instagram / Google Maps' },
  { name: 'Riad Alassala Fes',          type: 'riad',       city: 'Fes',         phone: '+212 774 191 560',  instagram: '@riadalassala',             website: 'none',  priority: 'hot',  outreachAngle: 'Active Instagram riad in Fes medina no website. Show RiadConnect as proof.',        source: 'Instagram / Google Maps' },
  { name: 'Riad Fes Iline',             type: 'riad',       city: 'Fes',         phone: '+212 696 079 790',  instagram: '@riadfesiline',             website: 'none',  priority: 'hot',  outreachAngle: 'Instagram + phone but no website. Great WhatsApp target.',                          source: 'Instagram / Google Maps' },
  { name: 'Riad Kettani Fes Medina',    type: 'riad',       city: 'Fes',         instagram: '@riad_kettani_fes_medina',                              website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only medina riad in Fes. DM with RiadConnect demo.',                      source: 'Instagram' },
  { name: 'Riad Noor Medina',           type: 'riad',       city: 'Fes',                                                                            website: 'none',  priority: 'hot',  outreachAngle: 'Listed on Booking.com only — no own website. Show cost of OTA commissions lost.',     source: 'Booking.com' },
  { name: "R'Mila Medina Fez",          type: 'riad',       city: 'Fes',                                                                            website: 'none',  priority: 'hot',  outreachAngle: 'On Booking.com with no own site. Losing 15–20% per booking to OTA commissions.',     source: 'Booking.com' },
  { name: 'Riad Fes Center',            type: 'riad',       city: 'Fes',                                                                            website: 'basic', priority: 'warm', outreachAngle: 'Fes medina riad with basic online presence. Offer modern redesign.',                    source: 'Google Maps' },
  { name: 'Riad Safir Medina Fes',      type: 'riad',       city: 'Fes',                                                                            website: 'basic', priority: 'warm', outreachAngle: 'On Booking.com with minimal own site. Pitch direct booking system to cut OTA fees.',   source: 'Booking.com' },
  { name: 'Riad El Amine Fes',          type: 'riad',       city: 'Fes',         phone: '+212 535 740 750',  email: 'contact@riadelaminefes.com',    instagram: '@riadelaminefes',           website: 'yes',   priority: 'warm', outreachAngle: 'Has phone + email + Instagram. Historic Hotels member. Pitch luxury website redesign.', source: 'riadelaminefes.com' },
  // ── Fes Riads — Google Maps verified ─────────────────────────────────────
  { name: 'Riad Fes Unique',           type: 'riad',       city: 'Fes',         phone: '+212 535 74 12 06',                                             website: 'none',  priority: 'hot',  outreachAngle: 'Verified no website — Google Maps "Add website". 155 reviews, 4.1 stars. Rue Talaa Kebira medina.', source: 'Google Maps' },
  { name: 'Dar dahab Fes',             type: 'riad',       city: 'Fes',         phone: '+212 661 51 35 03',                                             website: 'none',  priority: 'hot',  outreachAngle: 'Confirmed no website. 16 reviews, 4.9 stars. Rue Talaa Kebira. Small high-rated guesthouse.', source: 'Google Maps' },
  { name: 'Dar Saida Fes',             type: 'riad',       city: 'Fes',         phone: '+212 666 10 02 21',                                             website: 'basic', priority: 'warm', outreachAngle: 'Uses Xtadia booking template (dersaida.xtadia.com) — not a real website. Upgrade to custom site.', source: 'Google Maps' },
  { name: 'Dar Mehdi Fes',             type: 'riad',       city: 'Fes',         phone: '+212 535 74 14 99',                                             website: 'basic', priority: 'warm', outreachAngle: 'Free .morocco-ma.website domain — looks unprofessional. 64 reviews, 4.7 stars. Easy upgrade sell.', source: 'Google Maps' },

  // ── Essaouira Riads ───────────────────────────────────────────────────────
  { name: 'Riad Emotion Essaouira',     type: 'riad',       city: 'Essaouira',   phone: '+212 524 472 309',  email: 'contact@riademotion.com',       website: 'yes',   priority: 'warm', outreachAngle: 'Email + phone. Has website but dated — offer redesign with surf/yoga booking.',    source: 'riademotion.com' },
  { name: 'Riad Hotel Essaouira',       type: 'riad',       city: 'Essaouira',                                                                      website: 'basic', priority: 'warm', outreachAngle: 'Basic direct booking page. Offer full website with payment + multilingual support.', source: 'riadhotelessaouira.com' },
  { name: 'Riad Mogador Essaouira',     type: 'riad',       city: 'Essaouira',                                                                      website: 'basic', priority: 'warm', outreachAngle: 'Historic medina riad. Pitch modern site with wind-sport activity booking.',           source: 'Google Maps' },
  { name: 'Dar Lassale Essaouira',      type: 'riad',       city: 'Essaouira',                                                                      website: 'none',  priority: 'hot',  outreachAngle: 'Essaouira riad on OTAs only. Direct booking site = more revenue per stay.',          source: 'Google Maps' },

  // ── Other Cities ──────────────────────────────────────────────────────────
  { name: 'Riad Ouarzazate',            type: 'riad',       city: 'Ouarzazate',                                                                     website: 'basic', priority: 'warm', outreachAngle: 'Gateway to Sahara riad. Pitch desert + film studio tours booking integration.',       source: 'riad-ouarzazate.com' },
  { name: 'Kasbah Tamsna Ouarzazate',   type: 'riad',       city: 'Ouarzazate',                                                                     website: 'none',  priority: 'hot',  outreachAngle: 'Kasbah-style riad near film studios. No website = massive lost booking opportunity.',  source: 'Google Maps' },
  { name: 'Riad Parfums Ouarzazate',    type: 'riad',       city: 'Ouarzazate',                                                                     website: 'none',  priority: 'hot',  outreachAngle: 'No website near Aït Benhaddou. Tourists search Google — no site = invisible.',        source: 'Google Maps' },
  { name: 'Riad Merzouga Desert',       type: 'riad',       city: 'Merzouga',    email: 'Riadmerzougakech@gmail.com',                                website: 'basic', priority: 'warm', outreachAngle: 'Desert riad. Basic site. Pitch dune experience + camel trek booking integration.',   source: 'riadmerzouga.com' },
  { name: 'Auberge Sahara Merzouga',    type: 'riad',       city: 'Merzouga',                                                                       website: 'none',  priority: 'hot',  outreachAngle: 'Desert guesthouse no website. Tourists can\'t find it online = major revenue loss.', source: 'Google Maps' },
  { name: 'Riad Rabat Medina',          type: 'riad',       city: 'Rabat',                                                                          website: 'none',  priority: 'hot',  outreachAngle: 'Capital city riad targeting business + diplomatic travelers. No website.',             source: 'Google Maps' },
  { name: 'Riad Dar Zitoun Meknes',     type: 'riad',       city: 'Meknès',                                                                         website: 'none',  priority: 'hot',  outreachAngle: 'Meknès medina riad. Underserved city — first to pitch = easy win.',                   source: 'Google Maps' },
  { name: 'Riad Tangier Medina',        type: 'riad',       city: 'Tangier',                                                                        website: 'none',  priority: 'hot',  outreachAngle: 'Tangier gateway to Europe. High-value European tourists — no website = missed sales.',  source: 'Google Maps' },
  { name: 'Riad Asilah',                type: 'riad',       city: 'Asilah',                                                                         website: 'none',  priority: 'hot',  outreachAngle: 'Beach town riad popular with Spaniards. Instagram only. Starter package pitch.',       source: 'Google Maps' },
  { name: 'Riad Tetouan',               type: 'riad',       city: 'Tétouan',                                                                        website: 'none',  priority: 'hot',  outreachAngle: 'UNESCO medina riad. No website. High cultural tourism = booking site quick win.',      source: 'Google Maps' },
  { name: 'Riad Imlil Atlas',           type: 'riad',       city: 'Imlil',                                                                          website: 'none',  priority: 'hot',  outreachAngle: 'Atlas mountain trekking base riad. No website. Hikers book everything online.',        source: 'Google Maps' },
  { name: 'Kasbah Agafay Desert',       type: 'riad',       city: 'Agafay',                                                                         website: 'none',  priority: 'hot',  outreachAngle: 'Desert glamping riad near Marrakech. Instagram-only. High-end market = premium site.',  source: 'Google Maps' },
  { name: 'Riad Agadir Medina',         type: 'riad',       city: 'Agadir',                                                                         website: 'none',  priority: 'hot',  outreachAngle: 'Agadir draws 3M tourists/year — riad with no website is invisible to them.',           source: 'Google Maps' },
];

// ─── GET /api/leads — list all leads (admin only) ────────────────────────────
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, type, priority } = req.query;
    const where = {};
    if (status)   where.status   = status;
    if (type)     where.type     = type;
    if (priority) where.priority = priority;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, leads });
  } catch (err) { next(err); }
});

// ─── POST /api/leads/import — upsert: adds missing leads, skips existing ──────
router.post('/import', protect, authorize('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.lead.findMany({ select: { name: true } });
    const existingNames = new Set(existing.map(l => l.name));
    const missing = DEFAULT_LEADS.filter(l => !existingNames.has(l.name));

    if (missing.length === 0) {
      const total = await prisma.lead.count();
      return res.json({ success: true, message: `All ${total} leads already imported.`, count: total });
    }

    await prisma.lead.createMany({ data: missing });
    const total = await prisma.lead.count();
    res.json({ success: true, message: `Added ${missing.length} new leads. Total: ${total}.`, count: total });
  } catch (err) { next(err); }
});

// ─── POST /api/leads/sync-contacts — push DEFAULT_LEADS contacts into DB ─────
router.post('/sync-contacts', protect, authorize('admin'), async (req, res, next) => {
  try {
    let updated = 0;
    for (const lead of DEFAULT_LEADS) {
      if (!lead.phone && !lead.email && !lead.instagram) continue;
      const existing = await prisma.lead.findFirst({ where: { name: lead.name } });
      if (!existing) continue;
      const patch = {};
      if (lead.phone     && !existing.phone)     patch.phone     = lead.phone;
      if (lead.email     && !existing.email)     patch.email     = lead.email;
      if (lead.instagram && !existing.instagram) patch.instagram = lead.instagram;
      if (Object.keys(patch).length > 0) {
        await prisma.lead.update({ where: { id: existing.id }, data: patch });
        updated++;
      }
    }
    res.json({ success: true, message: `Updated contact info for ${updated} leads.`, updated });
  } catch (err) { next(err); }
});

// ─── POST /api/leads — create a lead ─────────────────────────────────────────
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, type, city, phone, email, instagram, website, priority, outreachAngle, source, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });
    const lead = await prisma.lead.create({
      data: { name, type: type || 'riad', city: city || '', phone, email, instagram, website, priority: priority || 'warm', outreachAngle, source, notes },
    });
    res.status(201).json({ success: true, lead });
  } catch (err) { next(err); }
});

// ─── PUT /api/leads/:id — update lead (status, notes, etc.) ──────────────────
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, notes, priority, email, phone, instagram } = req.body;
    const data = {};
    if (status    !== undefined) data.status    = status;
    if (notes     !== undefined) data.notes     = notes;
    if (priority  !== undefined) data.priority  = priority;
    if (email     !== undefined) data.email     = email;
    if (phone     !== undefined) data.phone     = phone;
    if (instagram !== undefined) data.instagram = instagram;

    const lead = await prisma.lead.update({ where: { id: req.params.id }, data });
    res.json({ success: true, lead });
  } catch (err) { next(err); }
});

// ─── DELETE /api/leads/:id ────────────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── POST /api/leads/:id/email — send outreach email ─────────────────────────
router.post('/:id/email', protect, authorize('admin'), async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    if (!lead.email) return res.status(400).json({ success: false, message: 'This lead has no email address.' });

    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ success: false, message: 'Subject and body are required.' });

    const result = await sendEmail({ to: lead.email, subject, html: body });

    if (result.sent) {
      await prisma.lead.update({
        where: { id: lead.id },
        data:  { status: 'emailed', emailSentAt: new Date() },
      });
    }

    res.json({ success: result.sent, result });
  } catch (err) { next(err); }
});

// ─── GET /api/leads/templates — return outreach templates ────────────────────
router.get('/templates', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { type = 'riad', name = 'your business' } = req.query;
    const tpl = templates.outreach({ name, type });
    res.json({ success: true, subject: tpl.subject, html: tpl.html });
  } catch (err) { next(err); }
});

module.exports = router;
