'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, ArrowRight, MapPin, Clock, Briefcase, Code2, Database,
  Smartphone, Palette, ChevronDown, Globe, Star, Users, Rocket,
  MessageCircle, ArrowUpRight, CheckCircle2, Sparkles, Film, PenTool,
  Megaphone, Video,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
};

type Role = {
  id: number;
  title: string;
  icon: React.ElementType;
  type: string;
  location: string;
  commitment: string;
  gradient: string;
  accent: string;
  border: string;
  summary: string;
  skills: string[];
  responsibilities: string[];
  nice: string[];
};

const roles: Role[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    icon: Code2,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-violet-600/30 to-blue-500/15',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    summary: 'Build pixel-perfect, performant UIs for client projects using React and Next.js. You will collaborate directly with Mounir on real projects shipped to real users.',
    skills: ['React', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    responsibilities: [
      'Implement responsive, accessible UI components from design specs',
      'Integrate REST APIs and handle client-side state',
      'Optimise Core Web Vitals and Lighthouse scores',
      'Participate in code reviews and maintain code quality standards',
    ],
    nice: ['Familiarity with Prisma / PostgreSQL', 'Experience with SSE or WebSockets', 'Eye for UI/UX details'],
  },
  {
    id: 2,
    title: 'Backend Developer',
    icon: Database,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-sky-600/30 to-cyan-500/15',
    accent: 'text-sky-400',
    border: 'border-sky-500/20',
    summary: 'Architect and build scalable APIs, authentication systems, and database schemas for web platforms. Work with the existing Express + Prisma + PostgreSQL stack.',
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'Prisma ORM', 'REST APIs'],
    responsibilities: [
      'Design and implement RESTful API endpoints',
      'Write Prisma schema migrations and seed scripts',
      'Implement JWT auth, RBAC, and rate limiting',
      'Integrate third-party services (Stripe, Nodemailer, Vercel Blob)',
    ],
    nice: ['Experience with Redis or BullMQ', 'Knowledge of SSE / real-time patterns', 'Vercel or serverless deployment experience'],
  },
  {
    id: 3,
    title: 'Mobile Developer',
    icon: Smartphone,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-emerald-600/30 to-teal-500/15',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    summary: 'Turn web products into polished mobile experiences using React Native or PWA techniques. Focus on native-feel UX, offline capability, and app store delivery.',
    skills: ['React Native', 'Expo', 'TypeScript', 'PWA APIs', 'App Store deployment'],
    responsibilities: [
      'Build cross-platform iOS & Android apps with React Native / Expo',
      'Convert existing Next.js apps into installable PWAs',
      'Implement push notifications, offline caching, and device APIs',
      'Handle App Store and Play Store submission workflows',
    ],
    nice: ['Experience with EAS Build (Expo)', 'Knowledge of Capacitor or Tauri', 'Familiarity with native module bridging'],
  },
  {
    id: 4,
    title: 'UI/UX Designer',
    icon: Palette,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-rose-600/30 to-pink-500/15',
    accent: 'text-rose-400',
    border: 'border-rose-500/20',
    summary: 'Create stunning, conversion-optimised designs for client websites and web apps. From wireframes to high-fidelity Figma prototypes — you own the visual experience.',
    skills: ['Figma', 'Design Systems', 'Responsive Design', 'Prototyping', 'UI Animation'],
    responsibilities: [
      'Design wireframes, mockups, and interactive Figma prototypes',
      'Build and maintain scalable design systems and component libraries',
      'Conduct UX audits and propose improvements on existing projects',
      'Collaborate with developers to ensure pixel-perfect implementation',
    ],
    nice: ['Familiarity with Tailwind CSS utility classes', 'Experience with Lottie or CSS animations', 'Understanding of Core Web Vitals'],
  },
  {
    id: 5,
    title: 'Motion Graphics Designer',
    icon: Film,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-fuchsia-600/30 to-purple-500/15',
    accent: 'text-fuchsia-400',
    border: 'border-fuchsia-500/20',
    summary: 'Bring projects to life through animation — from micro-interactions on the web to full brand motion packages and video intros. Your work sets the energy of every product we ship.',
    skills: ['After Effects', 'Lottie / Rive', 'Adobe Premiere', 'CSS Animation', 'GSAP'],
    responsibilities: [
      'Create animated UI components and micro-interactions for web projects',
      'Produce brand motion packages: logo animations, intro/outro sequences',
      'Export Lottie / Rive files for seamless integration into React apps',
      'Collaborate with UI designers to ensure motion feels cohesive with the brand',
    ],
    nice: ['Experience with 3D motion (Cinema 4D / Spline)', 'Knowledge of SVG animation', 'Short-form social video editing'],
  },
  {
    id: 6,
    title: 'Graphic Designer',
    icon: PenTool,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-amber-600/30 to-yellow-500/15',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
    summary: 'Design print and digital brand assets for client projects — from full brand identity kits to social media content and marketing collateral.',
    skills: ['Adobe Illustrator', 'Photoshop', 'Brand Identity', 'Typography', 'Figma'],
    responsibilities: [
      'Create logos, brand identities, and full visual guidelines',
      'Design social media templates, banners, and marketing materials',
      'Produce print-ready assets (brochures, business cards, flyers)',
      'Maintain brand consistency across all delivered assets',
    ],
    nice: ['Experience with packaging design', 'Arabic typography knowledge', 'Photo retouching skills'],
  },
  {
    id: 7,
    title: 'Video Editor',
    icon: Video,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Project-based',
    gradient: 'from-cyan-600/30 to-blue-500/15',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/20',
    summary: 'Edit and produce promotional videos, product demos, and social content for client launches. You turn raw footage and assets into polished, shareable content.',
    skills: ['Adobe Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Color Grading', 'Audio Mixing'],
    responsibilities: [
      'Edit promotional and explainer videos for web product launches',
      'Create short-form content optimised for Instagram, TikTok, and YouTube',
      'Add motion graphics, captions, and sound design to video assets',
      'Deliver in multiple formats and aspect ratios for cross-platform use',
    ],
    nice: ['Experience with screen recording / product walkthroughs', 'AI video tools (Runway, Sora)', 'Arabic / French voiceover sourcing'],
  },
  {
    id: 8,
    title: 'Social Media & Content Manager',
    icon: Megaphone,
    type: 'Freelance',
    location: 'Remote',
    commitment: 'Part-time / Ongoing',
    gradient: 'from-green-600/30 to-teal-500/15',
    accent: 'text-green-400',
    border: 'border-green-500/20',
    summary: 'Manage and grow MBN DEV\'s social presence across Instagram, LinkedIn, and TikTok. Write engaging content, schedule posts, and help turn our portfolio work into leads.',
    skills: ['Instagram', 'LinkedIn', 'TikTok', 'Copywriting', 'Content Strategy'],
    responsibilities: [
      'Plan and schedule weekly content across Instagram, LinkedIn, and TikTok',
      'Write captions, threads, and short-form copy that showcase our work',
      'Repurpose project deliverables into engaging case study content',
      'Monitor analytics and iterate based on performance data',
    ],
    nice: ['Experience with Arabic or French content creation', 'Basic Canva / design skills', 'Knowledge of B2B SaaS marketing'],
  },
];

