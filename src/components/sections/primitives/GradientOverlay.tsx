'use client';

interface GradientOverlayProps {
  /** Position of the gradient (top or bottom) */
  position: 'top' | 'bottom';
  /** Height of the gradient (default: 25vh for top, 35vh for bottom) */
  height?: string;
  /** Start color (the opaque end) */
  fromColor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable gradient overlay component for sections
 * Creates a smooth fade effect from solid color to transparent
 * 
 * @example
 * ```tsx
 * <GradientOverlay position="top" fromColor="#0a1a1a" />
 * <GradientOverlay position="bottom" fromColor="#4a7c7c" height="35vh" />
 * ```
 */
export const GradientOverlay = ({
  position,
  height,
  fromColor = position === 'top' ? '#0a1a1a' : '#4a7c7c',
  className = '',
}: GradientOverlayProps) => {
  const defaultHeight = position === 'top' ? '25vh' : '35vh';
  const gradientDirection = position === 'top' ? 'to bottom' : 'to top';
  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div
      className={`absolute ${positionClass} left-0 w-full z-20 pointer-events-none ${className}`}
      style={{
        height: height ?? defaultHeight,
        background: `linear-gradient(${gradientDirection}, ${fromColor}, transparent)`,
      }}
    />
  );
};
