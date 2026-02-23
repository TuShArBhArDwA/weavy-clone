'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design that tracks media query matches
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create event listener
        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', handleChange);

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [query]);

    return matches;
}

export default useMediaQuery;
