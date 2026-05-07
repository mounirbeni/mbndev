'use client';

import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Globe, ShoppingCart, Settings, Rocket, Wrench,
  Check, ArrowRight, Star, Clock, Shield, Zap,
  Code2, Palette, BarChart3, HeadphonesIcon, Package,
  ChevronRight, MessageSquare,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

// ─── Service Data ──────────────────────────────────────────────────────────────

const serviceData: Record<string, {
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  longDesc: string;
  features: string[];
  process: { step: string; title: string; desc: string }[];
  includes: { icon: React.ElementType; label: string; desc: string }[];
  price: string;
  priceNote: string;
  requestType: string;
  color: string;
  border: string;
  accent: string;
  faqs: { q: string; a: string }[];
}> = {
  'custom-websites': {
    icon: Globe,
    title: 'Custom Websites',
    tagline: 'Your brand, perfectly built.',
    description: 'A website that truly represents your business — designed from scratch, built for performance, and made to convert.',
    longDesc: `Your website is your digital storefront. We don't use templates — every pixel is crafted specifically for your brand, your audience, and your goals. Whether you're a local business in Morocco or a growing startup, we build websites that look professional, load fast, and turn visitors into customers.`,
    features: [
      'Pixel-perfect responsive design',
      'SEO-optimized page structure',
      'Google PageSpeed score 90+',
      'CMS integration (editable content)',
      'Google Analytics & Search Console setup',
      'Contact forms & lead capture',
      'Custom domain & hosting guidance',
      'Social media integration',
      'Cookie consent & GDPR ready',
      'Post-launch support included',
    ],
    process: [
      { step: '01', title: 'Discovery Call', desc: 'We learn about your business, goals, audience, and design preferences.' },
      { step: '02', title: 'Design Mockup', desc: 'We create a full design in Figma for your review before any code is written.' },
      { step: '03', title: 'Development', desc: 'We build your site with clean, fast code — responsive on every device.' },
      { step: '04', title: 'Review & Launch', desc: 'You review, request revisions, approve — then we launch live.' },
    ],
    includes: [
      { icon: Palette,   label: 'Custom Design',     desc: 'Built from scratch for your brand' },
      { icon: Code2,     label: 'Clean Code',         desc: 'Fast, maintainable codebase' },
      { icon: BarChart3, label: 'SEO Foundation',     desc: 'Optimized for Google from day one' },
      { icon: Shield,    label: 'Secure & Reliable',  desc: 'HTTPS, secure forms, best practices' },
    ],
    price: 'From $299',
    priceNote: 'Final price depends on number of pages, features, and complexity.',
    requestType: 'custom-website',
    color: 'from-primary-500/15 to-blue-500/5',
    border: 'border-primary-500/30',
    accent: 'text-primary-400',
    faqs: [
      { q: 'How long does it take?', a: 'A standard 5-page website takes 7–14 days from design approval to launch.' },
      { q: 'Can I edit content myself?', a: 'Yes — we integrate a CMS so you can update text, images, and blog posts without code.' },
      { q: 'Do you provide hosting?', a: 'We guide you to set up hosting on Vercel or Netlify (often free) and connect your domain.' },
      { q: 'What if I need changes after launch?', a: 'Every project includes a revision period. Ongoing changes are covered by our Maintenance plan.' },
    ],
  },

  'ecommerce': {
    icon: ShoppingCart,
    title: 'E-Commerce Stores',
    tagline: 'Sell smarter, scale faster.',
    description: 'A full-featured online store that handles everything — from product listings to secure checkout and order management.',
    longDesc: `Selling online requires more than just a product page. We build complete e-commerce solutions with secure payment gateways, smooth checkout flows, and admin dashboards that make managing your store effortless. From boutique shops to large catalogs, we scale with you.`,
    features: [
      'Stripe & PayPal payment integration',
      'Product catalog with filtering & search',
      'Cart & one-page checkout',
      'Order management dashboard',
      'Inventory & stock tracking',
      'Automated order confirmation emails',
      'Discount codes & promotions',
      'Mobile-optimized shopping experience',
      'Customer accounts & order history',
      'Analytics & sales reporting',
    ],
    process: [
      { step: '01', title: 'Store Planning', desc: 'We map out your catalog structure, payment flow, and checkout experience.' },
      { step: '02', title: 'Design & UX', desc: 'We design product pages, cart, and checkout for maximum conversion.' },
      { step: '03', title: 'Build & Integrate', desc: 'We connect Stripe/PayPal, build the admin panel, and set up inventory.' },
      { step: '04', title: 'Test & Launch', desc: 'Full payment testing in sandbox mode, then go live with confidence.' },
    ],
    includes: [
      { icon: Package,        label: 'Product Management', desc: 'Easy catalog & inventory control' },
      { icon: Shield,         label: 'Secure Payments',    desc: 'Stripe & PayPal certified integration' },
      { icon: BarChart3,      label: 'Sales Analytics',    desc: 'Track revenue, orders, and conversion' },
      { icon: HeadphonesIcon, label: 'Post-Launch Support', desc: '30 days of included support' },
    ],
    price: 'From $699',
    priceNote: 'Price varies by catalog size, payment providers, and custom features needed.',
    requestType: 'ecommerce',
    color: 'from-blue-500/15 to-cyan-500/5',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    faqs: [
      { q: 'Which payment methods do you support?', a: 'Stripe (cards), PayPal, and cash-on-delivery. We can add other providers on request.' },
      { q: 'Can I manage products myself?', a: 'Yes — the admin dashboard lets you add/edit/remove products, update stock, and process orders.' },
      { q: 'Is it mobile-friendly?', a: 'Absolutely. Over 60% of online shopping is mobile — we design mobile-first.' },
      { q: 'Can I add more products later?', a: 'Yes, there is no limit on products. The system is built to scale as your catalog grows.' },
    ],
  },

  'web-applications': {
    icon: Settings,
    title: 'Web Applications',
    tagline: 'Custom software, zero compromise.',
    description: 'Tailored web applications built around your specific business workflow — from internal tools to customer-facing platforms.',
    longDesc: `Off-the-shelf software rarely fits perfectly. We build custom web applications that do exactly what your business needs — whether it's a client portal, an internal tool, a booking system, or a complex multi-user platform. Built with modern tech, designed to scale.`,
    features: [
      'Custom business logic & workflows',
      'User authentication & role management',
      'Third-party API & service integration',
      'File upload & document management',
      'Real-time notifications',
      'Reporting & data export',
      'Multi-tenant architecture',
      'REST or GraphQL API development',
      'Admin dashboard & control panel',
      'Scalable cloud deployment',
    ],
    process: [
      { step: '01', title: 'Requirements Deep Dive', desc: 'We document every feature, user role, and workflow before writing a line of code.' },
      { step: '02', title: 'Architecture Design', desc: 'We plan the database schema, API structure, and tech stack for your use case.' },
      { step: '03', title: 'Iterative Development', desc: 'We build in sprints — you review progress every 1–2 weeks.' },
      { step: '04', title: 'QA & Deployment', desc: 'Full testing, staging environment review, then production deployment.' },
    ],
    includes: [
      { icon: Code2,     label: 'Full-Stack Development', desc: 'Frontend + backend + database' },
      { icon: Shield,    label: 'Auth & Security',        desc: 'JWT, roles, encrypted data' },
      { icon: Zap,       label: 'Performance',            desc: 'Optimized queries & caching' },
      { icon: BarChart3, label: 'Analytics & Reporting',  desc: 'Built-in data insights' },
    ],
    price: 'From $999',
    priceNote: 'Complex applications are scoped individually. Contact us for a custom estimate.',
    requestType: 'web-app',
    color: 'from-orange-500/15 to-yellow-500/5',
    border: 'border-orange-500/30',
    accent: 'text-orange-400',
    faqs: [
      { q: 'What tech stack do you use?', a: 'Next.js + TypeScript for the frontend, Node.js/Express for the backend, MongoDB or PostgreSQL for the database.' },
      { q: 'Can you integrate with my existing tools?', a: 'Yes — we regularly integrate with Stripe, Twilio, SendGrid, Google APIs, and custom REST APIs.' },
      { q: 'How do you handle my data?', a: 'All sensitive data is encrypted at rest and in transit. We follow security best practices throughout.' },
      { q: 'What if requirements change mid-project?', a: 'We work with flexible scopes. Changes are discussed, estimated, and added via a formal change request.' },
    ],
  },

  'landing-pages': {
    icon: Rocket,
    title: 'Landing Pages',
    tagline: 'Convert visitors into clients.',
    description: 'High-converting single pages built to capture leads, promote a product, or launch a campaign — fast and focused.',
    longDesc: `A landing page has one job: convert. Every section, headline, and button is engineered to guide your visitor toward a single action — signing up, buying, or contacting you. We combine psychology-backed copywriting structure with fast, beautiful design to maximize your ROI.`,
    features: [
      'Conversion-optimized section layout',
      'Hero section with strong CTA',
      'Social proof & testimonials section',
      'Features / benefits breakdown',
      'Lead capture form with email notification',
      'Mobile-first, sub-2s load time',
      'A/B testing ready structure',
      'Pixel & analytics integration',
      'Custom thank-you / confirmation page',
      'Fast turnaround (3–5 days)',
    ],
    process: [
      { step: '01', title: 'Goal & Audience', desc: 'We define the single conversion goal and the ideal visitor persona.' },
      { step: '02', title: 'Copy & Structure', desc: 'We plan the section flow and headline messaging for maximum impact.' },
      { step: '03', title: 'Design & Build', desc: 'Pixel-perfect design built as a fast, fully responsive page.' },
      { step: '04', title: 'Publish & Track', desc: 'We connect your analytics and publish — ready to run traffic to.' },
    ],
    includes: [
      { icon: Rocket,    label: 'Fast Delivery',    desc: '3–5 business days turnaround' },
      { icon: BarChart3, label: 'Conversion Focus', desc: 'Every element drives action' },
      { icon: Zap,       label: 'Speed',            desc: 'Sub-2s load time guaranteed' },
      { icon: Palette,   label: 'On-Brand Design',  desc: 'Matches your visual identity' },
    ],
    price: 'From $199',
    priceNote: 'Price depends on number of sections, animations, and integrations needed.',
    requestType: 'landing-page',
    color: 'from-green-500/15 to-emerald-500/5',
    border: 'border-green-500/30',
    accent: 'text-green-400',
    faqs: [
      { q: 'How fast can you deliver?', a: 'Most landing pages are live within 3–5 business days after design approval.' },
      { q: 'Can I connect my email marketing tool?', a: 'Yes — we integrate with Mailchimp, ConvertKit, ActiveCampaign, or any service with an API.' },
      { q: 'Is the page hosted on my domain?', a: 'Yes — we deploy to your existing domain or set up a new subdomain (e.g., offer.yourdomain.com).' },
      { q: 'Can I edit the copy myself later?', a: 'We can set it up as a CMS page so you can update text without touching code.' },
    ],
  },

  'maintenance': {
    icon: Wrench,
    title: 'Maintenance & Support',
    tagline: 'We stay after delivery.',
    description: 'Ongoing technical care for your website or app — updates, security, performance, and peace of mind every month.',
    longDesc: `Launching your website is just the beginning. Technology evolves, bugs emerge, and your business needs change. Our maintenance plans keep your site secure, fast, and up-to-date — so you can focus on running your business while we handle the technical side.`,
    features: [
      'Monthly performance & uptime monitoring',
      'Security patches & dependency updates',
      'Bug fixes & error resolution',
      'Content & copy updates (up to 2h/mo)',
      'Monthly health & analytics report',
      'Backup management',
      'Priority response time (<24h)',
      'Feature add-ons at discounted rate',
      'Hosting & domain renewal reminders',
      'Dedicated support channel (WhatsApp/email)',
    ],
    process: [
      { step: '01', title: 'Onboarding', desc: 'We audit your existing site, set up monitoring tools, and create a baseline report.' },
      { step: '02', title: 'Monthly Care', desc: 'Security updates, performance checks, and your requested changes every month.' },
      { step: '03', title: 'Monthly Report', desc: 'You receive a clear report: uptime, speed scores, updates applied, and next actions.' },
      { step: '04', title: 'On-Demand Help', desc: 'Need something urgent? Reach us directly — priority response included.' },
    ],
    includes: [
      { icon: Shield,         label: 'Security Updates',    desc: 'Patches applied as released' },
      { icon: BarChart3,      label: 'Monthly Reports',     desc: 'Transparent, readable summaries' },
      { icon: Clock,          label: 'Priority Support',    desc: 'Response within 24 hours' },
      { icon: HeadphonesIcon, label: 'Dedicated Channel',   desc: 'Direct WhatsApp or email line' },
    ],
    price: 'From $99/mo',
    priceNote: 'Billed monthly. Cancel anytime. Discounts for 6 or 12-month commitments.',
    requestType: 'maintenance',
    color: 'from-slate-500/15 to-slate-600/5',
    border: 'border-slate-500/30',
    accent: 'text-slate-300',
    faqs: [
      { q: 'Do I need to be an existing client?', a: 'No — we can onboard any existing website or app, regardless of who built it.' },
      { q: 'What counts as a "content update"?', a: 'Updating text, swapping images, adding a team member, changing pricing — anything that doesn\'t require new features.' },
      { q: 'Can I cancel anytime?', a: 'Yes — our plans are month-to-month with no lock-in contracts.' },
      { q: 'What if I need a big new feature?', a: 'New features are quoted separately as a project. Maintenance clients get a 15% discount on all new work.' },
    ],
  },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const service = serviceData[slug];
  if (!service) notFound();

  const Icon = service.icon;

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-slate-300 transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">{service.title}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`w-16 h-16 bg-gradient-to-br ${service.color} border ${service.border} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {service.title}
              </h1>
              <p className={`text-lg font-medium mb-4 ${service.accent}`}>{service.tagline}</p>
              <p className="text-slate-400 leading-relaxed mb-8">{service.longDesc}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/request?service=${service.requestType}`}>
                  <Button size="lg" className="group">
                    Start This Project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    <MessageSquare className="w-4 h-4" /> Ask a Question
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right — price card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className={`glass rounded-2xl p-8 border ${service.border} bg-gradient-to-br ${service.color}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">{service.price}</span>
                </div>
                <p className="text-slate-500 text-sm mb-6">{service.priceNote}</p>

                <ul className="space-y-3 mb-8">
                  {service.features.slice(0, 6).map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className="w-5 h-5 bg-primary-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                  {service.features.length > 6 && (
                    <li className="text-xs text-slate-500 pl-7">+ {service.features.length - 6} more features below</li>
                  )}
                </ul>

                <Link href={`/request?service=${service.requestType}`} className="block">
                  <Button size="lg" className="w-full">
                    Get Started — {service.price}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">What's Included</h2>
            <p className="text-slate-400">Everything you get with every {service.title} project.</p>
          </motion.div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {service.includes.map((item, i) => {
              const IncIcon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-5 border border-white/5 text-center"
                >
                  <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <IncIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">{item.label}</div>
                  <div className="text-slate-500 text-xs">{item.desc}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Full feature list */}
          <div className="glass rounded-2xl p-8 border border-white/5">
            <h3 className="text-white font-semibold mb-6">Complete Feature List</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {service.features.map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 bg-primary-500/15 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400">A clear, transparent process from first message to final delivery.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < service.process.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-white/5 z-0" style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
                )}
                <div className="glass rounded-2xl p-6 border border-white/5 relative z-10">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-primary-400 font-bold text-sm">{p.step}</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">{p.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Common Questions</h2>
            <p className="text-slate-400">Quick answers before you reach out.</p>
          </motion.div>

          <div className="space-y-4">
            {service.faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-xl p-6 border border-white/5"
              >
                <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 sm:p-14 text-center border border-primary-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Icon className="w-7 h-7 text-primary-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Tell us about your project and we'll send you a custom quote within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`/request?service=${service.requestType}`}>
                  <Button size="lg" className="group">
                    Start Your {service.title} Project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    <MessageSquare className="w-4 h-4" /> Contact First
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
