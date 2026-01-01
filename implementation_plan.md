# Creative UI/UX Overhaul Plan

## Goal Description
Transform the website from a standard "bootstrap-like" layout to a premium, dynamic experience that feels bespoke. The goal is to remove the "Built by AI" aesthetic by introducing fluid animations, editorial typography, and eliminating redundant/generic components.

## User Review Required
> [!IMPORTANT]
> **Hero Section Consolidation**: Currently, the homepage renders **both** a Video Hero (premium) and a Static Image Carousel Hero (standard) sequentially. This creates a cluttered "double header" look. I propose **removing the Static Image Carousel Hero completely** and relying solely on the Video Hero (enhanced with slider capabilities if needed) for a cleaner, high-end first impression.

> [!NOTE]
> **Animation Strategy**: I will be using `framer-motion` (already installed) more extensively for scroll-linked animations (parallax, reveal-on-scroll).

## Proposed Changes

### 1. Homepage Structure & Hero Consolidation
**Component**: `src/app/page.tsx`
- **[MODIFY]** Remove the redundant `<Hero />` and `<MobileHero />` components.
- **[MODIFY]** Make `<VideoHeroSection />` the primary and only hero.
- **[MODIFY]** Update `<VideoHeroSection />` to support a "slideshow" of videos or a more robust content overlay if multiple messages are needed.

### 2. Premium Animations & Interactions
**Component**: `src/app/globals.css` & `src/components/*`
- **[NEW]** Add smooth scroll behavior (using `lenis` or native CSS improvements).
- **[MODIFY]** Enhance `ProductCard` with a "Quick View" hover state, magnetic button effect, and subtle scale animations.
- **[MODIFY]** Replace standard "Trust Badges" grid with a **Marquee** (infinite scroll) or a more organic layout.

### 3. Typography & "Editorial" Feel
**Component**: `src/app/globals.css`
- **[MODIFY]** Increase contrast and scale of headings (make them larger/lighter or bolder/tighter tracking).
- **[MODIFY]** Add a "Noise" texture overlay (optional CSS) to give the site a tactile feel, removing the flat digital look.

### 4. Navigation Refinement
**Component**: `src/components/layout/Navbar.tsx`
- **[MODIFY]** Add a "Glassmorphism" effect to the sticky navbar with a blur filter.
- **[MODIFY]** Animate the search bar expansion and dropdown menus with `framer-motion` for spring physics instead of linear transitions.

### 5. Detailed Component Updates

#### [MODIFY] [VideoHeroSection.tsx](file:///Users/nisarpari/Desktop/website/src/components/VideoHeroSection.tsx)
- Refine the text animations to use "Mask Reveal" (text rising from a hidden overflow) rather than simple opacity fade.
- Ensure the video loads efficiently and has a high-quality fallback image.

#### [MODIFY] [ProductCard.tsx](file:///Users/nisarpari/Desktop/website/src/app/page.tsx)
- (Note: `ProductCard` is defined inside `page.tsx` currently - suggest moving to `src/components/ProductCard.tsx` for better modularity).
- Add `framer-motion` hover effects.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no type errors are introduced.
- Use `browser` tool to verify the timeline of animations on the homepage.

### Manual Verification
1.  **Hero Check**: Verify only *one* Hero section appears and the video plays automatically.
2.  **Scroll Check**: Scroll down the page to ensure elements "reveal" smoothly (fade up/slide in) rather than being static.
3.  **Mobile Response**: Check key interactions (hamburger menu, search) on mobile viewport width.
