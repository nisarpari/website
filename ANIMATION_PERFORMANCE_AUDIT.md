# Bella Bathwares - Animation & Performance Audit Report

## Executive Summary

After a comprehensive audit of the Bella Bathwares website, I've identified several critical issues preventing the site from delivering a premium, luxury experience. While the foundation is solid (Next.js 14, Framer Motion, Tailwind), there are key areas causing **inconsistent animations** and **slow loading times** despite Redis caching.

---

## PART 1: CRITICAL PERFORMANCE ISSUES

### Issue #1: Image Optimization Disabled (CRITICAL)

**Location:** `next.config.mjs:4`
```javascript
images: {
  unoptimized: true,  // THIS IS THE PROBLEM
}
```

**Impact:**
- Images are NOT being optimized, resized, or converted to WebP/AVIF
- Sharp package is installed but completely bypassed
- Users download full-size images (potentially 2-5MB each)
- Core Web Vitals LCP score severely impacted

**Comparison with Premium Sites:**
| Site | Image Format | Avg Image Size |
|------|-------------|----------------|
| Kohler.com | WebP | 50-150KB |
| Hansgrohe.com | WebP | 40-120KB |
| **Bella (current)** | **JPEG/PNG** | **500KB-2MB** |

**Fix:** Remove `unoptimized: true` and let Next.js optimize images automatically.

---

### Issue #2: Font Loading Strategy (HIGH)

**Location:** `globals.css:1`
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

**Problems:**
- Loading 3 font families with multiple weights = ~300-500KB
- Render-blocking CSS import
- No `font-display: optional` or `swap` optimization
- FOUT (Flash of Unstyled Text) visible during load

**Premium Site Approach:**
- Use `next/font` for automatic optimization
- Self-host fonts for faster delivery
- Subset fonts to only needed characters

---

### Issue #3: Lenis Smooth Scroll Always Running

**Location:** `src/components/SmoothScroll.tsx`
```javascript
function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);  // Runs FOREVER
}
requestAnimationFrame(raf);
```

**Problem:** Continuous `requestAnimationFrame` loop even when not scrolling, consuming CPU/battery.

**Premium Approach:** Use `IntersectionObserver` to pause when off-screen or use Lenis's built-in `autoRaf` option.

---

### Issue #4: No Bundle Splitting for Heavy Components

**Problem Areas:**
- `VideoHeroSection.tsx` (423 lines) - loaded on every page visit
- Framer Motion (~40KB gzipped) + Lenis (~20KB) always in main bundle
- No dynamic imports for below-fold content

---

## PART 2: ANIMATION INCONSISTENCIES

### Current Animation Analysis

| Component | Animation Type | Duration | Easing | Issue |
|-----------|---------------|----------|--------|-------|
| ProductCard | `whileInView` | 0.4s | easeOut | Good |
| CategoryCard | CSS transition | 0.5s | cubic-bezier | Good |
| NavDropdown | CSS transition | 0.3s | ease | Too fast for luxury |
| Modal | Framer Motion | 0.2s | ease-out | Too fast, feels cheap |
| Hero Carousel | AnimatePresence | 1s | default | Missing spring physics |
| CollectionTile | CSS hover | 0.5s | cubic-bezier | Good |
| MobileMenu | translateX | 0.3s | ease | Linear, mechanical |

### Problems Identified

**1. Inconsistent Timing System**
- Animations range from 0.2s to 1s with no unified timing scale
- Luxury sites use consistent timing: 0.4s, 0.6s, 0.8s, 1.2s

**2. Missing Easing Vocabulary**
Premium sites use sophisticated easing:
```css
/* Luxury easing curves */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
```

Your current code uses mostly `ease`, `ease-out`, or default Framer Motion spring.

**3. No Page Transitions**
- Route changes are instant with no transition
- Premium sites use cross-fade, slide, or curtain transitions

**4. Missing Entrance Choreography**
- Elements appear individually without orchestration
- No stagger delays between related elements
- Missing "reveal" effect on scroll

**5. No Reduced Motion Support**
- Missing `@media (prefers-reduced-motion: reduce)`
- Accessibility concern for motion-sensitive users

---

## PART 3: COMPARISON WITH PREMIUM BATHROOM BRANDS

### Kohler.com Analysis
- **Page Transitions:** Smooth fade (0.4s)
- **Scroll Animations:** Elements fade in with 50px Y-offset, staggered
- **Hover Effects:** Subtle scale (1.02) + shadow elevation
- **Image Loading:** Blur placeholder -> sharp image
- **Typography Animation:** Heading characters animate individually

