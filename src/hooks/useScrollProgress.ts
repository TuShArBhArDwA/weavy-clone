'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ScrollProgress } from '../components/sections/types';

interface UseScrollProgressOptions {
    /**
     * Threshold multiplier for section height calculation
     * @default 1
     */
    sectionHeightMultiplier?: number;
}

/**
 * Custom hook for tracking scroll progress within a section
 * 
 * @param options - Configuration options
 * @returns Ref to attach to section element and scroll progress state
 * 
 * @example
 * ```tsx
 * const { sectionRef, scrollY, progress } = useScrollProgress();
 * 
 * return (
 *   <section ref={sectionRef}>
 *     <div style={{ transform: `translateY(${scrollY * 10}px)` }}>
 *       Content
 *     </div>
 *   </section>
 * );
 * ```
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}) {
    const { sectionHeightMultiplier = 1 } = options;
    const sectionRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState<ScrollProgress>({
        scrollY: 0,
        progress: 0,
    });

    const handleScroll = useCallback(() => {
        if (!sectionRef.current) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const sectionHeight = rect.height * sectionHeightMultiplier;
        const scrollPos = -rect.top;

        // Calculate normalized progress (0 to 1)
        const progress = Math.max(
            0,
            Math.min(1, scrollPos / (sectionHeight - window.innerHeight))
        );

        // Calculate raw scroll progress for parallax effects
        const scrollProgress = -rect.top / window.innerHeight;

        if (rect.top < window.innerHeight && rect.bottom > 0) {
            setScrollState({
                scrollY: scrollProgress,
                progress,
            });
        }
    }, [sectionHeightMultiplier]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return {
        sectionRef,
        ...scrollState,
    };
}
