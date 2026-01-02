/**
 * Framer Motion Variants - Reusable animation presets
 *
 * Use these variants across components for consistent animations.
 * Import and spread into motion components.
 */

import { Variants, Transition } from 'framer-motion';
import { duration, easing, distance, stagger, scale } from './tokens';

// Base transition presets
export const transition = {
  luxury: {
    duration: duration.slow,
    ease: easing.luxuryOut,
  } as Transition,

  fast: {
    duration: duration.fast,
    ease: easing.luxuryOut,
  } as Transition,

  normal: {
    duration: duration.normal,
    ease: easing.luxuryOut,
  } as Transition,

  slow: {
    duration: duration.slower,
    ease: easing.luxuryOut,
  } as Transition,

  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  } as Transition,
};

// Fade in from bottom (most common entrance)
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: distance.sm,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.luxury,
  },
  exit: {
    opacity: 0,
    y: -distance.xs,
    transition: transition.fast,
  },
};

// Fade in from top
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -distance.sm,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.luxury,
  },
};

// Simple fade (no movement)
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transition.luxury,
  },
  exit: {
    opacity: 0,
    transition: transition.fast,
  },
};

// Scale up entrance
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transition.luxury,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: transition.fast,
  },
};

// Slide from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -distance.md,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition.luxury,
  },
  exit: {
    opacity: 0,
    x: -distance.sm,
    transition: transition.fast,
  },
};

// Slide from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: distance.md,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition.luxury,
  },
  exit: {
    opacity: 0,
    x: distance.sm,
    transition: transition.fast,
  },
};

// Container for staggered children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.normal,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: stagger.fast,
      staggerDirection: -1,
    },
  },
};

// Fast stagger container
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fast,
      delayChildren: 0.05,
    },
  },
};

// Slow stagger container for hero sections
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.slow,
      delayChildren: 0.2,
    },
  },
};

// Individual stagger item
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: distance.sm,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.luxuryOut,
    },
  },
};

// Modal/Dialog animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: distance.sm,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.luxuryOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: distance.xs,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
};

// Modal backdrop
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

// Dropdown menu
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -distance.xs,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: easing.luxuryOut,
    },
  },
  exit: {
    opacity: 0,
    y: -distance.xs,
    scale: 0.98,
    transition: {
      duration: duration.fast,
    },
  },
};

// Card hover effect
export const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    transition: transition.normal,
  },
  hover: {
    y: -8,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    transition: transition.normal,
  },
};

// Button press effect
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Image zoom on hover
export const imageZoom = {
  rest: {
    scale: 1,
    transition: {
      duration: duration.slower,
      ease: easing.smooth,
    },
  },
  hover: {
    scale: scale.emphasis,
    transition: {
      duration: duration.hero,
      ease: easing.smooth,
    },
  },
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: distance.sm,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.luxuryOut,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    y: -distance.xs,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
};

// Hero section reveal
export const heroReveal: Variants = {
  hidden: {
    opacity: 0,
    y: distance.lg,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slowest,
      ease: easing.luxuryOut,
    },
  },
};

// Text reveal (character by character)
export const textRevealContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

export const textRevealChar: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.luxuryOut,
    },
  },
};

// Floating animation (for decorative elements)
export const floatingVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Subtle pulse
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
