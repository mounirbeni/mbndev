import type { CityPageData } from '@/components/landing/CityLandingPage';

export interface CitySeoMeta {
  metaTitle: string;
  metaDescription: string;
}

export const CITY_PAGES: Record<string, CityPageData & CitySeoMeta> = {
  marrakech: {
    city: 'Marrakech',
    metaTitle: 'Web Design & Development in Marrakech, Morocco',
    metaDescription:
      'Custom websites, e-commerce stores, and booking platforms for Marrakech businesses — riads, tour operators, and retailers. Fixed pricing, remote delivery. Get a free quote.',
    heroKicker: 'Serving Marrakech & the Marrakech-Safi region',
    h1: 'Web Design & Development in Marrakech',
    intro: [
      `Marrakech's economy runs on hospitality, tourism, and retail — riads, guesthouses, tour operators, and boutique shops all compete for the same traveler's attention online. A generic template site doesn't cut it when guests are comparing you against dozens of similar listings before they book.`,
      `We build custom websites and booking platforms for Marrakech businesses that need to look professional, load fast on mobile (most travelers browse on their phones), and convert visitors into direct bookings or sales — without paying commission to a third-party platform.`,
    ],
    whyPoints: [
      { title: 'Hospitality & booking experience', desc: 'We\'ve built direct-booking websites for riads and tour operators — room showcases, availability, and reservation flows designed to convert.' },
      { title: 'Mobile-first for travelers', desc: 'Most visitors researching Marrakech stays and activities browse from a phone. Every site we build is fast and fully responsive by default.' },
      { title: 'Remote delivery, local understanding', desc: 'We work with Marrakech clients entirely remotely — video calls, WhatsApp, and a clear review process — while understanding the local hospitality market.' },
      { title: 'Bilingual-ready for FR/EN visitors', desc: 'Marrakech draws visitors from France, Europe, and worldwide. We structure content and CMS fields so a French or English version can be added cleanly.' },
    ],
    serviceBlurbs: [
      { slug: 'custom-websites', note: 'Professional sites for riads, retailers, and service businesses — built to represent your brand, not a template.' },
      { slug: 'ecommerce', note: 'Sell Moroccan crafts, beauty products, or goods online with secure checkout and order management.' },
      { slug: 'web-applications', note: 'Booking systems, guest management tools, or custom platforms for hospitality and tour operators.' },
      { slug: 'landing-pages', note: 'A focused page to promote a seasonal offer, a new riad, or a specific tour package.' },
    ],
    proof: [
      { title: 'Emll — Marrakech Travel Experiences', url: 'https://emll.vercel.app/', description: 'A booking platform for guided tours and activities around Marrakech — desert trips, cooking classes, and mountain adventures with local guides.' },
      { title: 'RiadConnect — Commission-Free Riad Bookings', url: 'https://www.riadconnect.com/', description: 'A hospitality SaaS platform giving Moroccan riads their own booking website, an AI guest assistant, and zero commission fees.' },
      { title: 'RiadDemo — Riad Booking Website', url: 'https://riaddemo.vercel.app', description: 'An elegant booking website for a Moroccan riad with room showcases and a direct reservation flow.' },
    ],
    faqs: [
      { q: 'Do you work with riads and tour operators specifically?', a: 'Yes — we\'ve built booking platforms for the Marrakech hospitality sector, including RiadConnect and Emll. We understand the booking-flow and mobile-first requirements this market needs.' },
      { q: 'Can the website take direct bookings without commission?', a: 'Yes. We build direct booking and payment flows so you keep 100% of your revenue, instead of paying 15-20% to a listing platform.' },
      { q: 'Do you need to meet in person in Marrakech?', a: 'No — the entire process runs remotely over video calls and WhatsApp. Most of our Morocco-based clients never need an in-person meeting.' },
      { q: 'How much does a website cost for a riad or small business in Marrakech?', a: 'A custom business website starts at $799. A booking or e-commerce platform starts at $1,499, depending on features like payments, availability calendars, and admin tools.' },
    ],
  },

  casablanca: {
    city: 'Casablanca',
    metaTitle: 'Web Design & Development in Casablanca, Morocco',
    metaDescription:
      'Custom websites, e-commerce platforms, and business web applications for Casablanca companies — corporate, retail, and logistics. Fixed pricing, fast delivery.',
    heroKicker: 'Serving Casablanca-Settat, Morocco\'s economic capital',
    h1: 'Web Design & Development in Casablanca',
    intro: [
      `Casablanca is Morocco's economic and financial capital — home to corporate headquarters, importers and exporters, logistics companies, and a fast-growing retail and e-commerce sector. Businesses here need websites and platforms that match that scale: fast, secure, and built to handle real transaction volume.`,
      `We build custom business websites, e-commerce stores, and internal web applications for Casablanca companies that have outgrown a basic template or need something purpose-built for their workflow — from a corporate site to a full order-management dashboard.`,
    ],
    whyPoints: [
      { title: 'Built for business, not just brochures', desc: 'Casablanca companies often need more than a static site — client portals, order dashboards, or internal tools. We build custom web applications, not just landing pages.' },
      { title: 'E-commerce that scales', desc: 'From a boutique catalog to a full multi-category store, we\'ve shipped e-commerce platforms serving the Moroccan market with secure payments and inventory tracking.' },
      { title: 'Logistics & operations-aware', desc: 'We\'ve built platforms for peer-to-peer delivery and logistics workflows, so we understand the operational complexity behind a "simple" booking or shipping flow.' },
      { title: 'Fast, professional turnaround', desc: 'A standard business website ships in 7-14 days; e-commerce and custom applications are scoped and quoted upfront with no surprises.' },
    ],
    serviceBlurbs: [
      { slug: 'custom-websites', note: 'A professional corporate or business website that reflects Casablanca\'s competitive market — fast, SEO-optimized, and on-brand.' },
      { slug: 'ecommerce', note: 'Full-featured online stores with secure payments, product catalogs, and order management for growing retail businesses.' },
      { slug: 'web-applications', note: 'Custom internal tools, client portals, or operational dashboards built around your specific business workflow.' },
      { slug: 'maintenance', note: 'Ongoing security updates, monitoring, and support so your platform stays reliable as your business grows.' },
    ],
    proof: [
      { title: 'TyyMaroc — Online Parapharmacie', url: 'https://tyymaroc.vercel.app/', description: 'A Moroccan e-commerce platform for certified beauty, health, and wellness products — bilingual (FR/AR) with 24-48hr local delivery.' },
      { title: 'WatchStoreMaroc — Luxury Watch Store', url: 'https://watchstoremaroc.vercel.app', description: 'A premium e-commerce store for luxury and fashion watches in Morocco, with a curated catalog and smart filtering.' },
      { title: 'CarryLink — P2P Logistics Platform', url: 'https://carrylink.vercel.app/', description: 'A peer-to-peer delivery platform connecting senders with travelers for cost-effective shipping, with full tracking and matching.' },
    ],
    faqs: [
      { q: 'Can you build a platform for our specific business workflow?', a: 'Yes — this is exactly what our Web Applications service covers. We\'ve built logistics, booking, and e-commerce platforms with custom admin dashboards for operational businesses.' },
      { q: 'Do you support local payment methods and delivery in Morocco?', a: 'Yes — we\'ve integrated Moroccan-market e-commerce with local delivery timelines and can add cash-on-delivery, bank transfer, or online payment gateways as needed.' },
      { q: 'How fast can a corporate website be delivered?', a: 'A standard business website is typically live within 7-14 days after design approval. Larger platforms are scoped individually with a clear timeline upfront.' },
      { q: 'Is bilingual (French/Arabic/English) content supported?', a: 'Yes — we\'ve shipped bilingual FR/AR e-commerce platforms and can structure any project\'s content to support multiple languages where needed.' },
    ],
  },

  rabat: {
    city: 'Rabat',
    metaTitle: 'Web Design & Development in Rabat, Morocco',
    metaDescription:
      'Custom websites and web applications for Rabat businesses, institutions, and professional services. Clean, credible design with fixed pricing and remote delivery.',
    heroKicker: 'Serving Rabat-Salé-Kénitra, Morocco\'s capital region',
    h1: 'Web Design & Development in Rabat',
    intro: [
      `As Morocco's administrative and political capital, Rabat is home to government-adjacent organizations, embassies, universities, consultancies, and a growing base of professional services firms. Websites here need to project credibility and clarity first — clean design, accurate information, and a professional tone matter as much as visual polish.`,
      `We build custom websites and web platforms for Rabat-based organizations and businesses that need a site their stakeholders — clients, partners, or the public — can trust at a glance, backed by solid technical fundamentals like security and accessibility.`,
    ],
    whyPoints: [
      { title: 'Credibility-first design', desc: 'For professional services, consultancies, and institutions, we prioritize clarity, accurate information architecture, and a trustworthy visual tone over flashy effects.' },
      { title: 'Security & reliability', desc: 'Every site we build uses HTTPS, secure forms, and modern frameworks — important for organizations handling sensitive client or public information.' },
      { title: 'Multilingual-ready structure', desc: 'Rabat\'s institutional and international audience often needs French, Arabic, and English content. We structure sites so additional languages can be added cleanly.' },
      { title: 'Ongoing support included', desc: 'Professional and institutional sites need to stay accurate and secure long-term — our maintenance plans keep content current and software patched.' },
    ],
    serviceBlurbs: [
      { slug: 'custom-websites', note: 'A credible, professional website for a firm, consultancy, or institution — built to inform and build trust, not just look good.' },
      { slug: 'web-applications', note: 'Client portals, internal tools, or booking/scheduling systems tailored to your organization\'s workflow.' },
      { slug: 'landing-pages', note: 'A focused page for an event, a program announcement, or a specific service offering.' },
      { slug: 'maintenance', note: 'Ongoing updates, security patches, and content changes — important for organizations that can\'t afford downtime or outdated information.' },
    ],
    proof: [
      { title: 'RiadConnect — Hospitality SaaS Platform', url: 'https://www.riadconnect.com/', description: 'A multi-tenant SaaS platform serving Moroccan hospitality businesses nationwide, with an AI guest assistant and SEO tooling built in.' },
      { title: 'TyyMaroc — Online Parapharmacie', url: 'https://tyymaroc.vercel.app/', description: 'A bilingual (FR/AR) e-commerce platform for certified health and wellness products, serving customers across Morocco.' },
    ],
    faqs: [
      { q: 'Do you work with institutions, NGOs, or professional services firms?', a: 'Yes — we build credibility-focused websites for consultancies, firms, and organizations that need clear information architecture and a professional presentation.' },
      { q: 'Can the site support French, Arabic, and English content?', a: 'Yes — we structure the CMS and page templates so additional languages can be added without rebuilding the site.' },
      { q: 'How do you handle security for sensitive organizational sites?', a: 'Every site uses HTTPS, secure contact/data forms, and modern frameworks with a small attack surface. We can add further hardening for specific compliance needs on request.' },
      { q: 'What does ongoing maintenance include?', a: 'Security patches, dependency updates, content changes (up to 2 hours/month), and a monthly health report — so your site stays accurate and secure without you managing it.' },
    ],
  },
};

export type CitySlug = keyof typeof CITY_PAGES;

export function cityMetadata(slug: CitySlug, path: string) {
  const data = CITY_PAGES[slug];
  const url = `https://mbndev.ma/${path}`;
  return {
    title:       data.metaTitle,
    description: data.metaDescription,
    alternates:  { canonical: url },
    openGraph: {
      title:       data.metaTitle,
      description: data.metaDescription,
      url,
      type:        'website' as const,
    },
    twitter: {
      card:        'summary_large_image' as const,
      title:       data.metaTitle,
      description: data.metaDescription,
    },
  };
}

export function cityJsonLd(slug: CitySlug, path: string) {
  const data = CITY_PAGES[slug];
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Web Design & Development in ${data.city}`,
    description: data.metaDescription,
    url: `https://mbndev.ma/${path}`,
    areaServed: { '@type': 'City', name: data.city, addressCountry: 'MA' },
    provider: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.ma' },
  };
}
