'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageVariants } from './variants';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with entrance animation
 *
 * Usage:
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
