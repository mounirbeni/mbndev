import Image from 'next/image';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CFG = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
} as const;

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const box = CFG[size];

  return (
    <div
      className={className}
      style={{
        width:          box,
        height:         box,
        flexShrink:     0,
        position:       'relative',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src="/OFLG.jpeg"
        alt="MBN DEV"
        width={box}
        height={box}
        style={{
          width:       box,
          height:      box,
          objectFit:   'contain',
          mixBlendMode: 'multiply',
        }}
        priority
      />
    </div>
  );
}
