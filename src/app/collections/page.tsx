'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ensureOptimizedImage } from '@/lib/imageUtils';

// Collection data matching bellabathwares.com/collections
// Using /category/[id] URL pattern for your website
// Product images sourced from erp.bellastore.in
const collections = [
  {
    id: 'qv',
    name: 'QV',
    subtitle: 'Series',
    tagline: 'Precision Engineering and Bold Geometry for a Distinctive Look.',
    image: 'https://erp.bellastore.in/web/image/163355-c927fb6a/BM%20366501%20BN.webp',
    categoryId: '257',
    bgColor: 'bg-[#104A5A]',
  },
  {
    id: 'ga',
    name: 'GA',
    subtitle: 'Series',
    tagline: 'Gentle Arcs and Elegant Flow for a Perennial Design.',
    image: 'https://erp.bellastore.in/web/image/163356-246717a8/BM%2013111%20CH%20Basin%20Mixer.webp',
    categoryId: '255',
    bgColor: 'bg-white',
    textDark: true,
  },
  {
    id: 'lp',
    name: 'LP',
    subtitle: 'Series',
    tagline: 'Bold Angles and Defined Edges for a Striking Design.',
    image: 'https://erp.bellastore.in/web/image/163334-864f6e82/B064%2001%2043%201.webp',
    categoryId: '205',
    bgColor: 'bg-[#2C3E50]',
  },
  {
    id: 'ec',
    name: 'EC',
    subtitle: 'Series',
    tagline: 'Refined Design and Polished Finish for a Classic Appeal.',
    image: 'https://erp.bellastore.in/web/image/163335-1138688e/BM%20738711%20Basin%20Mixer%20.webp',
    categoryId: '256',
    bgColor: 'bg-[#F5F5F5]',
    textDark: true,
  },
  {
    id: 'zs',
    name: 'ZS',
    subtitle: 'Series',
    tagline: 'Crisp Angles and a Harmonious Shape for an Everlasting Style.',
    image: 'https://erp.bellastore.in/web/image/163337-f6e133bc/BM%2011150%20BG%20Basin%20Mixer%20GOLD.webp',
    categoryId: '254',
    bgColor: 'bg-[#1A1A2E]',
  },
  {
    id: 'sl',
    name: 'SL',
    subtitle: 'Series',
    tagline: 'Smooth Profiles and Contemporary Design for a Polished Look.',
    image: 'https://erp.bellastore.in/web/image/163336-dac79a51/BM%2056110%20DB%20Basin%20Mixer%20BLACK.webp',
    categoryId: '269',
    bgColor: 'bg-white',
    textDark: true,
  },
  {
    id: 'nx',
    name: 'NX',
    subtitle: 'Series',
    tagline: 'Classic Profiles and Enduring Design for a Distinguished Look.',
    image: 'https://erp.bellastore.in/web/image/205249-c6a0cc8a/BM%20732711%20ORB.png',
    categoryId: '271',
    bgColor: 'bg-[#104A5A]',
  },
  {
    id: 'yn',
    name: 'YN',
    subtitle: 'Series',
    tagline: 'Clean Lines and Modern Aesthetics for an Enduring Style.',
    image: 'https://erp.bellastore.in/web/image/205244-24d38575/BM%20738711%20Basin%20Mixer%20.png',
    categoryId: '270',
    bgColor: 'bg-[#F8F8F8]',
    textDark: true,
  },
];

