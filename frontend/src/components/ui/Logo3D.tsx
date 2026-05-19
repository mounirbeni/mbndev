import Image from 'next/image';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CFG = {
  sm: { w: 28, h: 28, img: 36,  r: '9px'  },
  md: { w: 36, h: 36, img: 46,  r: '11px' },
  lg: { w: 48, h: 48, img: 62,  r: '14px' },
  xl: { w: 64, h: 64, img: 82,  r: '18px' },
} as const;

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const c = CFG[size];

  return (
    <div
      className={className}
      style={{
        width:          c.w,
        height:         c.h,
        borderRadius:   c.r,
        background:     'linear-gradient(145deg, #1e0a42 0%, #0f0521 55%, #08031a 100%)',
        boxShadow: [
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
        zIndex:        2,
      }} />

      {/* logo image */}
      <Image
        src="/images/logo.jpeg"
        alt="MBN DEV"
        width={c.img}
        height={c.img}
        className="object-contain"
        style={{
          width:        c.img,
          height:       c.img,
          mixBlendMode: 'screen',
          filter:       'brightness(1.55) contrast(1.1) drop-shadow(0 0 6px rgba(167,139,250,0.7))',
          position:     'relative',
          zIndex:       1,
        }}
      />
    </div>
  );
}
