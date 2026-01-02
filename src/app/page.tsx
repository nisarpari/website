'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useAdmin, useTheme } from '@/context';
import { EditableImage } from '@/components/admin';
import { OdooAPI, type Product, type Category } from '@/lib/api/odoo';
import VideoHeroSection from '@/components/VideoHeroSection';
import CustomerReviews from '@/components/CustomerReviews';
import ProductCard from '@/components/ProductCard';
import TrustMarquee from '@/components/TrustMarquee';
import { ProductCarouselSkeleton, MobileProductCarouselSkeleton } from '@/components/ProductCardSkeleton';

// Default Hero Images for carousel
const DEFAULT_HERO_IMAGES: Array<{ url: string; alt: string; link?: string }> = [
  { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80', alt: 'Modern Freestanding Bathtub' },
  { url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80', alt: 'Luxury Jacuzzi Spa' },
  { url: 'https://images.unsplash.com/photo-1629774631753-88f827bf6447?w=1200&q=80', alt: 'Modern Rain Shower' },
];

// Mobile Hero Component
function MobileHero({ heroImages, onImageUpdate }: {
  heroImages: Array<{ url: string; alt: string; link?: string }>;
  onImageUpdate?: (index: number, newUrl: string, newLink?: string) => void;
}) {
  const { t } = useLocale();
  const { isAdmin, editMode } = useAdmin();
  const { isDark } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = heroImages.length > 0 ? heroImages : DEFAULT_HERO_IMAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className={`relative overflow-hidden ${isDark ? 'bg-navy' : 'bg-bella-50'}`}>
      <div className="px-4 pt-4">
        <div className="relative h-[38vh] min-h-[240px] max-h-[300px] rounded-2xl overflow-hidden shadow-lg">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              {isAdmin && editMode ? (
                <EditableImage
                  src={image.url}
                  alt={image.alt}
                  configKey={`heroImages.${index}`}
                  fill
                  initialLink={image.link}
                  className="object-cover object-center"
                  onUpdate={(newUrl, newLink) => onImageUpdate?.(index, newUrl, newLink)}
                />
              ) : image.link ? (
                <Link href={image.link} className="block w-full h-full relative cursor-pointer">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority={index === 0}
                  />
                  {/* Mobile Touch Indicator */}
                  <div className="absolute inset-0 bg-black/0 active:bg-black/10 transition-colors" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority={index === 0}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pt-2 pb-6">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3 w-fit ${isDark ? 'bg-white/10 text-white' : 'bg-navy/10 text-navy'}`}>
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
          Premium Bathroom Solutions
        </span>
        <h1 className={`font-display text-3xl font-bold leading-tight mb-2 ${isDark ? 'text-white' : 'text-navy'}`}>
          {t('heroTitle1')}<br />
          <span className="text-gold">{t('heroTitle2')}</span>
        </h1>
        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-white/70' : 'text-bella-600'}`}>
          {t('heroSubtitle')}
        </p>
        <div className="flex gap-2 justify-center">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1 rounded-full transition-all duration-500 ${index === currentImageIndex
                ? 'bg-gold w-6'
                : isDark ? 'bg-white/40 w-3 hover:bg-white/60' : 'bg-navy/30 w-3 hover:bg-navy/50'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Mobile Stats Bar
function MobileStatsBar() {
  const { t } = useLocale();
  const stats = [
    { value: 'Million+', label: 'Happy Customers' },
    { value: '5000+', label: t('products') },
    { value: '25+', label: 'Years' }
  ];

  return (
    <section className="bg-bella-50 dark:bg-navy-light py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-around">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold text-gold">{stat.value}</div>
              <div className="text-bella-600 dark:text-bella-300 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Mobile Product Card - Compact with image block + name below
function MobileProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group flex-shrink-0 w-[120px]">
      <div className="w-[120px] bg-white rounded-xl overflow-hidden shadow-sm border border-bella-100 dark:border-white/10">
        {/* Image block */}
        <div className="relative w-[120px] h-[100px] bg-bella-50">
          <Image
            src={product.thumbnail || product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="120px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* Product name below image - fixed height */}
        <div className="p-1.5 h-[40px]">
          <h3 className="text-[10px] font-medium text-navy dark:text-white line-clamp-2 leading-tight">{product.name}</h3>
        </div>
      </div>
    </Link>
  );
}

// Mobile Product Section
function MobileProductSection({ products, title, badge, isLoading = false }: { products: Product[]; title: string; badge: string; isLoading?: boolean; }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  // Filter products that have images and limit to 8
  const filteredProducts = products
    .filter(p => p.thumbnail || p.image)
    .slice(0, 8);

  // Show skeleton while loading, hide section only if loaded with no products
  if (!isLoading && filteredProducts.length === 0) return null;

  return (
    <section className="py-6 bg-bella-50 dark:bg-navy">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">{badge}</span>
          <h2 className="font-display text-xl font-bold text-navy dark:text-white">{title}</h2>
        </div>
        <Link href="/shop" className="text-gold text-sm font-medium flex items-center gap-1">
          {t('viewAll')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      {isLoading ? (
        <MobileProductCarouselSkeleton count={8} />
      ) : (
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
              <MobileProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Mobile CTA
function MobileCTA() {
  const { isDark } = useTheme();

  return (
    <section className={`py-12 ${isDark ? 'bg-navy' : 'bg-bella-100'}`}>
      <div className="px-6 text-center">
        <h2 className={`font-display text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-navy'}`}>
          Ready to Transform Your Bathroom?
        </h2>
        <p className={`text-sm mb-6 ${isDark ? 'text-white/70' : 'text-bella-600'}`}>Get expert advice from our team</p>
        <div className="flex flex-col gap-3">
          <Link href="/shop" className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-full transition-all">
            Browse Collection
          </Link>
          <Link href="/contact" className={`px-6 py-3 font-semibold rounded-full transition-all border ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/30' : 'bg-navy/10 hover:bg-navy/20 text-navy border-navy/30'}`}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

// Desktop Hero
function Hero({ heroImages, onImageUpdate }: {
  heroImages: Array<{ url: string; alt: string; link?: string }>;
  onImageUpdate?: (index: number, newUrl: string, newLink?: string) => void;
}) {
  const { t } = useLocale();
  const { isAdmin, editMode } = useAdmin();
  const { isDark } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = heroImages.length > 0 ? heroImages : DEFAULT_HERO_IMAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className={`relative overflow-hidden min-h-[700px] ${isDark ? 'hero-gradient' : 'bg-gradient-to-br from-bella-50 via-bella-100 to-bella-200'}`}>
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-20 left-10 w-72 h-72 border rounded-full ${isDark ? 'border-gold' : 'border-navy/30'}`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 border rounded-full ${isDark ? 'border-gold' : 'border-navy/30'}`} />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`text-left ${isDark ? 'text-white' : 'text-navy'}`}>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in ${isDark ? 'bg-gold/20 text-gold-light' : 'bg-navy/10 text-navy'}`}>
              Premium Bathroom Solutions
            </span>
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight mb-6">
              {t('heroTitle1')} <br />
              <span className="text-gold">{t('heroTitle2')}</span>
            </h1>
            <p className={`text-xl mb-8 max-w-lg leading-relaxed ${isDark ? 'text-bella-300' : 'text-bella-600'}`}>
              {t('heroSubtitle')}
            </p>
            <div className="flex gap-8 mt-12">
              {[
                { value: 'Million+', label: 'Happy Customers' },
                { value: '5000+', label: t('products') },
                { value: '1999', label: 'Since' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-gold">{stat.value}</div>
                  <div className={`text-sm ${isDark ? 'text-bella-400' : 'text-bella-600'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-3xl transform rotate-6" />
            <div className="relative w-full h-[500px] rounded-3xl shadow-2xl overflow-hidden">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                  {isAdmin && editMode ? (
                    <EditableImage
                      src={image.url}
                      alt={image.alt}
                      configKey={`heroImages.${index}`}
                      fill
                      initialLink={image.link}
                      className="object-cover"
                      onUpdate={(newUrl, newLink) => onImageUpdate?.(index, newUrl, newLink)}
                    />
                  ) : image.link ? (
                    <Link href={image.link} className="block w-full h-full relative cursor-pointer">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="50vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                      {/* Hover effect overlay - Premium Interaction */}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-500 flex items-center justify-center group-hover:backdrop-blur-[2px]">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/50">
                            <svg
                              className="w-6 h-6 text-white transform group-hover:rotate-0 -rotate-45 transition-transform duration-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                          <span className="mt-3 text-white text-xs font-medium tracking-[0.2em] uppercase drop-shadow-md">
                            Discover
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="50vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-gold w-6' : 'bg-white/50 hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}





// Dynamic Product Section - Single line carousel
function DynamicProductSection({ products, title, subtitle, badge, isLoading = false }: {
  products: Product[];
  title: string;
  subtitle: string;
  badge?: string;
  isLoading?: boolean;
}) {
  const { t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter products that have images and limit to 8
  const filteredProducts = products
    .filter(p => p.thumbnail || p.image)
    .slice(0, 8);

  // Show skeleton while loading, hide section only if loaded with no products
  if (!isLoading && filteredProducts.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {badge && (
                <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full uppercase tracking-wide">
                  {badge}
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-navy">{title}</h2>
            <p className="text-bella-600 mt-1 md:mt-2 text-sm md:text-base">{subtitle}</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {/* Carousel Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-bella-200 flex items-center justify-center hover:bg-bella-50 transition-colors"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-bella-200 flex items-center justify-center hover:bg-bella-50 transition-colors"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <Link href="/shop" className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium">
              {t('viewAll')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Single line carousel - Compact cards */}
        {isLoading ? (
          <ProductCarouselSkeleton count={8} />
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {filteredProducts.map(product => (
              <div key={product.id} className="flex-shrink-0 w-[150px] lg:w-[180px]" style={{ scrollSnapAlign: 'start' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 text-center md:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-medium">
            {t('viewAll')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const { t } = useLocale();
  const { isDark } = useTheme();

  return (
    <section className={`py-16 ${isDark ? 'bg-gradient-to-r from-navy to-navy-light' : 'bg-gradient-to-r from-bella-100 to-bella-50'}`}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className={`font-display text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-navy'}`}>{t('readyTransform')}</h2>
        <p className={`mb-8 max-w-2xl mx-auto ${isDark ? 'text-bella-300' : 'text-bella-600'}`}>{t('browseCollection')}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/shop" className="bg-gold hover:bg-gold-dark text-navy px-8 py-4 rounded-full font-semibold transition-all hover:shadow-xl">
            {t('browseProducts')}
          </Link>
          <Link href="/contact" className={`px-8 py-4 rounded-full font-semibold transition-all ${isDark ? 'bg-white text-navy hover:bg-bella-100' : 'bg-navy text-white hover:bg-navy-light'}`}>
            {t('findShowroom')}
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main Home Page with Video Section
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [heroImages, setHeroImages] = useState<Array<{ url: string; alt: string; link?: string }>>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, catImages, best, arrivals] = await Promise.all([
          OdooAPI.fetchPublicCategories(),
          OdooAPI.fetchCategoryImages(),
          OdooAPI.fetchBestsellers(8),
          OdooAPI.fetchNewArrivals(8)
        ]);

        setCategories(cats);
        setCategoryImages(catImages);
        setBestsellers(best);
        setNewArrivals(arrivals);

        const configHeroImages = await OdooAPI.fetchHeroImages();
        if (configHeroImages && configHeroImages.length > 0) {
          setHeroImages(configHeroImages);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHeroImageUpdate = (index: number, newUrl: string, newLink?: string) => {
    setHeroImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], url: newUrl, link: newLink };
      return updated;
    });
  };

  return (
    <>
      {/* Mobile Version */}
      <div className="lg:hidden">
        <style jsx global>{`
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>

        {/* VIDEO HERO SECTION - First block */}
        <VideoHeroSection categories={categories} categoryImages={categoryImages} isLoading={isLoading} />

        <MobileHero heroImages={heroImages} onImageUpdate={handleHeroImageUpdate} />
        <MobileStatsBar />
        <MobileProductSection products={bestsellers} title="Trending This Week" badge="Hot" isLoading={isLoading} />
        <CustomerReviews />
        <MobileProductSection products={newArrivals} title="New Arrivals" badge="New" isLoading={isLoading} />
        <MobileCTA />
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block">
        {/* VIDEO HERO SECTION - First block */}
        <VideoHeroSection categories={categories} categoryImages={categoryImages} isLoading={isLoading} />

        <Hero heroImages={heroImages} onImageUpdate={handleHeroImageUpdate} />
        <TrustMarquee />

        <DynamicProductSection
          products={bestsellers}
          title="Trending This Week"
          subtitle="Most popular products our customers are loving right now"
          badge="Hot"
          isLoading={isLoading}
        />
        <CustomerReviews />
        <DynamicProductSection
          products={newArrivals}
          title="New Arrivals"
          subtitle="Fresh additions to our premium bathroom collection"
          badge="New"
          isLoading={isLoading}
        />
        <CTASection />
      </div>
    </>
  );
}
