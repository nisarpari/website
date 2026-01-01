'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/lib/api/odoo';
import { useAdmin } from '@/context';
import { EditableImage } from '@/components/admin';

interface VideoHeroSectionProps {
  categories: Category[];
  categoryImages: Record<string, string>;
}

export default function VideoHeroSection({ categories, categoryImages }: VideoHeroSectionProps) {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { isAdmin, editMode } = useAdmin();

  // Get root categories for display
  const rootCategories = categories
    .filter(c => c.parentId === null)
    .slice(0, 6);

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
      {/* Full-width Video Section */}
      <div className="relative w-full">
        {/* Video with gradient overlay */}
        <motion.div
          className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <video
            src="/hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-transparent to-transparent" />

          {/* Animated corner accents */}
          <motion.div
            className="absolute top-4 left-4 w-16 h-16 md:w-24 md:h-24 border-l-2 border-t-2 border-gold/50"
            initial={{ opacity: 0, x: -20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24 border-r-2 border-t-2 border-gold/50"
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-16 h-16 md:w-24 md:h-24 border-l-2 border-b-2 border-gold/50"
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-4 right-4 w-16 h-16 md:w-24 md:h-24 border-r-2 border-b-2 border-gold/50"
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Floating particles/dots animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
          <motion.div className="text-center mb-6 md:mb-12" variants={itemVariants}>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">
              Shop by Category
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
              Explore our premium bathroom collections
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {rootCategories.map((cat, index) => {
              const hasChildren = cat.childIds && cat.childIds.length > 0;
              return (
                <motion.div key={cat.id} variants={itemVariants}>
                  <Link
                    href={hasChildren ? `/category/${cat.id}` : `/shop?category=${cat.id}`}
                    className="group relative rounded-xl overflow-hidden aspect-[4/3] block"
                  >
                    {isAdmin && editMode ? (
                      <EditableImage
                        src={getCategoryImage(cat, index)}
                        alt={cat.name}
                        configKey={`categoryImages.${cat.id}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Image
                        src={getCategoryImage(cat, index)}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                    {/* Hover border effect */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 transition-colors duration-300 rounded-xl" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                      <h3 className="text-white font-display text-base md:text-2xl font-bold mb-0.5 md:mb-1 group-hover:text-gold transition-colors duration-300">
                        {cat.name}
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
    </div>
  );
}
