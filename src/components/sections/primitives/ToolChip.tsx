'use client';

import type { ToolChipProps } from '../types';

/**
 * Interactive tool chip component for the Professional Tools section
 * Displays a pill-shaped button that highlights on hover
 * 
 * @example
 * ```tsx
 * <ToolChip
 *   label="Crop"
 *   isActive={activeTool === 'crop'}
 *   onHover={() => setActiveTool('crop')}
 *   onLeave={() => setActiveTool('default')}
 *   className="absolute top-[23%] left-[3%]"
 * />
 * ```
 */
export const ToolChip = ({
  label,
  isActive,
  onHover,
  onLeave,
  onClick,
  className = '',
  style,
}: ToolChipProps) => {
  return (
    <div
      className={`
        pointer-events-auto cursor-pointer transition-all duration-300 ease-out 
        px-8 md:px-6 py-2 md:py-3 rounded-full border text-[14px] md:text-[18px] font-normal z-20
        shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:scale-[1.02]
        ${isActive
          ? 'bg-[#f7ff9e] text-black border-[#f7ff9e]'
          : 'bg-white text-[#666] border-white/80 hover:border-white'
        }
        ${className}
      `}
      style={style}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick || onHover}
    >
      <div className="whitespace-nowrap">{label}</div>
    </div>
  );
};

