'use client';

/**
 * MBN DEV — pure-code text logo.
 * No images. JSX + inline styles only.
 * The "E" in DEV is rendered as 3 horizontal purple neon bars.
 */

import type { CSSProperties } from 'react';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  size?: LogoSize;
  className?: string;
  /** legacy compat — ignored, always renders text logo */
  variant?: string;
}

/* ── per-size tokens ──────────────────────────────────────────── */
const CFG: Record<LogoSize, {
  fs:   number; // font-size px
  ls:   number; // letter-spacing multiplier (× em)
  eW:   number; // width of custom-E element px
  bH:   number; // height of each bar px
}> = {
  xs: { fs: 11, ls: 0.10, eW:  7, bH: 1.4 },
  sm: { fs: 14, ls: 0.12, eW:  9, bH: 1.8 },
  md: { fs: 18, ls: 0.14, eW: 11, bH: 2.3 },
  lg: { fs: 24, ls: 0.15, eW: 15, bH: 3.0 },
  xl: { fs: 32, ls: 0.16, eW: 20, bH: 4.0 },
};

/* ── shared text gradient (metallic silver-white) ─────────────── */
const METALLIC: CSSProperties = {
  background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 30%, #94a3b8 62%, #cbd5e1 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
};

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const { fs, ls, eW, bH } = CFG[size];

  const lsPx  = fs * ls;           // letter-spacing in px
  const capH  = fs * 0.72;         // approximate cap-height

  /* shared text style */
  const txt: CSSProperties = {
    ...METALLIC,
    fontSize:      fs,
    fontWeight:    900,
    letterSpacing: `${ls}em`,
    fontFamily:    '"Arial Black","Helvetica Neue",Arial,sans-serif',
    lineHeight:    1,
  };

  /* purple bar styles */
  const bar = (full: boolean): CSSProperties => ({
    width:        full ? '100%' : '70%',
    height:       bH,
    borderRadius: 1,
    background:   full
      ? 'linear-gradient(90deg,#f0abfc,#a855f7)'
      : 'linear-gradient(90deg,#c084fc,#7c3aed)',
    boxShadow: full
      ? `0 0 ${bH * 3.5}px rgba(168,85,247,0.95),0 0 ${bH * 6}px rgba(139,92,246,0.45)`
      : `0 0 ${bH * 2.5}px rgba(124,58,237,0.80)`,
    display: 'block',
  });

  return (
    <div
      className={className}
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        userSelect: 'none',
        flexShrink: 0,
        lineHeight: 1,
        /* purple glow on the whole logo via drop-shadow filter */
        filter:
          `drop-shadow(0 0 ${fs * 0.5}px rgba(168,85,247,0.40))` +
          ` drop-shadow(0 0 ${fs * 1.1}px rgba(124,58,237,0.18))`,
      }}
    >
      {/* ── MBN ── */}
      <span style={txt}>MBN</span>

      {/* word gap (slightly wider than letter-spacing) */}
      <span style={{ width: lsPx * 1.4, flexShrink: 0 }} />

      {/* ── D ── (no trailing letter-spacing — E follows immediately) */}
      <span style={{ ...txt, letterSpacing: 0 }}>D</span>

      {/* ── Custom E — three purple horizontal bars ── */}
      <span
        style={{
          display:        'inline-flex',
          flexDirection:  'column',
          justifyContent: 'space-between',
          width:          eW,
          height:         capH,
          flexShrink:     0,
          alignSelf:      'center',
          marginLeft:     lsPx * 0.62,
          marginRight:    lsPx * 0.62,
          /* tiny optical baseline correction */
          marginBottom:   fs * 0.01,
        }}
      >
        <span style={bar(true)}  />   {/* top    — full width  */}
        <span style={bar(false)} />   {/* middle — 70 % width  */}
        <span style={bar(true)}  />   {/* bottom — full width  */}
      </span>

      {/* ── V ── */}
      <span style={{ ...txt, letterSpacing: 0 }}>V</span>
    </div>
  );
}
