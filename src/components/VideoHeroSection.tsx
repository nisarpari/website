'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/lib/api/odoo';
import { useAdmin } from '@/context';
import { EditableImage } from '@/components/admin';
import { CategoryGridSkeleton } from '@/components/ProductCardSkeleton';
import { getApiUrl } from '@/lib/api/config';

// Hero media items - video first, then images (already WebP optimized)
const heroMedia = [
  { type: 'video', src: '/hero-video.mp4' },
  { type: 'image', src: '/hero-images/Bella_HI_1.webp' },
  { type: 'image', src: '/hero-images/Bella_HI_2.webp' },
  { type: 'image', src: '/hero-images/Bella_HI_3.webp' },
  { type: 'image', src: '/hero-images/Bella_HI_4.webp' },
  { type: 'image', src: '/hero-images/Bella_HI_5.webp' },
];

// Category display configuration - maps database names to display names
const categoryDisplayNames: Record<string, string> = {
  'bathroom': 'Showers',
  'washroom': 'Basins & Faucets',
  'washlet': 'Toilets & Cisterns',
  'wellness': 'Wellness',
  'bath accessories': 'Bath Accessories',
  'switches & sockets': 'Switches & Sockets',
};

// Get display name for a category
const getDisplayName = (name: string): string => {
  return categoryDisplayNames[name.toLowerCase()] || name;
};

// Dedicated pages mapping - categories with custom landing pages
const dedicatedPages: Record<string, string> = {
  'concealed-cisterns': '/concealed-cisterns',
  'wall-hung-toilets': '/wall-hung-toilets',
  'single-piece-toilets': '/siphonicwc',
  'bathtubs': '/bathtubs',
  'jacuzzi': '/jacuzzis',
  'steam-sauna': '/sauna-steam',
};

// Get the correct URL for a category
const getCategoryUrl = (cat: Category, hasChildren: boolean): string => {
  if (dedicatedPages[cat.slug]) {
    return dedicatedPages[cat.slug];
  }
  return hasChildren ? `/category/${cat.id}` : `/shop?category=${cat.id}`;
};

interface VideoHeroSectionProps {
  categories: Category[];
  categoryImages: Record<string, string>;
  isLoading?: boolean;
}

// Default category order for homepage display
const defaultCategoryOrder = [
  'bathroom',      // Showers
  'washroom',      // Basins & Faucets
  'washlet',       // Toilets & Cisterns
  'wellness',      // Wellness
  'bath accessories', // Bath Accessories
  'switches & sockets', // Switches & Sockets
];

