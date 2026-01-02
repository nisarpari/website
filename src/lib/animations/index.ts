/**
 * Animation System - Central export
 *
 * Usage:
 * import { duration, easing, fadeInUp, staggerContainer } from '@/lib/animations';
 */

// Tokens - Raw values for custom animations
export {
  duration,
  easing,
  cssEasing,
  stagger,
  distance,
  scale,
  blur,
  elevation,
} from './tokens';

// Variants - Ready-to-use Framer Motion variants
export {
  // Transitions
  transition,

  // Fade animations
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,

  // Slide animations
  slideInLeft,
  slideInRight,

  // Stagger containers
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,

  // Modal/Dialog
  modalVariants,
  backdropVariants,
  dropdownVariants,

  // Interactive states
  cardHover,
  buttonPress,
  imageZoom,

  // Page transitions
  pageVariants,
  heroReveal,

  // Text animations
  textRevealContainer,
  textRevealChar,

  // Decorative
  floatingVariants,
  pulseVariants,
} from './variants';

// Hooks
export { useReducedMotion } from './hooks';

// Components
export { PageTransition } from './PageTransition';
export { MotionProvider } from './MotionProvider';
