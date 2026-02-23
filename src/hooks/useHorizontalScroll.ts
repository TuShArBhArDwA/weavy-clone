'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface UseHorizontalScrollReturn {
    /** Ref to attach to the scrollable container */
    scrollRef: React.RefObject<HTMLDivElement | null>;
    /** Whether left scroll is possible */
    canScrollLeft: boolean;
    /** Whether right scroll is possible */
    canScrollRight: boolean;
    /** Scroll left by specified amount */
    scrollLeft: (amount?: number) => void;
    /** Scroll right by specified amount */
    scrollRight: (amount?: number) => void;
    /** Manual scroll check trigger */
    checkScroll: () => void;
}

interface UseHorizontalScrollOptions {
    /** Default scroll amount in pixels */
    scrollAmount?: number;
}

/**
 * Custom hook for horizontal scrollable containers
 * Provides scroll state and navigation functions
 * 
 * @param options - Configuration options
 * @returns Scroll ref, state, and navigation functions
 * 
 * @example
 * ```tsx
 * const { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useHorizontalScroll();
 * 
 * return (
 *   <div>
 *     <button onClick={scrollLeft} disabled={!canScrollLeft}>←</button>
 *     <div ref={scrollRef} className="overflow-x-auto">
 *       {items.map(item => <Card key={item.id} />)}
 *     </div>
 *     <button onClick={scrollRight} disabled={!canScrollRight}>→</button>
 *   </div>
 * );
 * ```
 */
export function useHorizontalScroll(
    options: UseHorizontalScrollOptions = {}
): UseHorizontalScrollReturn {
    const { scrollAmount: defaultScrollAmount = 400 } = options;
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    }, []);

    const scrollLeft = useCallback((amount?: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: -(amount ?? defaultScrollAmount),
                behavior: 'smooth',
            });
        }
    }, [defaultScrollAmount]);

    const scrollRight = useCallback((amount?: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: amount ?? defaultScrollAmount,
                behavior: 'smooth',
            });
        }
    }, [defaultScrollAmount]);

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [checkScroll]);

    // Attach scroll listener to the ref element
    useEffect(() => {
        const element = scrollRef.current;
        if (element) {
            element.addEventListener('scroll', checkScroll);
            return () => element.removeEventListener('scroll', checkScroll);
        }
    }, [checkScroll]);

    return {
        scrollRef,
        canScrollLeft,
        canScrollRight,
        scrollLeft,
        scrollRight,
        checkScroll,
    };
}
