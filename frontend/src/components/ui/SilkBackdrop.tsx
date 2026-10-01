import SilkRibbons from './SilkRibbons';

interface SilkBackdropProps {
  /** Positioning/size classes for the backdrop box (it is absolutely positioned). */
  className?: string;
  /** Ribbon position inside the box, 0..1 from the bottom-left. */
  anchor?: [number, number];
  intensity?: number;
  speed?: number;
  /**
   * Darkens the area where the page's text sits so the ribbon never fights it.
   * 'center' for centered heroes, 'left' for left-aligned ones.
   */
  scrim?: 'center' | 'left' | 'none';
}

// Scrim gradients live in globals.css (.silk-scrim-*) so they can widen on phones.

/**
 * The silk ribbon as a page backdrop: faded in at the top and out at the bottom
 * with a mask, so it blends into whatever background sits behind it.
 *
 * It sits at z-index -1, so the parent must create a stacking context
 * (e.g. `relative isolate`) or the backdrop will drop behind the page.
 */
export default function SilkBackdrop({
  className = 'absolute inset-x-0 top-0 h-[100vh]',
  anchor = [0.62, 0.55],
  intensity = 0.8,
  speed = 0.8,
  scrim = 'center',
}: SilkBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden -z-10 ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 62%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 62%, transparent 100%)',
      }}
    >
      <SilkRibbons className="absolute inset-0" anchor={anchor} intensity={intensity} speed={speed} />
      {scrim !== 'none' && <div className={`absolute inset-0 silk-scrim-${scrim}`} />}
    </div>
  );
}
