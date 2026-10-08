'use strict';

/**
 * Careers — the roles people can apply for on /careers, their role-specific
 * questions, and validation of a submitted application.
 *
 * Keep ROLE_QUESTIONS in sync with frontend/src/lib/careers.ts (the form
 * renders from that copy; this one is what the API accepts).
 */

const url = { type: 'url' };
const text = { type: 'text' };

const DEV = {
  mainStack: { ...text, required: true },
  github:    { ...url },
  project:   { ...url },
};

const ROLE_QUESTIONS = {
  'frontend-developer':   DEV,
  'backend-developer':    DEV,
  'mobile-developer':     DEV,
  'ui-ux-designer':       { tools: { ...text, required: true }, caseStudy: { ...url } },
  'motion-designer':      { tools: { ...text, required: true }, showreel: { ...url, required: true } },
  'graphic-designer':     { tools: { ...text, required: true }, specialties: { ...text } },
  'video-editor':         { software: { ...text, required: true }, showreel: { ...url, required: true } },
  'social-media-manager': { platforms: { ...text, required: true }, accountLink: { ...url } },
  open:                   { desiredRole: { ...text, required: true } },
};

const ROLE_TITLES = {
  'frontend-developer':   'Frontend Developer',
  'backend-developer':    'Backend Developer',
  'mobile-developer':     'Mobile Developer',
  'ui-ux-designer':       'UI/UX Designer',
  'motion-designer':      'Motion Graphics Designer',
  'graphic-designer':     'Graphic Designer',
  'video-editor':         'Video Editor',
  'social-media-manager': 'Social Media & Content Manager',
  open:                   'Open application',
};

const EXPERIENCE   = ['<1', '1-2', '3-5', '5+'];
const AVAILABILITY = ['now', '2-weeks', '1-month', 'later'];
const HOURS        = ['<10', '10-20', '20-30', '30+'];
const LANGUAGES    = ['Arabic', 'French', 'English', 'Spanish'];
const STATUSES     = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];

const CV_EXTS = new Set(['.pdf', '.doc', '.docx']);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v, max) {
  if (typeof v !== 'string') return '';
  // Strip control chars (incl. null bytes) and angle brackets — this is plain text.
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanUrl(v) {
  const s = clean(v, 300);
  if (!s) return '';
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function parseJson(v, fallback) {
  if (typeof v !== 'string') return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}

/**
 * Validate a multipart application body (all values arrive as strings).
 * Returns { data } ready for prisma, or { error } with a user-facing message.
 */
function validateApplication(body = {}) {
  const role = clean(body.role, 40);
  const questions = ROLE_QUESTIONS[role];
  if (!questions) return { error: 'Please choose a role.' };

  const fullName = clean(body.fullName, 100);
  if (fullName.length < 2) return { error: 'Please enter your full name.' };

  const email = clean(body.email, 160).toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };

  const phone = clean(body.phone, 30);
  if (phone && !/^[+()\d\s.-]{6,30}$/.test(phone)) return { error: 'Please enter a valid phone number.' };

  const experienceYears = clean(body.experienceYears, 5);
  if (!EXPERIENCE.includes(experienceYears)) return { error: 'Please choose your years of experience.' };

  const availability = clean(body.availability, 10);
  if (!AVAILABILITY.includes(availability)) return { error: 'Please choose when you can start.' };

  const weeklyHours = clean(body.weeklyHours, 6);
  if (weeklyHours && !HOURS.includes(weeklyHours)) return { error: 'Please choose your weekly availability.' };

  const portfolioUrl = cleanUrl(body.portfolioUrl);
  const linkedinUrl  = cleanUrl(body.linkedinUrl);
  if (portfolioUrl === null) return { error: 'The portfolio link is not a valid URL.' };
  if (linkedinUrl === null)  return { error: 'The LinkedIn link is not a valid URL.' };

  const languagesRaw = parseJson(body.languages, []);
  const languages = Array.isArray(languagesRaw) ? languagesRaw.filter((l) => LANGUAGES.includes(l)) : [];

  const answersRaw = parseJson(body.answers, {});
  const answers = {};
  for (const [key, q] of Object.entries(questions)) {
    const raw = answersRaw && typeof answersRaw === 'object' ? answersRaw[key] : '';
    const value = q.type === 'url' ? cleanUrl(raw) : clean(raw, 500);
    if (value === null) return { error: 'One of the links is not a valid URL.' };
    if (q.required && !value) return { error: 'Please answer all the required questions.' };
    if (value) answers[key] = value;
  }

  return {
    data: {
      role, fullName, email,
      phone:        phone || null,
      location:     clean(body.location, 100) || null,
      experienceYears, availability,
      weeklyHours:  weeklyHours || null,
      expectedRate: clean(body.expectedRate, 80) || null,
      portfolioUrl: portfolioUrl || null,
      linkedinUrl:  linkedinUrl || null,
      languages,
      answers,
      message:      clean(body.message, 2000) || null,
    },
  };
}

// Create the table on first use (idempotent) so the feature works on a fresh
// deploy before prisma/migrate18.js has been run by hand.
let ensured = null;
function ensureTable(prisma) {
  if (!ensured) {
    const statements = require('../../prisma/migrate18.sql.js');
    ensured = (async () => { for (const sql of statements) await prisma.$executeRawUnsafe(sql); })()
      .catch((err) => { ensured = null; throw err; });
  }
  return ensured;
}

module.exports = {
  ROLE_QUESTIONS, ROLE_TITLES, EXPERIENCE, AVAILABILITY, HOURS, LANGUAGES, STATUSES, CV_EXTS,
  validateApplication, ensureTable,
};
