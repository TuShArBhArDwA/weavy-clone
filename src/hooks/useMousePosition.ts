'use client';

import { useState, useCallback, MouseEvent, RefObject } from 'react';
import type { MousePosition } from '../components/sections/types';

interface UseMousePositionReturn {
    /** Current mouse position (normalized -0.5 to 0.5) */
    mousePos: MousePosition;
    /** Handler for mouse move events */
    handleMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
    /** Handler for mouse leave events */
    handleMouseLeave: () => void;
}

/**
 * Custom hook for tracking mouse position relative to a container
 * Returns normalized coordinates from -0.5 to 0.5
 * 
 * @param containerRef - Ref to the container element
 * @returns Mouse position and event handlers
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { mousePos, handleMouseMove, handleMouseLeave } = useMousePosition(containerRef);
 * 
 * return (
 *   <div 
 *     ref={containerRef}
 *     onMouseMove={handleMouseMove}
 *     onMouseLeave={handleMouseLeave}
 *   >
 *     <div style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}>
 *       Follow mouse
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useMousePosition(
    containerRef: RefObject<HTMLDivElement | null>
): UseMousePositionReturn {
    const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        setMousePos({ x, y });
    }, [containerRef]);

    const handleMouseLeave = useCallback(() => {
        setMousePos({ x: 0, y: 0 });
    }, []);

    return {
        mousePos,
        handleMouseMove,
        handleMouseLeave,
    };
}
