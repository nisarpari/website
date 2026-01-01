# Bella Bathwares - UI/UX & Performance Improvement Plan

## 1. Executive Summary
This plan outlines the next phase of development for the Bella Bathwares website. Following the successful migration to Next.js/Vercel and the establishment of the Odoo integration, the focus now shifts to **refining the user interface**, **maximizing performance**, and **enhancing the user experience**.

**Current State:**
- **Stack:** Next.js 14 (App Router), React 18, Tailwind CSS 3.
- **Backend:** Odoo (via proxy).
- **Deployment:** Vercel.
- **Key Issue:** The user experience feels disjointed in places (e.g., recent layout experiments were not well-received). The alignment between desktop and mobile needs polish.

**Goal:** Create a "Premium, Production-Ready" application that feels fast, cohesive, and luxurious without sacrificing usability.

### Already Implemented ✅
- Glassmorphism sticky navbar with scroll behavior
- Mobile menu with body scroll lock
- Framer-motion animations throughout
- Hero media carousel (video + 5 HD images, 8s intervals)
- Video/image caching headers in `next.config.mjs`
- Social media links (Instagram, YouTube, X, WhatsApp)
- **Phase 1, Step 1: Odoo API Caching** - All API calls now use `revalidate: 3600` (1 hour ISR)
- **Phase 1, Step 3: Mobile Layout Polish** - Product cards now use `aspect-[4/5]` for elegant vertical look, added `overflow-x-hidden` to body to prevent horizontal scroll
- **Phase 1, Step 4: Image Fallback** - `ProductImage` component now handles broken Odoo URLs gracefully with `onError` fallback to `/placeholder-product.jpg`
- **Phase 1, Step 2: Unified Design System** - Added reusable `<Heading>` and `<Container>` components to `src/components/ui/`, existing `<Button>` already well-structured
- **Skeleton Loaders** - Added `ProductCardSkeleton` and `ProductGridSkeleton` components, integrated into shop page loading state
- **Video Optimization** - Added `poster` attribute to hero video for instant visual while video loads

---

## 2. UI/UX Strategy: "Clean Luxury"

We will move away from aggressive overlaps and complex experimental layouts. Instead, we will adopt a **"Clean Luxury"** aesthetic: minimal, spacious, and image-forward.

### **A. Core Layout Improvements**
1.  **Hero Section Refinement:**
    - **Desktop:** Keep the full-width impact but ensure text legibility. Use a subtle gradient overlay (already implemented but can be tuned) and crisp typography.
    - **Mobile:** Stick to the proven Carousel/Slider approach. Ensure touch targets are large (44px+) and navigation dots/arrows are easily tappable.
2.  **Navigation & Header:**
    - **Sticky Header:** Ensure the navbar stays visible but unobtrusive on scroll (glassmorphism effect).
    - **Mega Menu (Desktop):** Organize categories cleanly.
    - **Mobile Drawer:** A smooth-sliding drawer for menu items, avoiding the default browser scroll.
3.  **Product Cards:**
    - Standardize aspect ratios (e.g., `aspect-[3/4]` for vertical elegance).
    - **Hover Effects:** Subtle zoom on image, "Quick View" button appearing on hover (Desktop).
    - **Loading States:** distinct Skeleton loaders instead of blank spaces while Odoo data fetches.

### **B. Interaction Design**
-   **Micro-animations:** simple fade-ins for elements entering the viewport (using `framer-motion`).
-   **Feedback:** Instant visual feedback on buttons (Add to Cart, Wishlist).
-   **Transitions:** Smooth page transitions between routes.

---

## 3. Technical Performance (Vercel & Odoo)

Since the products come from Odoo, latency can be a bottleneck. We will optimize this aggressively.

### **A. Data Fetching & Caching (Critical)**
The current `fetch` calls to Odoo likely run on every request or have default caching. We need explicit control:
1.  **ISR (Incremental Static Regeneration):**
    -   Set `revalidate: 3600` (1 hour) for Product Categories and Homepage data. This means Vercel serves a *static* HTML file instantly and only checks Odoo in the background once an hour.
    -   Result: **Instant page loads** (~50ms) instead of waiting for Odoo (~1-2s).
2.  **Stale-While-Revalidate:**
    -   For individual product pages, allow serving slightly stale data while fetching fresh stock status in the background.

