interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CFG = {
  sm: { w: 28,  h: 28,  font: 11, depth: 3, step: 0.45, r: '9px'  },
  md: { w: 36,  h: 36,  font: 14, depth: 4, step: 0.55, r: '11px' },
  lg: { w: 48,  h: 48,  font: 19, depth: 5, step: 0.70, r: '14px' },
  xl: { w: 64,  h: 64,  font: 26, depth: 6, step: 0.90, r: '18px' },
} as const;

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const c = CFG[size];

  /* layered text-shadow creates 3-D extrusion + glow */
  const shadow = [
    ...Array.from({ length: c.depth }, (_, i) => {
      const o     = ((i + 1) * c.step).toFixed(2);
      const alpha = (0.95 - i * 0.12).toFixed(2);
      return `${o}px ${o}px 0 rgba(10,0,40,${alpha})`;
    }),
    '0 0 14px rgba(167,139,250,0.55)',
  ].join(', ');

  return (
    <div
      className={className}
      style={{
        width:          c.w,
        height:         c.h,
        borderRadius:   c.r,
        background:     'linear-gradient(145deg, #1e0a42 0%, #0f0521 55%, #08031a 100%)',
        boxShadow:      [
          '0 0 0 1px rgba(139,92,246,0.35)',
          '0 4px 20px rgba(124,58,237,0.45)',
          '0 0 40px rgba(124,58,237,0.15)',
          'inset 0 1px 0 rgba(255,255,255,0.1)',
          'inset 0 -1px 0 rgba(0,0,0,0.4)',
        ].join(', '),
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        position:       'relative',
        overflow:       'hidden',
        flexShrink:     0,
      }}
    >
      {/* top-left gloss shine */}
      <div style={{
        position:      'absolute',
        inset:         0,
        background:    'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 52%)',
        pointerEvents: 'none',
        borderRadius:  c.r,
      }} />

      {/* bottom rim shadow for depth */}
      <div style={{
        position:      'absolute',
        bottom:        0,
        left:          0,
        right:         0,
        height:        '30%',
        background:    'linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* 3-D MB monogram */}
      <span
        style={{
          fontSize:             c.font,
          fontWeight:           900,
          letterSpacing:        '-0.06em',
          lineHeight:           1,
          userSelect:           'none',
          /* silver → lavender → purple gradient fill */
          background:           'linear-gradient(170deg, #ffffff 0%, #ede9fe 20%, #c4b5fd 50%, #8b5cf6 80%, #6d28d9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
          /* 3-D depth layers */
          textShadow:           shadow,
          /* outer glow */
          filter:               'drop-shadow(0 0 5px rgba(167,139,250,0.85))',
          fontFamily:           '"Inter","SF Pro Display",system-ui,-apple-system,sans-serif',
          position:             'relative',
          zIndex:               1,
        }}
      >
        MB
      </span>
    </div>
  );
}
