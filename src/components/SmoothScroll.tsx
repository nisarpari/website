'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Optimized Smooth Scroll Component
 *
 * Features:
 * - Respects prefers-reduced-motion
 * - Pauses when tab is not visible
 * - Luxury easing curve
 */
export default function SmoothScroll() {
    const lenisRef = useRef<Lenis | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        // Initialize Lenis with luxury easing
        const lenis = new Lenis({
            duration: 1.0, // Slightly faster for better UX
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo out
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            touchMultiplier: 1.5, // Reduced for better mobile control
            wheelMultiplier: 1,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Optimized RAF loop
        function raf(time: number) {
            lenis.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
        }

        // Start animation loop
        rafIdRef.current = requestAnimationFrame(raf);

        // Pause when tab is not visible (saves CPU/battery)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (rafIdRef.current) {
                    cancelAnimationFrame(rafIdRef.current);
                    rafIdRef.current = null;
                }
                lenis.stop();
            } else {
                lenis.start();
                rafIdRef.current = requestAnimationFrame(raf);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for reduced motion preference changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionPreference = (e: MediaQueryListEvent) => {
            if (e.matches) {
                lenis.destroy();
            }
        };
        mediaQuery.addEventListener('change', handleMotionPreference);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            mediaQuery.removeEventListener('change', handleMotionPreference);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            lenis.destroy();
        };
    }, []);

    return null;
}
