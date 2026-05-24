import Image from 'next/image';

interface Props {
  /** 'icon' = square crystal only (logo-app.jpeg), 'full' = wide official logo (OFLG.jpeg) */
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Heights for the icon variant (square)
const ICON_SIZE = { sm: 28, md: 36, lg: 48, xl: 64 } as const;

// Heights for the full horizontal logo variant
const FULL_H = { sm: 28, md: 36, lg: 48, xl: 60 } as const;

export default function Logo3D({ variant = 'icon', size = 'md', className = '' }: Props) {
  if (variant === 'full') {
    const h = FULL_H[size];
    // OFLG.jpeg is 1456×816 ≈ 16:9 → width = h * (1456/816)
    const w = Math.round(h * (1456 / 816));
    return (
      <Image
        src="/OFLG.jpeg"
        alt="MBN DEV"
        width={w}
        height={h}
        className={className}
        style={{ width: w, height: h, objectFit: 'contain', flexShrink: 0 }}
        priority
      />
    );
  }

  const box = ICON_SIZE[size];
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