// Series Logo Bar Component - with product images like bellabathwares.com
function SeriesLogoBar() {
  return (
    <section className="py-6 md:py-10 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
          {collections.slice(0, 6).map((collection) => (
            <Link
              key={collection.id}
              href={`/category/${collection.categoryId}`}
              className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {/* Product Image */}
              <div className="relative w-12 h-16 md:w-14 md:h-20 flex-shrink-0">
                <Image
                  src={ensureOptimizedImage(collection.image, { width: 112 })}
                  alt={`${collection.name} Series`}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              {/* Series Name */}
              <div className="text-left">
                <span className="block text-xl md:text-2xl font-bold text-navy group-hover:text-gold transition-colors">
                  {collection.name}
                </span>
                <span className="block text-xs md:text-sm text-gray-500">Series</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Collection Section Component - Full width alternating layout
function CollectionSection({
  collection,
  index
}: {
  collection: typeof collections[0];
  index: number;
}) {
  const isReversed = index % 2 === 1;
  const textColor = collection.textDark ? 'text-navy' : 'text-white';
  const subtitleColor = collection.textDark ? 'text-gray-600' : 'text-white/80';

  return (
    <section className={`relative ${collection.bgColor} overflow-hidden`}>
      {/* Decorative wave shape */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z"
            fill="currentColor"
            className={collection.textDark ? 'text-gray-300' : 'text-white'}
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[500px] md:min-h-[600px] py-12 md:py-20 ${isReversed ? 'md:flex-row-reverse' : ''}`}>

          {/* Image Side */}
          <motion.div
            className={`relative ${isReversed ? 'md:order-2' : 'md:order-1'}`}
            initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-square md:aspect-[4/5] max-w-md mx-auto">
              <Image
                src={ensureOptimizedImage(collection.image, { width: 800 })}
                alt={`${collection.name} ${collection.subtitle}`}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className={`${isReversed ? 'md:order-1 md:text-right' : 'md:order-2 md:text-left'} text-center md:text-left`}
            initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Series Name */}
            <h2 className={`font-display ${textColor} mb-4`}>
              <span className="text-6xl md:text-8xl font-bold block">
                {collection.name}
              </span>
              <span className="text-2xl md:text-4xl font-normal">
                {collection.subtitle}
              </span>
            </h2>

            {/* Tagline */}
            <p className={`text-lg md:text-xl ${subtitleColor} mb-8 max-w-md ${isReversed ? 'md:ml-auto' : ''}`}>
              {collection.tagline}
            </p>

            {/* CTA Button */}
            <Link
              href={`/category/${collection.categoryId}`}
              className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-semibold transition-all duration-300 ${
                collection.textDark
                  ? 'border-navy text-navy hover:bg-navy hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-navy'
              }`}
            >
              Check Out
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Mobile Collection Card - Carousel style like bellabathwares
function MobileCollectionCard({ collection }: { collection: typeof collections[0] }) {
  const textColor = collection.textDark ? 'text-navy' : 'text-white';
  const subtitleColor = collection.textDark ? 'text-gray-600' : 'text-white/80';

  return (
    <section className={`relative ${collection.bgColor} py-16 overflow-hidden`}>
      {/* Decorative wave */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z"
            fill="currentColor"
            className={collection.textDark ? 'text-gray-300' : 'text-white'}
          />
        </svg>
      </div>

      <div className="relative z-10 px-6 text-center">
        {/* Product Image */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <Image
            src={collection.image}
            alt={`${collection.name} ${collection.subtitle}`}
            fill
            className="object-contain drop-shadow-xl"
          />
        </div>

        {/* Series Name */}
        <h2 className={`font-display ${textColor} mb-3`}>
          <span className="text-5xl font-bold">{collection.name}</span>
          <span className="text-2xl font-normal ml-2">{collection.subtitle}</span>
        </h2>

        {/* Tagline */}
        <p className={`text-base ${subtitleColor} mb-6 max-w-xs mx-auto`}>
          {collection.tagline}
        </p>

        {/* CTA Button */}
        <Link
          href={`/category/${collection.categoryId}`}
          className={`inline-flex items-center gap-2 px-5 py-2.5 border-2 rounded-lg font-semibold transition-all ${
            collection.textDark
              ? 'border-navy text-navy'
              : 'border-white text-white'
          }`}
        >
          Check Out
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// Page Title
function PageTitle() {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h1
          className="text-3xl md:text-5xl font-display font-bold text-navy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          COLLECTIONS
        </motion.h1>
      </div>
    </section>
  );
}

// Main Collections Page
export default function CollectionsTestPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Title */}
      <PageTitle />

      {/* Series Logo Bar - Desktop */}
      <div className="hidden md:block">
        <SeriesLogoBar />
      </div>

      {/* Mobile: Series Logo Bar with images */}
      <div className="md:hidden">
        <section className="py-4 bg-white border-t border-gray-100 overflow-x-auto">
          <div className="px-4">
            <div className="flex gap-6 min-w-max">
              {collections.slice(0, 6).map((collection) => (
                <Link
                  key={collection.id}
                  href={`/category/${collection.categoryId}`}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-10 h-14 flex-shrink-0">
                    <Image
                      src={collection.image}
                      alt={`${collection.name} Series`}
                      fill
                      className="object-contain"
                      sizes="40px"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-bold text-navy">
                      {collection.name}
                    </span>
                    <span className="block text-xs text-gray-500">Series</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Collection Sections - Desktop: Full width alternating */}
      <div className="hidden md:block">
        {collections.map((collection, index) => (
          <CollectionSection key={collection.id} collection={collection} index={index} />
        ))}
      </div>

      {/* Collection Sections - Mobile: Stacked cards */}
      <div className="md:hidden">
        {collections.map((collection) => (
          <MobileCollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
