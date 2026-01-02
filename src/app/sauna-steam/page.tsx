'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocale } from '@/context';
import { OdooAPI, type Product } from '@/lib/api/odoo';
import { ProductImage } from '@/components/ProductImage';

// Product card with hover effects
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { countryConfig, formatPrice } = useLocale();

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
        <div className="relative aspect-square bg-gradient-to-br from-bella-50 to-white dark:from-navy dark:to-navy-light overflow-hidden">
          <ProductImage
            src={product.thumbnail || product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        <div className="p-3 md:p-4">
          <h3 className="font-product text-xs text-bella-500 dark:text-bella-300 uppercase tracking-wider line-clamp-2 overflow-hidden group-hover:text-gold transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

// Tab button component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-lg transition-all ${
        active
          ? 'bg-gold text-navy shadow-lg shadow-gold/25'
          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default function SaunaSteamPage() {
  const [activeTab, setActiveTab] = useState<'sauna' | 'steam'>('sauna');
  const [saunaProducts, setSaunaProducts] = useState<Product[]>([]);
  const [steamProducts, setSteamProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Fetch sauna and steam room products in parallel
        const [saunas, steams] = await Promise.all([
          OdooAPI.fetchProductsByPublicCategory(50, 6), // Sauna & Steam category
          OdooAPI.fetchProductsByPublicCategory(50, 6)  // Same category for now
        ]);
        setSaunaProducts(saunas);
        setSteamProducts(steams);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  const saunaFeatures = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      title: "Heat Therapy",
      description: "Rejuvenate with soothing dry heat for ultimate wellness and relaxation."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: "Premium Canadian Hemlock",
      description: "High-quality wood construction for durability and natural aesthetics."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Intuitive Controls",
      description: "Easily adjustable settings for a personalized sauna experience."
    }
  ];

  const steamFeatures = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      ),
      title: "Steam Therapy",
      description: "Advanced steam features for relaxation, detoxification, and respiratory health."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      title: "Shower + Music",
      description: "Integrated audio system for an enhanced, immersive experience."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: "Touch Control Panel",
      description: "Advanced technology for effortless operation of all features."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-navy">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[70vh] md:h-screen min-h-[500px] md:min-h-[600px] max-h-[900px] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80"
            alt="Luxury sauna and steam room"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/60" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative h-full flex items-center">
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
                <span className="text-white">Wellness</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm mb-2 md:mb-4"
              >
                Complete Wellness Solutions
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
              >
                Sauna & Steam Rooms
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-white/80 text-sm md:text-xl leading-relaxed mb-6 md:mb-8"
              >
                Transform your home into a luxury wellness retreat. Experience the therapeutic benefits of heat therapy with our premium saunas and steam rooms.
              </motion.p>

              {/* Tab Switcher */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <TabButton active={activeTab === 'sauna'} onClick={() => setActiveTab('sauna')}>
                  Saunas
                </TabButton>
                <TabButton active={activeTab === 'steam'} onClick={() => setActiveTab('steam')}>
                  Steam Rooms
                </TabButton>
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
      <section className="relative -mt-12 md:-mt-16 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-navy-light rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-12 dark:border dark:border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
              <div>
                <div className="text-xl md:text-4xl font-bold text-navy dark:text-white mb-1 md:mb-2">100%</div>
                <p className="text-bella-500 dark:text-bella-300 text-xs md:text-sm">Natural Wood</p>
              </div>
              <div>
                <div className="text-xl md:text-4xl font-bold text-navy dark:text-white mb-1 md:mb-2">65-85°C</div>
                <p className="text-bella-500 dark:text-bella-300 text-xs md:text-sm">Temperature Range</p>
              </div>
              <div>
                <div className="text-xl md:text-4xl font-bold text-navy dark:text-white mb-1 md:mb-2">1-6</div>
                <p className="text-bella-500 dark:text-bella-300 text-xs md:text-sm">Person Capacity</p>
              </div>
              <div>
                <div className="text-xl md:text-4xl font-bold text-navy dark:text-white mb-1 md:mb-2">Spa</div>
                <p className="text-bella-500 dark:text-bella-300 text-xs md:text-sm">Quality</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-28 bg-bella-50 dark:bg-navy-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <span className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm">
              {activeTab === 'sauna' ? 'Sauna Benefits' : 'Steam Room Benefits'}
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-navy dark:text-white mt-2 md:mt-3">
              {activeTab === 'sauna' ? 'The Art of Dry Heat Therapy' : 'The Power of Steam Therapy'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
            {(activeTab === 'sauna' ? saunaFeatures : steamFeatures).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white dark:bg-navy rounded-xl md:rounded-2xl p-4 md:p-8 shadow-sm hover:shadow-xl transition-shadow dark:border dark:border-white/10"
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 text-gold [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-8 md:[&>svg]:h-8">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-navy dark:text-white text-sm md:text-lg mb-1 md:mb-3">{feature.title}</h3>
                <p className="text-bella-500 dark:text-bella-300 text-xs md:text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Comparison */}
      <section className="py-12 md:py-28 bg-white dark:bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <span className="text-gold font-medium tracking-wider uppercase text-xs md:text-sm">Wellness Benefits</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-navy dark:text-white mt-2 md:mt-3">
              Health & Relaxation
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Sauna Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`p-4 md:p-8 rounded-xl md:rounded-2xl transition-all ${activeTab === 'sauna' ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 ring-2 ring-gold' : 'bg-bella-50 dark:bg-navy-light'}`}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-navy dark:text-white">Sauna</h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {[
                  'Deep muscle relaxation with dry heat',
                  'Improved circulation and cardiovascular health',
                  'Detoxification through perspiration',
                  'Stress relief and mental clarity',
                  'Better sleep quality',
                  'Skin rejuvenation and cleansing'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-bella-700 dark:text-bella-200 text-sm md:text-base">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Steam Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`p-4 md:p-8 rounded-xl md:rounded-2xl transition-all ${activeTab === 'steam' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 ring-2 ring-gold' : 'bg-bella-50 dark:bg-navy-light'}`}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-navy dark:text-white">Steam Room</h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {[
                  'Opens airways for better respiratory health',
                  'Deep hydration for skin',
                  'Relieves congestion and allergies',
                  'Soothes sore muscles and joints',
                  'Promotes relaxation and reduces anxiety',
                  'Boosts immune system function'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-bella-700 dark:text-bella-200 text-sm md:text-base">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

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
              {activeTab === 'sauna' ? 'Sauna Collection' : 'Steam Room Collection'}
            </h2>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loader"></div>
            </div>
          ) : (activeTab === 'sauna' ? saunaProducts : steamProducts).length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {(activeTab === 'sauna' ? saunaProducts : steamProducts).map((product, index) => (
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
                  href={`/shop?category=50`}
                  className="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                >
                  View All {activeTab === 'sauna' ? 'Saunas' : 'Steam Rooms'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-8 text-bella-500 dark:text-bella-300">
              {activeTab === 'sauna' ? 'Sauna' : 'Steam room'} products coming soon
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-28 bg-navy relative overflow-hidden">
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
              Create Your Home Wellness Sanctuary
            </h2>
            <p className="text-white/70 text-sm md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto">
              Invest in your health and relaxation. Our expert team can help you choose the perfect sauna or steam room for your space.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Link
                href="/shop?category=47"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:scale-105 shadow-lg shadow-gold/25"
              >
                Explore Wellness Products
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:bg-white/10"
              >
                Get Expert Advice
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
