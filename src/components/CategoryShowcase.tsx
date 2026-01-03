'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useLocale, useAdmin } from '@/context';
import { OdooAPI, type Product } from '@/lib/api/odoo';
import { ProductImage } from '@/components/ProductImage';
import { EditableImage } from '@/components/admin';

// Feature item type
export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Stat item type
export interface Stat {
  value: string;
  label: string;
}

// Props for the CategoryShowcase component
export interface CategoryShowcaseProps {
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt?: string;

  // Features section
  features: Feature[];

  // Stats section (optional)
  stats?: Stat[];

  // Benefits section
  benefitsTitle?: string;
  benefitsDescription?: string;
  benefits?: string[];

  // Products section
  categoryId: number;
  productsTitle?: string;

  // CTA section
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;

  // Admin config key for editable images
  configKey?: string;

  // Breadcrumb parent (e.g., "Basin & WC" for toilet/basin categories)
  breadcrumbParent?: {
    name: string;
    href: string;
  };
}

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(value.replace(/\D/g, ''));
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current).toLocaleString());
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

// Product card with hover effects
function ProductCard({ product, index }: { product: Product; index: number }) {
  useLocale(); // Hook for locale context

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="group block bg-white dark:bg-navy-light rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent dark:border-white/10"
      >
        <div className="relative aspect-square bg-gradient-to-br from-bella-50 to-white overflow-hidden">
          <ProductImage
            src={product.thumbnail || product.image || '/placeholder.webp'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 md:p-5">
          <h3 className="font-product text-xs text-bella-500 dark:text-bella-300 uppercase tracking-wider line-clamp-2 overflow-hidden group-hover:text-gold transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

export function CategoryShowcase({
  heroTitle,
  heroSubtitle,
  heroDescription,
  heroImage,
  heroImageAlt = 'Product showcase',
  features,
  stats,
  benefitsTitle,
  benefitsDescription,
  benefits,
  categoryId,
  productsTitle = 'Explore Our Collection',
  ctaTitle,
  ctaDescription,
  ctaButtonText = 'View All Products',
  ctaButtonLink,
  configKey = 'categoryShowcase',
  breadcrumbParent
}: CategoryShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(heroImage);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isAdmin, editMode } = useAdmin();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Scroll to top when categoryId changes (navigating to a new category page)
  useEffect(() => {
    // Force scroll to top immediately when category changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Fallback for browsers that don't support 'instant'
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [categoryId]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const prods = await OdooAPI.fetchProductsByPublicCategory(categoryId, 8);
        setProducts(prods);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
      setLoading(false);
    };
    loadProducts();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-white dark:bg-navy">
      {/* Hero Section - Fullscreen with parallax */}
      <section ref={heroRef} className="relative h-[70vh] md:h-screen min-h-[500px] md:min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          {isAdmin && editMode ? (
            <EditableImage
              src={currentHeroImage}
              alt={heroImageAlt}
              configKey={`${configKey}.heroImage`}
              fill
              className="object-cover"
              onUpdate={(newUrl) => setCurrentHeroImage(newUrl)}
            />
          ) : (
            <Image
              src={currentHeroImage}
              alt={heroImageAlt}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="max-w-2xl">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center text-xs md:text-sm text-white/60 mb-4 md:mb-6"
              >
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
                <span className="mx-2">/</span>
                {breadcrumbParent && (
                  <>
                    <Link href={breadcrumbParent.href} className="hover:text-white transition-colors">{breadcrumbParent.name}</Link>
                    <span className="mx-2">/</span>
                  </>
                )}
                <span className="text-white">{heroTitle}</span>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm mb-2 md:mb-4"
              >
                {heroSubtitle}
              </motion.p>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
              >
                {heroTitle}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-white/80 text-sm md:text-xl leading-relaxed mb-6 md:mb-8"
              >
                {heroDescription}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4"
              >
                <Link
                  href={ctaButtonLink || `/shop?category=${categoryId}`}
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:scale-105 hover:shadow-lg"
                >
                  Explore Collection
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:bg-white/10"
                >
                  Learn More
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <section className="relative -mt-12 md:-mt-16 z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-navy-light rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-12 dark:border dark:border-white/10"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-xl md:text-4xl font-bold text-navy dark:text-white mb-1 md:mb-2">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <p className="text-bella-500 dark:text-bella-300 text-xs md:text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-12 md:py-28 bg-bella-50 dark:bg-navy-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <span className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm">Why Choose Us</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-navy dark:text-white mt-2 md:mt-3">
              Premium Features & Benefits
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white dark:bg-navy rounded-xl md:rounded-2xl p-4 md:p-8 shadow-sm hover:shadow-xl transition-shadow group dark:border dark:border-white/10"
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-gold [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-8 md:[&>svg]:h-8">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-navy dark:text-white text-sm md:text-lg mb-1 md:mb-3">{feature.title}</h3>
                <p className="text-bella-500 dark:text-bella-300 text-xs md:text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {benefits && benefits.length > 0 && (
        <section className="py-12 md:py-28 bg-white dark:bg-navy">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <span className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm">The Bella Difference</span>
                <h2 className="font-display text-2xl md:text-4xl font-bold text-navy dark:text-white mt-2 md:mt-3 mb-3 md:mb-6">
                  {benefitsTitle || 'Why Bella?'}
                </h2>
                <p className="text-bella-600 dark:text-bella-300 text-sm md:text-lg leading-relaxed mb-4 md:mb-8">
                  {benefitsDescription || 'Experience the perfect blend of innovation, quality, and style with our premium bathroom solutions.'}
                </p>
                <ul className="space-y-2 md:space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 md:gap-3"
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-bella-700 dark:text-bella-200 text-sm md:text-base">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative order-1 lg:order-2"
              >
                <div className="aspect-[4/3] md:aspect-square relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
                  {isAdmin && editMode ? (
                    <EditableImage
                      src={currentHeroImage}
                      alt="Benefits showcase"
                      configKey={`${configKey}.benefitsImage`}
                      fill
                      className="object-cover"
                      onUpdate={(newUrl) => setCurrentHeroImage(newUrl)}
                    />
                  ) : (
                    <Image
                      src={currentHeroImage}
                      alt="Benefits showcase"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-20 h-20 md:w-32 md:h-32 bg-gold/20 rounded-full blur-2xl md:blur-3xl" />
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-20 h-20 md:w-32 md:h-32 bg-navy/10 rounded-full blur-2xl md:blur-3xl" />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-12 md:py-28 bg-gradient-to-b from-bella-50 to-white dark:from-navy-light dark:to-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm">Our Products</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-navy dark:text-white mt-2 md:mt-3">
              {productsTitle}
            </h2>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loader"></div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link
                  href={`/shop?category=${categoryId}`}
                  className="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                >
                  View All Products
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-bella-500 dark:text-bella-300">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {ctaTitle && (
        <section className="py-12 md:py-28 bg-navy relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-gold/10 rounded-full blur-2xl md:blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-white/5 rounded-full blur-2xl md:blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                {ctaTitle}
              </h2>
              {ctaDescription && (
                <p className="text-white/70 text-sm md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto">
                  {ctaDescription}
                </p>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                <Link
                  href={ctaButtonLink || `/shop?category=${categoryId}`}
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:scale-105 shadow-lg shadow-gold/25"
                >
                  {ctaButtonText}
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