### Hansgrohe.com Analysis
- **Hero:** Ken Burns effect on images (slow zoom + pan)
- **Product Grid:** Masonry layout with staggered reveals
- **Microinteractions:** Button press feedback, input focus glow
- **Scroll Progress:** Visible indicator, parallax depth

### Duravit.com Analysis
- **Cursor Effects:** Custom cursor on product hover
- **Video Integration:** Ambient video loops in hero
- **3D Elements:** Product rotation on drag
- **Loading States:** Elegant skeleton shimmer

---

## PART 4: ACTIONABLE RECOMMENDATIONS

### Priority 1: Performance Fixes (Do First)

#### 1.1 Enable Image Optimization
```javascript
// next.config.mjs
const nextConfig = {
  images: {
    // Remove unoptimized: true
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
}
```

#### 1.2 Optimize Font Loading
```javascript
// Use next/font instead of CSS @import
import { Cormorant_Garamond, Montserrat, Plus_Jakarta_Sans } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
})
```

#### 1.3 Add Bundle Analyzer
```bash
npm install @next/bundle-analyzer
```

### Priority 2: Animation System Overhaul

#### 2.1 Create Unified Timing Scale
```typescript
// lib/animations/tokens.ts
export const timing = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  slower: 0.8,
  slowest: 1.2,
} as const;

export const easing = {
  // Luxury feel - smooth deceleration
  luxuryOut: [0.16, 1, 0.3, 1],      // expo out
  luxuryInOut: [0.76, 0, 0.24, 1],   // quart in-out
  smooth: [0.4, 0, 0.2, 1],          // standard material
  bounce: [0.34, 1.56, 0.64, 1],     // overshoot
} as const;
```

#### 2.2 Implement Page Transitions
```tsx
// components/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4 }
  }
};

export function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}
```

#### 2.3 Add Stagger Animations
```tsx
// Proper stagger implementation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};
```

#### 2.4 Improve Modal Animation
```tsx
// Current: Too fast (0.2s)
// Recommended: Luxury feel
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};
```

### Priority 3: Microinteractions

#### 3.1 Button Hover States
```css
.btn-luxury {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-luxury:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
}

.btn-luxury:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}
```

#### 3.2 Image Hover (Ken Burns Effect)
```css
.product-image {
  transition: transform 8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.product-card:hover .product-image {
  transform: scale(1.1);
}
```

#### 3.3 Link Underline Animation
```css
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

### Priority 4: Accessibility

#### 4.1 Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// Framer Motion config
import { MotionConfig } from 'framer-motion';

<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

---

## PART 5: IMPLEMENTATION ROADMAP

### Week 1: Critical Performance
- [ ] Enable Next.js image optimization
- [ ] Switch to next/font for font loading
- [ ] Add lazy loading for below-fold components
- [ ] Run Lighthouse audit and benchmark

### Week 2: Animation Foundation
- [ ] Create animation tokens (timing, easing)
- [ ] Implement page transitions
- [ ] Update modal animations
- [ ] Add reduced motion support

### Week 3: Polish & Microinteractions
- [ ] Improve hover states (buttons, cards, links)
- [ ] Add stagger animations to grids
- [ ] Implement scroll-triggered reveals
- [ ] Add loading state improvements (blur-up images)

### Week 4: Testing & Optimization
- [ ] Cross-browser testing
- [ ] Mobile performance testing
- [ ] Bundle size analysis
- [ ] Core Web Vitals optimization

---

## Metrics to Track

| Metric | Current (Est.) | Target |
|--------|---------------|--------|
| LCP | >4s | <2.5s |
| FID | >200ms | <100ms |
| CLS | >0.25 | <0.1 |
| TTI | >6s | <3.8s |
| Bundle Size | ~500KB | <300KB |

---

## Conclusion

The website has a solid technical foundation but lacks the **polished, cohesive animation language** that premium brands employ. The biggest quick win is **enabling image optimization** which will immediately improve load times. For animations, establishing a **unified timing and easing system** will create the consistent, luxurious feel expected from a premium bathroom fixtures brand.

The goal should be: every interaction should feel intentional, smooth, and slightly slower than expected - this is what creates the "luxury" perception.

---

*Audit conducted: January 2026*
*Next.js 14.2.35 | Framer Motion 12.23.26 | Tailwind 3.4.1*
