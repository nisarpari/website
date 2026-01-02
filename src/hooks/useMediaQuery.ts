'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * Returns null during SSR/initial render to avoid hydration mismatch
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook to detect if screen is desktop (lg breakpoint: 1024px)
 * Returns null during SSR to allow skeleton/loading state
 */
export function useIsDesktop(): boolean | null {
  return useMediaQuery('(min-width: 1024px)');
}
