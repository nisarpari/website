/**
 * Animation Hooks
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Detects if user prefers reduced motion
 * Returns true if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns animation variants that respect reduced motion preference
 */
export function useAnimationVariants<T extends Record<string, unknown>>(
  variants: T,
  reducedVariants?: Partial<T>
): T {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedVariants) {
    return { ...variants, ...reducedVariants } as T;
  }

  if (prefersReducedMotion) {
    // Return static variants (no animation)
    return Object.fromEntries(
      Object.entries(variants).map(([key, value]) => [
        key,
        typeof value === 'object' && value !== null
          ? { opacity: (value as Record<string, unknown>).opacity ?? 1 }
          : value,
      ])
    ) as T;
  }

  return variants;
}
