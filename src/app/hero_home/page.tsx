'use client';

import { useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import Link from 'next/link';
import Image from 'next/image';

// Bella Bathwares content for the hero
const heroContent = {
  // Using the compressed video
  mediaSrc: '/hero-video.mp4',
  background: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920&q=80',
  title: 'Bella Bathwares',
  date: 'Premium Bathroom Fixtures',
  scrollToExpand: 'Scroll to Explore',
};

// Featured categories
const categories = [
  {
    name: 'Faucets',
    image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600&q=80',
    href: '/shop?category=39',
  },
  {
    name: 'Basins',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
    href: '/shop',
  },
  {
    name: 'Bathtubs',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
    href: '/shop',
  },
  {
    name: 'Showers',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80',
    href: '/shop',
  },
];

// Features section
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Quality Assured',
    description: 'Premium materials and Italian craftsmanship in every product.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Fast Delivery',
    description: 'Secure packaging and reliable shipping across the region.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Easy Returns',
    description: '30-day hassle-free return policy for your peace of mind.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Expert Support',
    description: 'Dedicated customer assistance for all your queries.',
  },
];

function HeroContent() {
  return (
    <div className="bg-white dark:bg-navy">
      {/* Categories Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white text-center mb-4">
          Explore Our Collections
        </h2>
        <p className="text-bella-600 dark:text-bella-300 text-center mb-12 max-w-2xl mx-auto">
          Discover premium bathroom fixtures designed to transform your space into a sanctuary of luxury and comfort.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-square rounded-2xl overflow-hidden"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg md:text-xl">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Shop All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-bella-50 dark:bg-navy-dark">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white text-center mb-12">
            Why Choose Bella Bathwares?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 bg-white dark:bg-navy rounded-2xl shadow-sm"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-navy dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-bella-600 dark:text-bella-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-navy text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your Bathroom Today
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Browse our extensive collection of premium bathroom fixtures and accessories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-semibold transition-all"
            >
              Browse Collection
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all border border-white/30"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HeroHomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc={heroContent.mediaSrc}
        bgImageSrc={heroContent.background}
        title={heroContent.title}
        date={heroContent.date}
        scrollToExpand={heroContent.scrollToExpand}
        textBlend
      >
        <HeroContent />
      </ScrollExpandMedia>
    </div>
  );
}
