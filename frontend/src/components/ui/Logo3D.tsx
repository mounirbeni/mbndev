import Image from 'next/image';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
} as const;

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const px = SIZES[size];

  return (
    <Image
      src="/images/logo.jpeg"
      alt="MBN DEV"
      width={px}
      height={px}
      className={className}
      style={{
        width:        px,
        height:       px,
        objectFit:    'contain',
        mixBlendMode: 'screen',
        filter:       'brightness(1.6) contrast(1.15) drop-shadow(0 0 8px rgba(167,139,250,0.65))',
        flexShrink:   0,
      }}
    />
  );
}
