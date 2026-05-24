'use client';

/**
 * MBN DEV — cinematic code-only text logo.
 *
 * Layers (bottom → top):
 *   1. Soft ambient bloom  (abs-positioned blurred radial gradient)
 *   2. Chrome metallic text  (CSS gradient + background-clip: text)
 *   3. Custom "E"  (three neon purple bars with multi-stop box-shadow bloom)
 *   4. Container drop-shadow  (purple glow around the whole mark)
 *
 * Font: Space Grotesk 700 (loaded in globals.css) → fallback Arial Black.
 * Zero images. Zero dependencies beyond React.
 */

import type { CSSProperties } from 'react';

// ─── Public types ──────────────────────────────────────────────────────────

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  size?:    LogoSize;
  className?: string;
  variant?: string; // legacy prop — kept for backward compat, always ignored
}

// ─── Size tokens ───────────────────────────────────────────────────────────
//
//  fs   — font-size px
//  ls   — letter-spacing (em multiplier, e.g. 0.14 → "0.14em")
//  eW   — width of the custom-E placeholder (≈ 0.55 × fs)
//  bH   — bar height px
//  glow — outer drop-shadow blur budget

const CFG: Record<LogoSize, { fs: number; ls: number; eW: number; bH: number; glow: number }> = {
  xs: { fs: 11, ls: 0.10, eW:  6,  bH: 1.6, glow:  6 },
  sm: { fs: 14, ls: 0.12, eW:  8,  bH: 2.0, glow:  8 },
  md: { fs: 18, ls: 0.14, eW: 10,  bH: 2.6, glow: 11 },
  lg: { fs: 24, ls: 0.15, eW: 13,  bH: 3.4, glow: 15 },
  xl: { fs: 32, ls: 0.16, eW: 18,  bH: 4.5, glow: 20 },
};

// ─── Chrome gradient (mimics real polished metal: bright → dark → bright) ─

const CHROME =
  'linear-gradient(175deg,' +
  '#ffffff 0%,'    +   // top glare
  '#edf1f4 9%,'    +   // bright silver
  '#c5d1d9 24%,'   +   // silver
  '#8ca0ae 39%,'   +   // dark valley
  '#6b8595 49%,'   +   // deepest chrome
  '#96acb8 59%,'   +   // rising
  '#c3d0d8 72%,'   +   // brighter
  '#e6edf1 84%,'   +   // near-white
  '#f8fafc 93%,'   +   // highlight
  '#ffffff 100%'   +   // bottom glare
  ')';