const perks = [
  { icon: Globe,        title: '100% Remote',         desc: 'Work from anywhere. Async-first communication with clear scopes.' },
  { icon: Briefcase,    title: 'Real Projects',        desc: 'Every project ships to real clients with live users — no fake demos.' },
  { icon: Star,         title: 'Fair Pay',             desc: 'Competitive per-project rates agreed upfront — no surprises.' },
  { icon: Rocket,       title: 'Fast Feedback',        desc: 'You talk directly to Mounir — decisions in hours, not sprint cycles.' },
  { icon: Users,        title: 'Tight Team',           desc: 'Small, focused collaboration with zero agency overhead.' },
  { icon: Sparkles,     title: 'Portfolio Worthy',     desc: 'Projects you will actually want to show off.' },
];

const process = [
  { n: '01', title: 'Apply via WhatsApp or Email', desc: 'Send a short intro, your GitHub / portfolio link, and which role interests you.' },
  { n: '02', title: 'Quick Intro Call',            desc: 'A 20-minute chat to align on skills, availability, and working style.' },
  { n: '03', title: 'Paid Trial Task',             desc: 'A small scoped task (paid) so we can both evaluate the fit before committing.' },
  { n: '04', title: 'First Project',               desc: 'Onboard to your first real client project with a clear brief and timeline.' },
];