### **B. Image Optimization**
1.  **`next/image` usage:**
    -   Ensure `sizes` prop is accurate (e.g., `(max-width: 768px) 100vw, 33vw`) so mobile doesn't download 4K desktop images.
    -   Use `blurDataURL` or a blur placeholder for Odoo images to prevent layout shift.
2.  **Format:** Serve AVIF/WebP automatically (Vercel does this by default if using `next/image`).

### **C. Code Splitting**
-   Lazy load heavy components (like `VideoHeroSection` or Map integrations) using `next/dynamic`.

---

## 4. Phase 1: Immediate Action Items (The "Stabilize & Polish" Sprint)

### **Step 1: Odoo API Caching Layer**
-   Modify `src/lib/api/odoo.ts` to include Next.js caching tags.
    ```typescript
    fetch(url, { next: { revalidate: 3600, tags: ['products'] } })
    ```
-   This alone will arguably be the biggest UX improvement (speed).

### **Step 2: Unified Design System**
-   Audit `tailwind.config.ts` to ensure colors (`gold`, `navy`, `bella`) are consistent.
-   Create reusable atoms: `<Button>`, `<Heading>`, `<Container>`.
-   Replace ad-hoc classes (e.g., `px-4 py-2 bg-gold`) with these components to ensure consistency.

### **Step 3: Mobile Layout Polish**
-   Fix the "Aspect Ratio" issue permanently by enforcing `aspect-[3/4]` or `aspect-[4/5]` on all product cards mobile-wide.
-   Ensure no horizontal scrolling on the page body (common bug).

### **Step 4: Image Handling**
-   Implement a robust "Image Fallback" component. If Odoo returns a broken URL, show a sleek "Bella" placeholder instead of a broken image icon.

---

## 5. Future Phases

-   **Search Experience:** Implement a debounced search with instant dropdown results.
-   **Cart Drawer:** A slide-out cart instead of redirecting to a dedicated cart page.
-   **Checkout Optimization:** Simplify the checkout flow.

---

## 6. Additional Recommendations (Claude Code Review)

### **A. Performance Metrics & Monitoring**
The plan discusses performance conceptually but lacks concrete measurement:
1.  **Core Web Vitals Baseline:**
    -   Measure LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and FID/INP before and after changes.
    -   Use Vercel Analytics or Google PageSpeed Insights to track.
    -   Target: LCP < 2.5s, CLS < 0.1, INP < 200ms.
2.  **Real User Monitoring (RUM):**
    -   Consider adding Vercel Speed Insights for production monitoring.

### **B. Video Optimization (Not Covered)**
The hero section uses video which can significantly impact performance:
1.  **Compression:**
    -   Ensure `hero-video.mp4` is compressed (target: < 5MB for a 10-15s clip).
    -   Use H.264 codec for maximum browser compatibility.
2.  **Poster Frame:**
    -   Add `poster="/hero-poster.jpg"` to show a still image while video loads.
3.  **Lazy Loading:**
    -   Consider loading video only after initial page render or when in viewport.
4.  **Already Done:** Hero now alternates between video and 5 HD images every 8 seconds, reducing continuous video bandwidth.

### **C. Skeleton Loaders Implementation**
Mentioned in the plan but needs specifics:
```tsx
// Reusable ProductCardSkeleton component
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-bella-100 rounded-lg" />
      <div className="mt-3 h-4 bg-bella-100 rounded w-3/4" />
      <div className="mt-2 h-4 bg-bella-100 rounded w-1/2" />
    </div>
  );
}
```
-   Apply consistently across product grids, category pages, and search results.

### **D. Image Fallback Component**
Create a robust wrapper for Odoo images:
```tsx
// components/OdooImage.tsx
function OdooImage({ src, alt, ...props }) {
  const [error, setError] = useState(false);
  return (
    <Image
      src={error ? '/placeholder-product.jpg' : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
```

### **E. Priority Order for Implementation**
1.  **Step 1: Odoo API Caching** - Highest ROI, immediate speed improvement
2.  **Step 4: Image Fallbacks** - Prevents broken UI from Odoo image issues
3.  **Step 3: Mobile Polish** - User-facing quality improvement
4.  **Skeleton Loaders** - Perceived performance improvement
5.  **Step 2: Design System** - Long-term maintainability

---

**Approval Needed:**
Does this plan align with your vision? I recommend starting with **Phase 1, Step 1 (Caching)** and **Step 3 (Mobile Polish)** immediately.
