interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CFG = {
  sm: { box: 28, r: 9,  sw: 1.8 },
  md: { box: 36, r: 11, sw: 2.0 },
  lg: { box: 48, r: 14, sw: 2.2 },
  xl: { box: 64, r: 18, sw: 2.5 },
} as const;

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const { box, r, sw } = CFG[size];
  const icon = Math.round(box * 0.55);

  return (
    <div
      className={className}
      style={{
        width:          box,
        height:         box,
        borderRadius:   r,
        background:     'linear-gradient(140deg, #8b5cf6 0%, #7c3aed 55%, #6d28d9 100%)',
        boxShadow:      '0 2px 14px rgba(124,58,237,0.5), 0 0 0 1px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      {/* top-left gloss */}
      <div style={{
        position:      'absolute',
        inset:         0,
        background:    'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 52%)',
        pointerEvents: 'none',
      }} />

      {/* </> mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 20 20"
        fill="none"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* < */}
        <path
          d="M7 4.5L2.5 10L7 15.5"
          stroke="white"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* > */}
        <path
          d="M13 4.5L17.5 10L13 15.5"
          stroke="white"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* / */}
        <path
          d="M11.5 3L8.5 17"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={sw * 0.85}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
