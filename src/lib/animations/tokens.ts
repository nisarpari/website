/**
 * Animation Tokens - Unified timing and easing system for luxury feel
 *
 * These tokens ensure consistent, premium animations across the site.
 * All durations are intentionally slower than typical web animations
 * to create a sophisticated, luxurious experience.
 */

// Duration scale (in seconds)
export const duration = {
  instant: 0.1,    // Micro-interactions (button press feedback)
  fast: 0.2,       // Quick feedback (hover states, toggles)
  normal: 0.4,     // Standard transitions (cards, dropdowns)
  slow: 0.6,       // Emphasized transitions (modals, reveals)
  slower: 0.8,     // Hero elements, page sections
  slowest: 1.2,    // Page transitions, major reveals
  hero: 1.5,       // Hero section animations
} as const;

// Easing curves for luxury feel
export const easing = {
  // Smooth deceleration - main luxury easing (expo out)
  luxuryOut: [0.16, 1, 0.3, 1] as const,

  // Smooth acceleration and deceleration (quart in-out)
  luxuryInOut: [0.76, 0, 0.24, 1] as const,

  // Standard material design easing
  smooth: [0.4, 0, 0.2, 1] as const,

  // Slight overshoot for playful elements
  bounce: [0.34, 1.56, 0.64, 1] as const,

  // Gentle spring-like ease
  spring: [0.43, 0.13, 0.23, 0.96] as const,

  // Linear for progress indicators
  linear: [0, 0, 1, 1] as const,
} as const;

// CSS easing strings for Tailwind/CSS animations
export const cssEasing = {
  luxuryOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  luxuryInOut: 'cubic-bezier(0.76, 0, 0.24, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
} as const;

// Stagger delays for sequential animations
export const stagger = {
  fast: 0.05,      // Rapid succession
  normal: 0.08,    // Standard stagger
  slow: 0.12,      // Emphasized sequence
  slower: 0.15,    // Dramatic reveal
} as const;

// Common animation distances
export const distance = {
  xs: 10,          // Subtle movement
  sm: 20,          // Standard fade-in offset
  md: 30,          // Emphasized entrance
  lg: 50,          // Hero reveals
  xl: 80,          // Page transitions
} as const;

// Scale values for hover/press states
export const scale = {
  press: 0.98,     // Button press
  subtle: 1.02,    // Subtle hover lift
  normal: 1.05,    // Standard hover zoom
  emphasis: 1.08,  // Image hover
  large: 1.1,      // Hero image zoom
} as const;

// Blur values for focus effects
export const blur = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
} as const;

// Shadow elevation for hover states
export const elevation = {
  rest: '0 4px 20px rgba(0, 0, 0, 0.06)',
  hover: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
  lifted: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
  floating: '0 30px 60px -15px rgba(0, 0, 0, 0.25)',
} as const;

// Export type for TypeScript
export type Duration = typeof duration;
export type Easing = typeof easing;
export type Stagger = typeof stagger;
