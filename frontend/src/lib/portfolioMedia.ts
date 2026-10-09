/**
 * Presentation media for portfolio projects, keyed by the cover filename
 * (e.g. '/images/portfolio/abaq.png' → 'abaq').
 *
 * - `mockup`: laptop + phone presentation shot (public/images/portfolio/mockups).
 * - `palette`: three colours taken from the project's own identity. They tint
 *   the silk ribbon behind the home reel and the glow behind portfolio cards,
 *   so each project is lit in its own colours while the MBN DEV frame stays.
 */
export interface ProjectMedia {
  mockup?: string;
  palette: [string, string, string];
}

const M = (slug: string) => `/images/portfolio/mockups/${slug}.webp`;

export const PROJECT_MEDIA: Record<string, ProjectMedia> = {
  tarique:          { mockup: M('tarique'),          palette: ['#1d4ed8', '#60a5fa', '#22d3ee'] },
  chronocraft:      { mockup: M('chronocraft'),      palette: ['#8a6a2f', '#e0b860', '#f6e3b0'] },
  abaq:             { mockup: M('abaq'),             palette: ['#7a5a22', '#d4a24c', '#f5e1a4'] },
  riadconnect:      { mockup: M('riadconnect'),      palette: ['#c2410c', '#f97316', '#fdba74'] },
  'riad-dar-kader': { mockup: M('riad-dar-kader'),   palette: ['#9a3412', '#e07a5f', '#f4c095'] },
  emll:             { mockup: M('emll'),             palette: ['#b45309', '#f97316', '#fcd34d'] },
  caramelio:        { mockup: M('caramelio'),        palette: ['#92400e', '#c2773b', '#f5deb3'] },
  transo:           { mockup: M('transo'),           palette: ['#15803d', '#22c55e', '#f59e0b'] },
  vitacore:         { mockup: M('vitacore'),         palette: ['#0f766e', '#14b8a6', '#7dd3fc'] },
  empowerfit:       { mockup: M('empowerfit'),       palette: ['#be123c', '#e11d48', '#c026d3'] },
  'sitey-andk':     { mockup: M('sitey-andk'),       palette: ['#4f46e5', '#22d3ee', '#f43f5e'] },
  'mbn-health':     { mockup: M('mbn-health'),       palette: ['#4338ca', '#6366f1', '#a5b4fc'] },
  'clinic-manager': { mockup: M('clinic-manager'),   palette: ['#1d4ed8', '#3b82f6', '#facc15'] },
  'edu-platform':   { mockup: M('edu-platform'),     palette: ['#1e40af', '#3b82f6', '#4ade80'] },
  calogym:          { mockup: M('calogym'),          palette: ['#e11d48', '#22c55e', '#22d3ee'] },
  'nour-coffee':    { mockup: M('nour-coffee'),      palette: ['#c2410c', '#ff5a1f', '#ffb547'] },
  // No presentation shot yet: the upscaled homepage capture stands in.
  'lueur-skin':     { mockup: '/images/portfolio/hd/lueur-skin.webp', palette: ['#9f1239', '#f9a8d4', '#fce7f3'] },
  'yed-lmiima':     {                                palette: ['#7c3aed', '#a855f7', '#06b6d4'] },
};

/** Media for a cover path like '/images/portfolio/abaq.png'. */
export function mediaFor(cover: string): ProjectMedia | undefined {
  const slug = cover.split('/').pop()?.replace(/\.[a-z]+$/, '') ?? '';
  return PROJECT_MEDIA[slug];
}
