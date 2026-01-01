'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useCart, useWishlist, useVerification, useAdmin, useTheme } from '@/context';
import { EditableImage } from '@/components/admin';
import { OdooAPI, type Product, type Category } from '@/lib/api/odoo';
import { ProductImage } from '@/components/ProductImage';
import VideoHeroSection from '@/components/VideoHeroSection';
import CustomerReviews from '@/components/CustomerReviews';

// Default Hero Images for carousel
const DEFAULT_HERO_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80', alt: 'Modern Freestanding Bathtub' },
  { url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80', alt: 'Luxury Jacuzzi Spa' },
  { url: 'https://images.unsplash.com/photo-1629774631753-88f827bf6447?w=1200&q=80', alt: 'Modern Rain Shower' },
];

// Mobile Hero Component
function MobileHero({ heroImages, onImageUpdate }: {
  heroImages: Array<{ url: string; alt: string }>;
  onImageUpdate?: (index: number, newUrl: string) => void;
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
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isAdmin && editMode ? (
                <EditableImage
                  src={image.url}
                  alt={image.alt}
                  configKey={`heroImages.${index}`}
                  fill
                  className="object-cover object-center"
                  onUpdate={(newUrl) => onImageUpdate?.(index, newUrl)}
                />
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
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentImageIndex
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
function MobileProductSection({ products, title, badge }: { products: Product[]; title: string; badge: string; }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  // Filter products that have images and limit to 8
  const filteredProducts = products
    .filter(p => p.thumbnail || p.image)
    .slice(0, 8);

  if (filteredProducts.length === 0) return null;

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
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
            <MobileProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Mobile CTA
function MobileCTA() {
  return (
    <section className="py-12 bg-navy">
      <div className="px-6 text-center">
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Ready to Transform Your Bathroom?
        </h2>
        <p className="text-white/70 text-sm mb-6">Get expert advice from our team</p>
        <div className="flex flex-col gap-3">
          <Link href="/shop" className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-full transition-all">
            Browse Collection
          </Link>
          <Link href="/contact" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all border border-white/30">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

// Desktop Hero
function Hero({ heroImages, onImageUpdate }: {
  heroImages: Array<{ url: string; alt: string }>;
  onImageUpdate?: (index: number, newUrl: string) => void;
}) {
  const { t } = useLocale();
  const { isAdmin, editMode } = useAdmin();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = heroImages.length > 0 ? heroImages : DEFAULT_HERO_IMAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="hero-gradient relative overflow-hidden min-h-[700px]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 border border-gold rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border border-gold rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white text-left">
            <span className="inline-block px-4 py-2 bg-gold/20 rounded-full text-gold-light text-sm font-medium mb-6 animate-fade-in">
              Premium Bathroom Solutions
            </span>
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight mb-6">
              {t('heroTitle1')} <br />
              <span className="text-gold">{t('heroTitle2')}</span>
            </h1>
            <p className="text-xl text-bella-300 mb-8 max-w-lg leading-relaxed">
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
                  <div className="text-bella-400 text-sm">{stat.label}</div>
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
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {isAdmin && editMode ? (
                    <EditableImage
                      src={image.url}
                      alt={image.alt}
                      configKey={`heroImages.${index}`}
                      fill
                      className="object-cover"
                      onUpdate={(newUrl) => onImageUpdate?.(index, newUrl)}
                    />
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
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-gold w-6' : 'bg-white/50 hover:bg-white/80'
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

// Trust Badges
function TrustBadges() {
  const { t } = useLocale();
  const badges = [
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: t('genuineProducts') },
    { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: t('fastDelivery') },
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: t('warranty') },
    { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', label: t('expertSupport') }
  ];

  return (
    <section className="bg-white py-8 border-b border-bella-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={badge.icon} />
                </svg>
              </div>
              <span className="text-sm font-medium text-navy">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Product Card - Compact version with image block + name below
function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <Link href={`/product/${product.slug}`} className="product-card group block">
      <div className="bg-white dark:bg-navy-light rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-bella-100 dark:border-white/10">
        {/* Image block */}
        <div className="relative aspect-square bg-bella-50 dark:bg-navy">
          <ProductImage
            src={product.thumbnail || product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 160px, 180px"
          />
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${inWishlist ? 'bg-red-50 hover:bg-red-100' : 'bg-white/90 dark:bg-bella-700 hover:bg-white dark:hover:bg-bella-600'}`}
          >
            <svg className={`w-3.5 h-3.5 ${inWishlist ? 'text-red-500' : 'text-bella-600 dark:text-bella-300'}`} fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        {/* Product name below image - fixed height */}
        <div className="p-2 h-[52px]">
          <h3 className="text-xs font-medium text-navy dark:text-white line-clamp-2 leading-snug">{product.name}</h3>
        </div>
      </div>
    </Link>
  );
}

// Dynamic Product Section - Single line carousel
function DynamicProductSection({ products, title, subtitle, badge }: {
  products: Product[];
  title: string;
  subtitle: string;
  badge?: string;
}) {
  const { t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter products that have images and limit to 8
  const filteredProducts = products
    .filter(p => p.thumbnail || p.image)
    .slice(0, 8);

  if (filteredProducts.length === 0) return null;

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

  return (
    <section className="py-16 bg-gradient-to-r from-navy to-navy-light">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">{t('readyTransform')}</h2>
        <p className="text-bella-300 mb-8 max-w-2xl mx-auto">{t('browseCollection')}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/shop" className="bg-gold hover:bg-gold-dark text-navy px-8 py-4 rounded-full font-semibold transition-all hover:shadow-xl">
            {t('browseProducts')}
          </Link>
          <Link href="/contact" className="bg-white text-navy px-8 py-4 rounded-full font-semibold transition-all hover:bg-bella-100">
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
  const [heroImages, setHeroImages] = useState<Array<{ url: string; alt: string }>>(DEFAULT_HERO_IMAGES);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = async () => {
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
      }
    };
    loadData();
  }, []);

  const handleHeroImageUpdate = (index: number, newUrl: string) => {
    setHeroImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], url: newUrl };
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
        <VideoHeroSection categories={categories} categoryImages={categoryImages} />

        <MobileHero heroImages={heroImages} onImageUpdate={handleHeroImageUpdate} />
        <MobileStatsBar />
        <MobileProductSection products={bestsellers} title="Trending This Week" badge="Hot" />
        <MobileProductSection products={newArrivals} title="New Arrivals" badge="New" />
        <CustomerReviews />
        <MobileCTA />
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block">
        {/* VIDEO HERO SECTION - First block */}
        <VideoHeroSection categories={categories} categoryImages={categoryImages} />

        <Hero heroImages={heroImages} onImageUpdate={handleHeroImageUpdate} />
        <TrustBadges />

        <DynamicProductSection
          products={bestsellers}
          title="Trending This Week"
          subtitle="Most popular products our customers are loving right now"
          badge="Hot"
        />
        <DynamicProductSection
          products={newArrivals}
          title="New Arrivals"
          subtitle="Fresh additions to our premium bathroom collection"
          badge="New"
        />
        <CustomerReviews />
        <CTASection />
      </div>
    </>
  );
}
