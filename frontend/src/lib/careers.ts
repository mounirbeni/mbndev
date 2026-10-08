// Careers — roles, role-specific questions and option labels for the
// application form (/careers) and the admin inbox (/dashboard/admin/careers).
// Keep ROLE_QUESTIONS in sync with backend/src/lib/careers.js, which is what
// the API actually accepts.

export type CareerRole =
  | 'frontend-developer' | 'backend-developer' | 'mobile-developer' | 'ui-ux-designer'
  | 'motion-designer' | 'graphic-designer' | 'video-editor' | 'social-media-manager' | 'open';

export interface RoleQuestion {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'url';
  required?: boolean;
}

const DEV: RoleQuestion[] = [
  { key: 'mainStack', label: 'Main stack & technologies', placeholder: 'e.g. React, Next.js, TypeScript, Tailwind', type: 'text', required: true },
  { key: 'github',    label: 'GitHub profile',            placeholder: 'github.com/your-username', type: 'url' },
  { key: 'project',   label: 'A project you are proud of', placeholder: 'Live link or repository', type: 'url' },
];

export const ROLE_QUESTIONS: Record<CareerRole, RoleQuestion[]> = {
  'frontend-developer': DEV,
  'backend-developer':  DEV,
  'mobile-developer':   DEV,
  'ui-ux-designer': [
    { key: 'tools',     label: 'Design tools you use', placeholder: 'e.g. Figma, FigJam, Framer', type: 'text', required: true },
    { key: 'caseStudy', label: 'Best case study',      placeholder: 'Behance, Dribbble or your site', type: 'url' },
  ],
  'motion-designer': [
    { key: 'tools',    label: 'Software you use', placeholder: 'e.g. After Effects, Rive, GSAP', type: 'text', required: true },
    { key: 'showreel', label: 'Showreel link',    placeholder: 'Vimeo, YouTube or Drive link', type: 'url', required: true },
  ],
  'graphic-designer': [
    { key: 'tools',       label: 'Software you use', placeholder: 'e.g. Illustrator, Photoshop, Figma', type: 'text', required: true },
    { key: 'specialties', label: 'Specialties',      placeholder: 'e.g. branding, print, social media', type: 'text' },
  ],
  'video-editor': [
    { key: 'software', label: 'Editing software', placeholder: 'e.g. Premiere Pro, DaVinci Resolve', type: 'text', required: true },
    { key: 'showreel', label: 'Showreel link',    placeholder: 'Vimeo, YouTube or Drive link', type: 'url', required: true },
  ],
  'social-media-manager': [
    { key: 'platforms',   label: 'Platforms you have managed',  placeholder: 'e.g. Instagram, TikTok, LinkedIn', type: 'text', required: true },
    { key: 'accountLink', label: 'An account you grew',          placeholder: 'Link to the profile', type: 'url' },
  ],
  open: [
    { key: 'desiredRole', label: 'Which role would you like?', placeholder: 'e.g. Copywriter, QA tester, Project manager', type: 'text', required: true },
  ],
};

export const ROLE_TITLES: Record<CareerRole, string> = {
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

export const EXPERIENCE_OPTIONS = [
  { value: '<1',  label: 'Less than 1 year' },
  { value: '1-2', label: '1–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5+',  label: '5+ years' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'now',     label: 'Right away' },
  { value: '2-weeks', label: 'Within 2 weeks' },
  { value: '1-month', label: 'Within a month' },
  { value: 'later',   label: 'Later' },
];

export const HOURS_OPTIONS = [
  { value: '<10',   label: 'Under 10 h / week' },
  { value: '10-20', label: '10–20 h / week' },
  { value: '20-30', label: '20–30 h / week' },
  { value: '30+',   label: '30+ h / week' },
];

export const LANGUAGE_OPTIONS = ['Arabic', 'French', 'English', 'Spanish'];

export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

export const STATUS_STYLE: Record<ApplicationStatus, { label: string; cls: string }> = {
  new:         { label: 'New',         cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  reviewing:   { label: 'Reviewing',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  rejected:    { label: 'Rejected',    cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  hired:       { label: 'Hired',       cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

export const labelOf = (opts: { value: string; label: string }[], v?: string | null) =>
  opts.find((o) => o.value === v)?.label ?? v ?? '—';

export const CV_ACCEPT = '.pdf,.doc,.docx';
export const CV_MAX_BYTES = 4 * 1024 * 1024;
