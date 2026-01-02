'use client';

import { ReactNode } from 'react';
import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion';

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Provides global motion configuration
 *
 * Features:
 * - Respects user's reduced motion preference
 * - Lazy loads motion features for better performance
 *
 * Usage: Wrap your app in layout.tsx
 * <MotionProvider>
 *   <YourApp />
 * </MotionProvider>
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