export default function VideoHeroSection({ categories, categoryImages, isLoading = false }: VideoHeroSectionProps) {
  const [isInView, setIsInView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [categoryGridCount, setCategoryGridCount] = useState<6 | 8>(6);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [expandedParents, setExpandedParents] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { isAdmin, editMode, token } = useAdmin();
  const API_BASE = getApiUrl();

  // Get image source directly (no transformation needed)
  const getImageSrc = (media: typeof heroMedia[number]) => {
    return media.src;
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMedia.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, []);

  // Fetch visible categories config from admin settings
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/hidden-categories`);
        if (res.ok) {
          const data = await res.json();
          if (data?.visibleCategories) {
            setVisibleCategories(data.visibleCategories);
          }
          if (data?.categoryGridCount) {
            setCategoryGridCount(data.categoryGridCount);
          }
        }
      } catch (error) {
        console.error('Failed to fetch category config:', error);
      }
    }
    fetchConfig();
  }, [API_BASE]);

  const currentMedia = heroMedia[currentIndex];

  // Get all categories that are explicitly marked as visible, sorted by order
  const getDisplayCategories = () => {
    const visible: Category[] = [];

    // Sort root categories by predefined order
    const sortedRoots = categories
      .filter(c => c.parentId === null)
      .sort((a, b) => {
        const aIndex = defaultCategoryOrder.indexOf(a.name.toLowerCase());
        const bIndex = defaultCategoryOrder.indexOf(b.name.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

    // Add only categories that are in the visibleCategories list
    for (const root of sortedRoots) {
      if (visibleCategories.includes(root.name.toLowerCase())) {
        visible.push(root);
      }
      // Check subcategories
      const children = categories.filter(c => c.parentId === root.id);
      for (const child of children) {
        if (visibleCategories.includes(child.name.toLowerCase())) {
          visible.push(child);
        }
      }
    }

    return visible.slice(0, categoryGridCount);
  };

  const displayCategories = getDisplayCategories();

  // Save settings to admin
  const saveSettings = async (visible: string[], gridCount?: 6 | 8) => {
    // Optimistic update - update UI immediately
    setVisibleCategories(visible);
    if (gridCount !== undefined) {
      setCategoryGridCount(gridCount);
    }

    // If no token, just keep local state (will reset on refresh)
    if (!token) {
      console.warn('No admin token - changes will not persist');
      return;
    }

    try {
      const body: { visibleCategories: string[]; categoryGridCount?: number } = { visibleCategories: visible };
      if (gridCount !== undefined) {
        body.categoryGridCount = gridCount;
      }
      const res = await fetch(`${API_BASE}/api/admin/hidden-categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        console.error('Failed to save settings:', await res.text());
      }
    } catch (error) {
      console.error('Failed to save category config:', error);
    }
  };

  // Toggle category visibility
  const toggleCategoryVisibility = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase();
    const newVisible = visibleCategories.includes(normalizedName)
      ? visibleCategories.filter(c => c !== normalizedName)
      : [...visibleCategories, normalizedName];
    saveSettings(newVisible);
  };

  // Toggle grid count
  const toggleGridCount = (count: 6 | 8) => {
    if (count !== categoryGridCount) {
      saveSettings(visibleCategories, count);
    }
  };

  // Get children of a category
  const getChildren = (parentId: number) => {
    return categories.filter(c => c.parentId === parentId);
  };

  // Get all categories for the editor organized by parent
  const allRootCategories = categories
    .filter(c => c.parentId === null)
    .sort((a, b) => {
      const aIndex = defaultCategoryOrder.indexOf(a.name.toLowerCase());
      const bIndex = defaultCategoryOrder.indexOf(b.name.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  // Toggle expanded state for a parent category
  const toggleExpanded = (catId: number) => {
    setExpandedParents(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Default fallback images
  const defaultImages = [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80',
    'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80'
  ];

  const getCategoryImage = (cat: Category, index: number): string => {
    if (categoryImages[cat.id.toString()]) return categoryImages[cat.id.toString()];
    if (categoryImages[cat.slug]) return categoryImages[cat.slug];
    return defaultImages[index % defaultImages.length];
  };

  // Check if section is in view for triggering animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  };

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-navy">
      {/* Full-width Hero Media Section */}
      <div className="relative w-full">
        {/* Media carousel with gradient overlay */}
        <motion.div
          className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {/* Media Items */}
          <AnimatePresence mode="wait">
            {currentMedia.type === 'video' ? (
              <motion.video
                key="video"
                src={currentMedia.src}
                poster={getImageSrc({ type: 'image', src: '/hero-images/Bella_HI_1.webp' })}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            ) : (
              <motion.div
                key={getImageSrc(currentMedia)}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <Image
                  src={getImageSrc(currentMedia)}
                  alt="Bella Bathwares"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={currentIndex === 0}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette blur effect - only outside the focus frame */}
          {/* Top edge blur */}
          <div
            className="absolute top-0 left-0 right-0 h-6 md:h-8 z-[1]"
            style={{
              background: 'linear-gradient(to bottom, rgba(10,25,47,0.7), transparent)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />
          {/* Bottom edge blur */}
          <div
            className="absolute bottom-0 left-0 right-0 h-6 md:h-8 z-[1]"
            style={{
              background: 'linear-gradient(to top, rgba(10,25,47,0.7), transparent)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />
          {/* Left edge blur */}
          <div
            className="absolute top-6 md:top-8 bottom-6 md:bottom-8 left-0 w-6 md:w-8 z-[1]"
            style={{
              background: 'linear-gradient(to right, rgba(10,25,47,0.7), transparent)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />
          {/* Right edge blur */}
          <div
            className="absolute top-6 md:top-8 bottom-6 md:bottom-8 right-0 w-6 md:w-8 z-[1]"
            style={{
              background: 'linear-gradient(to left, rgba(10,25,47,0.7), transparent)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          {/* Animated corner accents - focus frame */}
          <motion.div
            className="absolute top-6 left-6 md:top-8 md:left-8 w-12 h-12 md:w-20 md:h-20 border-l-2 border-t-2 border-gold/70 z-[2]"
            initial={{ opacity: 0, x: -20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 md:w-20 md:h-20 border-r-2 border-t-2 border-gold/70 z-[2]"
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-6 left-6 md:bottom-8 md:left-8 w-12 h-12 md:w-20 md:h-20 border-l-2 border-b-2 border-gold/70 z-[2]"
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-20 md:h-20 border-r-2 border-b-2 border-gold/70 z-[2]"
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Floating particles/dots animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 md:w-2 md:h-2 bg-gold/40 rounded-full"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

        </motion.div>
      </div>

      {/* Categories Section */}
      <motion.section
        className="w-full px-4 md:px-8 py-8 md:py-16 -mt-8 md:-mt-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-8 md:mb-14 mt-6 md:mt-10" variants={itemVariants}>
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-gold/60" />
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <h2 className="font-display text-xl md:text-3xl font-light text-white/90 tracking-wide">
              Explore our <span className="text-gold font-medium">premium</span> bathroom collections
            </h2>
            <p className="text-white/50 text-xs md:text-sm mt-2 max-w-md mx-auto">
              Curated selections for your perfect space
            </p>
            {/* Admin Edit Button */}
            {isAdmin && editMode && (
              <button
                onClick={() => setShowCategoryEditor(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Categories
              </button>
            )}
          </motion.div>

          {isLoading || displayCategories.length === 0 ? (
            <CategoryGridSkeleton count={categoryGridCount} />
          ) : (
            <div className={`grid grid-cols-2 ${categoryGridCount === 8 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 md:gap-6`}>
              {displayCategories.map((cat, index) => {
                const hasChildren = !!(cat.childIds && cat.childIds.length > 0);
                const displayName = getDisplayName(cat.name);
                return (
                  <motion.div key={cat.id} variants={itemVariants}>
                    <Link
                      href={getCategoryUrl(cat, hasChildren)}
                      className="group relative rounded-xl overflow-hidden aspect-[4/3] block"
                    >
                      {isAdmin && editMode ? (
                        <EditableImage
                          src={getCategoryImage(cat, index)}
                          alt={displayName}
                          configKey={`categoryImages.${cat.id}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <Image
                          src={getCategoryImage(cat, index)}
                          alt={displayName}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                      {/* Hover border effect */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 transition-colors duration-300 rounded-xl" />

                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                        <h3 className="text-white font-display text-base md:text-2xl font-bold mb-0.5 md:mb-1 group-hover:text-gold transition-colors duration-300">
                          {displayName}
                        </h3>
                        <span className="text-white/70 text-[10px] md:text-sm">
                          {cat.totalCount || 0}+ Products
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.div className="text-center mt-8 md:mt-12" variants={itemVariants}>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:shadow-lg hover:shadow-gold/20"
            >
              View All Products
              <motion.svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Category Editor Modal */}
      {showCategoryEditor && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-bella-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Manage Homepage Categories</h2>
                <button onClick={() => setShowCategoryEditor(false)} className="text-bella-400 hover:text-navy">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-bella-500 mt-2">Toggle categories to show or hide them. First {categoryGridCount} visible categories will be displayed.</p>

              {/* Grid Count Toggle */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-navy">Grid Layout:</span>
                <div className="flex rounded-lg overflow-hidden border border-bella-200">
                  <button
                    onClick={() => toggleGridCount(6)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      categoryGridCount === 6 ? 'bg-navy text-white' : 'bg-white text-bella-600 hover:bg-bella-50'
                    }`}
                  >
                    6 Categories (3x2)
                  </button>
                  <button
                    onClick={() => toggleGridCount(8)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      categoryGridCount === 8 ? 'bg-navy text-white' : 'bg-white text-bella-600 hover:bg-bella-50'
                    }`}
                  >
                    8 Categories (4x2)
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[55vh]">
              <div className="space-y-2">
                {allRootCategories.map((cat) => {
                  const isVisible = visibleCategories.includes(cat.name.toLowerCase());
                  const displayName = getDisplayName(cat.name);
                  const children = getChildren(cat.id);
                  const isExpanded = expandedParents.includes(cat.id);

                  return (
                    <div key={cat.id}>
                      {/* Parent Category */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isVisible ? 'bg-green-50 border-green-200' : 'bg-bella-50 border-bella-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {children.length > 0 && (
                            <button
                              onClick={() => toggleExpanded(cat.id)}
                              className="p-1 hover:bg-black/10 rounded transition-colors"
                            >
                              <svg
                                className={`w-4 h-4 text-bella-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                          <div>
                            <p className="font-medium text-navy">{displayName}</p>
                            <p className="text-xs text-bella-500">{cat.name} • {cat.totalCount || 0} products</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCategoryVisibility(cat.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            isVisible
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-bella-200 text-bella-600 hover:bg-bella-300'
                          }`}
                        >
                          {isVisible ? 'Visible' : 'Hidden'}
                        </button>
                      </div>

                      {/* Subcategories */}
                      {isExpanded && children.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {children.map((child) => {
                            const childVisible = visibleCategories.includes(child.name.toLowerCase());
                            return (
                              <div
                                key={child.id}
                                className={`flex items-center justify-between p-2 pl-4 rounded-lg border-l-2 transition-colors ${
                                  childVisible ? 'bg-green-50/50 border-green-400' : 'bg-bella-50/50 border-bella-300'
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-medium text-navy">{child.name}</p>
                                  <p className="text-xs text-bella-400">{child.totalCount || 0} products</p>
                                </div>
                                <button
                                  onClick={() => toggleCategoryVisibility(child.name)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                    childVisible
                                      ? 'bg-green-500 text-white hover:bg-green-600'
                                      : 'bg-bella-200 text-bella-600 hover:bg-bella-300'
                                  }`}
                                >
                                  {childVisible ? 'Visible' : 'Hidden'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-bella-100">
              <button
                onClick={() => setShowCategoryEditor(false)}
                className="w-full px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
