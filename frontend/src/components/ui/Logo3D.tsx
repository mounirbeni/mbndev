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
    <Image
      src="/logo-app.jpeg"
      alt="MBN DEV"
      width={box}
      height={box}
      className={className}
      style={{ width: box, height: box, objectFit: 'contain', flexShrink: 0, borderRadius: box * 0.22 }}
      priority
    />
  );
}