export default function CareersPage() {
  const [openRole, setOpenRole] = useState<number | null>(null);

  const toggle = (id: number) => setOpenRole((prev) => (prev === id ? null : id));

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" />
              We&rsquo;re hiring collaborators
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              Build Real Products.{' '}
              <span className="gradient-text">Get Paid Well.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              MBN DEV is a Moroccan product studio building web platforms for clients worldwide.
              We&rsquo;re looking for talented freelance collaborators to work on project-based engagements — remote, async-friendly, and results-driven.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#roles">
                <Button size="lg" className="group">
                  View Open Roles
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a
                href="https://wa.me/212705914424?text=Hi%20Mounir%2C%20I'm%20interested%20in%20a%20collaboration%20opportunity%20at%20MBN%20DEV."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="ghost" className="group">
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Perks ── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="section-label mb-4">Why Collaborate With Us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
              Built for{' '}
              <span className="gradient-text">independent builders</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-2xl border border-white/8 p-6 flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                  <perk.icon className="w-4.5 h-4.5 text-primary-400" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{perk.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Roles ── */}
      <section id="roles" className="pb-24 px-4 sm:px-6 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="section-label mb-4">Open Positions</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
              8 roles open{' '}
              <span className="gradient-text">right now</span>
            </h2>
            <p className="text-slate-500 mt-3 text-sm">All positions are freelance · remote · project-based</p>
          </motion.div>

          <div className="space-y-3">
            {roles.map((role, i) => {
              const isOpen = openRole === role.id;
              return (
                <motion.div
                  key={role.id}
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`glass rounded-2xl border ${role.border} overflow-hidden`}
                >
                  {/* Header row */}
                  <button
                    onClick={() => toggle(role.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shrink-0`}>
                      <role.icon className={`w-5 h-5 ${role.accent}`} />
                    </div>

                    {/* Title + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-white font-bold">{role.title}</span>
                        <span className="text-[10px] bg-green-500/15 border border-green-500/25 text-green-400 rounded-full px-2 py-0.5 font-semibold">
                          Open
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Briefcase className="w-3 h-3" /> {role.type}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {role.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" /> {role.commitment}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    </motion.div>
                  </button>

                  {/* Expandable body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className={`border-t border-white/8 p-5 bg-gradient-to-b ${role.gradient} bg-opacity-5`}>
                          <p className="text-slate-400 text-sm leading-relaxed mb-6">{role.summary}</p>

                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Responsibilities */}
                            <div>
                              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">Responsibilities</h4>
                              <ul className="space-y-2">
                                {role.responsibilities.map((r) => (
                                  <li key={r} className="flex gap-2 text-xs text-slate-400 leading-snug">
                                    <CheckCircle2 className={`w-3.5 h-3.5 ${role.accent} shrink-0 mt-0.5`} />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Nice to have */}
                            <div>
                              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">Nice to Have</h4>
                              <ul className="space-y-2">
                                {role.nice.map((n) => (
                                  <li key={n} className="flex gap-2 text-xs text-slate-400 leading-snug">
                                    <Zap className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                                    {n}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {role.skills.map((s) => (
                              <span key={s} className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${role.border} ${role.accent} bg-white/4`}>
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Apply CTA */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={`https://wa.me/212705914424?text=Hi%20Mounir%2C%20I'm%20interested%20in%20the%20${encodeURIComponent(role.title)}%20position%20at%20MBN%20DEV.`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" className="group w-full sm:w-auto">
                                Apply via WhatsApp
                                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </Button>
                            </a>
                            <a href={`mailto:contact@mbndev.ma?subject=Application: ${role.title}&body=Hi Mounir,%0A%0AI'm interested in the ${role.title} role at MBN DEV.%0A%0AMy portfolio/GitHub: %0A%0AAbout me: `}>
                              <Button size="sm" variant="ghost" className="w-full sm:w-auto">
                                Apply via Email
                              </Button>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Hiring process ── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="section-label mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
              From application to{' '}
              <span className="gradient-text">first project</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {process.map((step, i) => (
              <motion.div
                key={step.n}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-2xl border border-white/8 p-6 flex gap-5"
              >
                <div
                  className="text-4xl font-black leading-none select-none shrink-0 tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(168,85,247,0.12) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {step.n}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1.5">{step.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open application CTA ── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative glass rounded-3xl border border-white/8 p-10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%)' }} />

            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" />
              Don&rsquo;t see your role?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 relative">
              Send an open application
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed relative">
              If you are a skilled developer or designer and believe you&rsquo;d be a great fit for MBN DEV — even if your exact role isn&rsquo;t listed — reach out. We&rsquo;re always interested in talented people.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
              <a
                href="https://wa.me/212705914424?text=Hi%20Mounir%2C%20I'd%20like%20to%20submit%20an%20open%20application%20to%20collaborate%20with%20MBN%20DEV."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="group">
                  Open Application — WhatsApp
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </a>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="group">
                  Send a Message
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