// ─── Component ─────────────────────────────────────────────────────────────

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const { fs, ls, eW, bH, glow } = CFG[size];

  const lsPx = fs * ls;       // letter-spacing in px (for manual spacing)
  const capH = fs * 0.72;     // approx cap-height (72 % of font-size)

  // ── Base text style (chrome gradient) ─────────────────────────────────
  const txt: CSSProperties = {
    fontFamily:           'var(--font-logo)',
    fontSize:             fs,
    fontWeight:           700,
    letterSpacing:        `${ls}em`,
    lineHeight:           1,
    background:           CHROME,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    display:              'inline-block',
  };

  // ── Neon bar style factory ─────────────────────────────────────────────
  //   bright = top / bottom bars (slightly more intense)
  //   !bright = middle bar (shorter, slightly cooler hue)
  const neonBar = (bright: boolean): CSSProperties => ({
    width:        bright ? '100%' : '68%',
    height:       bH,
    borderRadius: Math.max(1, bH * 0.4),
    background: bright
      ? 'linear-gradient(90deg,#fae8ff 0%,#e879f9 45%,#a855f7 100%)'
      : 'linear-gradient(90deg,#e9d5ff 0%,#c084fc 45%,#7c3aed 100%)',
    boxShadow: bright
      // Multi-stop bloom: tight core → wide aurora
      ? [
          `0 0 ${bH * 1.2}px rgba(255,210,255,.95)`,
          `0 0 ${bH * 3.5}px rgba(240,171,252,1.00)`,
          `0 0 ${bH * 7  }px rgba(192,132,252,.85)`,
          `0 0 ${bH * 13 }px rgba(168, 85,247,.60)`,
          `0 0 ${bH * 22 }px rgba(139, 92,246,.35)`,
          `0 0 ${bH * 36 }px rgba(124, 58,237,.15)`,
        ].join(',')
      : [
          `0 0 ${bH * 1.2}px rgba(233,213,255,.90)`,
          `0 0 ${bH * 3.5}px rgba(192,132,252,.90)`,
          `0 0 ${bH * 7  }px rgba(168, 85,247,.70)`,
          `0 0 ${bH * 13 }px rgba(139, 92,246,.45)`,
          `0 0 ${bH * 22 }px rgba(124, 58,237,.22)`,
        ].join(','),
    display: 'block',
  });

  return (
    <div
      className={className}
      style={{
        // Layout
        display:    'inline-flex',
        alignItems: 'center',
        position:   'relative',
        userSelect: 'none',
        flexShrink: 0,
        lineHeight: 1,
        // Outer glow — applied to the composited shape of all children
        filter: [
          `drop-shadow(0 0 ${glow * 0.35}px rgba(192,132,252,.55))`,
          `drop-shadow(0 0 ${glow * 0.80}px rgba(168, 85,247,.30))`,
          `drop-shadow(0 0 ${glow * 1.60}px rgba(124, 58,237,.16))`,
          `drop-shadow(0 0 ${glow * 2.80}px rgba(109, 40,217,.07))`,
        ].join(' '),
      }}
    >
      {/* ── 1. Ambient bloom behind the mark ─────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:  'absolute',
          // bloom bleeds slightly outside the bounding box
          top:    `${-fs * 1.1}px`,
          bottom: `${-fs * 1.1}px`,
          left:   `${-fs * 0.5}px`,
          right:  `${-fs * 0.5}px`,
          background:
            `radial-gradient(ellipse 90% 80% at 40% 55%,` +
            `rgba(139,92,246,.20) 0%,` +
            `rgba(109,40,217,.08) 45%,` +
            `transparent 75%)`,
          filter:       `blur(${glow * 1.1}px)`,
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* ── 2. Logo text + custom E ───────────────────────────────────── */}
      <div
        style={{
          position:   'relative',
          zIndex:     1,
          display:    'inline-flex',
          alignItems: 'center',
        }}
      >
        {/* MBN — with letter-spacing */}
        <span style={txt}>MBN</span>

        {/* Word gap (≈ 1.5× a single letter-spacing gap) */}
        <span style={{ width: lsPx * 1.5, flexShrink: 0 }} />

        {/* D — no trailing letter-spacing (E bars follow immediately) */}
        <span style={{ ...txt, letterSpacing: 0 }}>D</span>

        {/* Custom E: three horizontal neon bars ───────────────────── */}
        <span
          style={{
            display:        'inline-flex',
            flexDirection:  'column',
            justifyContent: 'space-between',
            width:          eW,
            height:         capH,
            flexShrink:     0,
            alignSelf:      'center',
            // symmetric horizontal margins equal to the D→next-char spacing
            marginLeft:     lsPx * 0.68,
            marginRight:    lsPx * 0.68,
            // tiny downward correction to optically align with cap-height baseline
            marginBottom:   fs * 0.015,
          }}
        >
          <span style={neonBar(true)}  /> {/* top    — full width, brightest  */}
          <span style={neonBar(false)} /> {/* middle — 68 % width, cooler hue */}
          <span style={neonBar(true)}  /> {/* bottom — full width, brightest  */}
        </span>

        {/* V — no trailing letter-spacing */}
        <span style={{ ...txt, letterSpacing: 0 }}>V</span>
      </div>
    </div>
  );
}
