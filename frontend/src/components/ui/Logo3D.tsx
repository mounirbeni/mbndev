'use client';

import Image from 'next/image';

/** Official MBN DEV identity: approved purple MBN monogram and wordmark. */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  size?: LogoSize;
  className?: string;
  /** Kept for compatibility with existing callers. */
  variant?: string;
}

const SIZES: Record<LogoSize, { icon: number; font: number; gap: number }> = {
  xs: { icon: 20, font: 10, gap: 4 },
  sm: { icon: 25, font: 13, gap: 5 },
  md: { icon: 32, font: 17, gap: 6 },
  lg: { icon: 39, font: 21, gap: 8 },
  xl: { icon: 60, font: 31, gap: 11 },
};

export default function Logo3D({ size = 'md', className = '' }: Props) {
  const { icon, font, gap } = SIZES[size];
  return (
    <span
      className={className}
      role="img"
      aria-label="MBN DEV"
      style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, gap, whiteSpace: 'nowrap', lineHeight: 1 }}
    >
      <Image
        src="/brand-icon.webp"
        alt=""
        aria-hidden="true"
        width={256}
        height={256}
        style={{ width: icon, height: icon, flexShrink: 0, objectFit: 'contain', mixBlendMode: 'screen' }}
      />
      <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'Inter, Arial, sans-serif', fontSize: font, fontWeight: 900, letterSpacing: '-0.015em' }}>
        <span style={{ color: '#f4f0ff', textShadow: '0 0 8px rgba(196,181,253,0.18)' }}>MBN</span>
        <span style={{ marginLeft: font * 0.33, color: '#a855f7', textShadow: '0 0 9px rgba(168,85,247,0.27)' }}>DEV</span>
      </span>
    </span>
  );
}
