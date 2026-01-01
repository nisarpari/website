'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context';
import { OdooAPI, type Product } from '@/lib/api/odoo';
import { ProductImage } from '@/components/ProductImage';

// Smart toilet features for comparison
const smartToiletFeatures = [
  { id: 'autoLid', label: 'Auto Open/Close Lid', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'rearWash', label: 'Rear Wash', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'frontWash', label: 'Front Wash', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'autoFlush', label: 'Auto Flush', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: 'heatedSeat', label: 'Heated Seat', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  { id: 'nightLight', label: 'Night Light', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'deodorizer', label: 'Deodorizer', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707' },
  { id: 'dryer', label: 'Warm Air Dryer', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
];

// Sample smart toilet models (would come from API in production)
const smartToiletModels = [
  {
    id: 1,
    name: 'Bella Smart Pro',
    image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400&q=80',
    description: 'Premium smart toilet with full automation',
    features: ['autoLid', 'rearWash', 'frontWash', 'autoFlush', 'heatedSeat', 'nightLight', 'deodorizer', 'dryer'],
    color: 'white'
  },
  {
    id: 2,
    name: 'Bella Smart Elite',
    image: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&q=80',
    description: 'Wall-hung smart toilet with essential features',
    features: ['autoLid', 'rearWash', 'frontWash', 'autoFlush', 'heatedSeat'],
    color: 'white'
  },
  {
    id: 3,
    name: 'Bella Smart Luxe',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80',
    description: 'One-piece design with advanced wash system',
    features: ['autoLid', 'rearWash', 'frontWash', 'autoFlush', 'heatedSeat', 'nightLight'],
    color: 'black'
  },
];

// Feature cards for the showcase section
const featureShowcase = [
  {
    title: 'Automated Functionality',
    description: 'Hands-free operation with motion sensors that automatically open the lid as you approach.',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'
  },
  {
    title: 'Personalized Bidet Settings',
    description: 'Customizable water pressure, temperature, and spray patterns for your comfort.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'
  },
  {
    title: 'Ultra-Hygienic Features',
    description: 'Self-cleaning nozzles, UV sterilization, and antimicrobial surfaces.',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80'
  }
];

// Product card component
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
        className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="relative aspect-square bg-gradient-to-br from-bella-50 to-white overflow-hidden">
          <ProductImage
            src={product.thumbnail || product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        <div className="p-4 md:p-5">
          <p className="text-xs text-bella-400 uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-medium text-navy text-sm md:text-base line-clamp-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-bold text-navy">
              {countryConfig.currencySymbol} {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Compare model card
function CompareModelCard({ model, isSelected, onClick }: {
  model: typeof smartToiletModels[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-gold' : ''}`}
      onClick={onClick}
    >
      <div className={`relative aspect-square rounded-2xl overflow-hidden ${model.color === 'black' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Image
          src={model.image}
          alt={model.name}
          fill
          className="object-contain p-4"
        />
      </div>
      <p className={`text-center mt-3 font-medium ${isSelected ? 'text-gold' : 'text-navy'}`}>
        {model.name}
      </p>
    </motion.div>
  );
}

export default function SmartProductsPage() {
  const [smartToilets, setSmartToilets] = useState<Product[]>([]);
  const [sensorFaucets, setSensorFaucets] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState<number[]>([0, 1, 2]);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Fetch smart toilets and sensor faucets
        // Using tankless toilets (201) and sensor faucets category
        const [toilets, faucets] = await Promise.all([
          OdooAPI.fetchProductsByPublicCategory(201, 4),
          OdooAPI.fetchProductsByPublicCategory(107, 4) // Sensor faucets
        ]);
        setSmartToilets(toilets);
        setSensorFaucets(faucets);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  const toggleModelSelection = (index: number) => {
    setSelectedModels(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      if (prev.length >= 4) return prev;
      return [...prev, index];
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <motion.div style={{ opacity: heroOpacity }} className="relative h-full">
          <div className="max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center text-sm text-bella-500 mb-8"
            >
              <Link href="/" className="hover:text-navy transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-navy">Smart Products</span>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight"
                >
                  Experience the Difference:
                  <span className="text-gold block mt-2">Smart Bathroom</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-bella-600 text-lg md:text-xl mt-6 leading-relaxed max-w-xl"
                >
                  Blending modern design and advanced technology, our smart products transform the bathroom experience with elevated cleanliness, comfort, and convenience.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <a
                    href="#compare"
                    className="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                  >
                    Compare Models
                  </a>
                  <a
                    href="#products"
                    className="inline-flex items-center gap-2 border-2 border-navy text-navy hover:bg-navy hover:text-white px-8 py-4 rounded-full font-semibold transition-all"
                  >
                    View Products
                  </a>
                </motion.div>
              </div>

              {/* Product Showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="relative"
              >
                <div className="grid grid-cols-3 gap-4">
                  {smartToiletModels.slice(0, 3).map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className={`aspect-square rounded-2xl ${model.color === 'black' ? 'bg-gray-900' : 'bg-white'} shadow-lg p-4 flex items-center justify-center`}>
                        <Image
                          src={model.image}
                          alt={model.name}
                          width={150}
                          height={150}
                          className="object-contain"
                        />
                      </div>
                      <p className="mt-3 text-sm font-medium text-navy">{model.name.split(' ').pop()}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-navy/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-navy/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Elevated Experience Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-light text-navy">
              Elevated Experience
            </h2>
            <p className="text-bella-600 text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
              A perfect harmony of innovative technology, sculptural form, and premium materials, our smart toilets are designed to elevate your bathroom experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="aspect-[16/9] max-w-2xl mx-auto relative">
              <Image
                src="https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=1200&q=80"
                alt="Smart toilet elevated design"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Personalized Hygiene Section - Dark Theme */}
      <section className="py-20 md:py-32 bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-light text-white">
              Personalized Hygiene
            </h2>
            <p className="text-white/70 text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
              Changing routines into rituals, Bella smart toilets unlock new levels of personalization with customized cleansing sprays, water pressure, and temperature for your ideal comfort and cleanliness.
            </p>
          </motion.div>

          {/* Animated water droplets effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative w-64 h-64">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  style={{
                    left: `${30 + Math.random() * 40}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, 100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next-Level Features Showcase */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-light text-navy mb-12"
          >
            Next-Level Smart Toilet Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-1">
            {featureShowcase.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-[4/5] overflow-hidden cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">{feature.title}</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {activeFeature === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-white/80 text-sm mt-3"
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Models Section */}
      <section id="compare" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-light text-navy">
              Discover Your Ideal Smart Toilet Experience
            </h2>
            <p className="text-bella-500 mt-4">Select models to compare features</p>
          </motion.div>

          {/* Model Selection */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            {smartToiletModels.map((model, index) => (
              <CompareModelCard
                key={model.id}
                model={model}
                isSelected={selectedModels.includes(index)}
                onClick={() => toggleModelSelection(index)}
              />
            ))}
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-4 font-medium text-bella-500">Feature</th>
                  {selectedModels.map(index => (
                    <th key={index} className="text-center py-4 px-4 font-medium text-navy">
                      {smartToiletModels[index].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {smartToiletFeatures.map((feature, i) => (
                  <motion.tr
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                        </svg>
                        <span className="text-navy">{feature.label}</span>
                      </div>
                    </td>
                    {selectedModels.map(index => (
                      <td key={index} className="text-center py-4 px-4">
                        {smartToiletModels[index].features.includes(feature.id) ? (
                          <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Smart Product Categories */}
      <section id="products" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Smart Toilets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-navy">Smart Toilets</h3>
                <p className="text-bella-500 mt-2">Experience next-generation bathroom technology</p>
              </div>
              <Link
                href="/tankless-toilets"
                className="hidden md:flex items-center gap-2 text-gold hover:text-gold-dark font-medium"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loader"></div>
              </div>
            ) : smartToilets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {smartToilets.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {smartToiletModels.slice(0, 4).map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className={`aspect-square ${model.color === 'black' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
                      <Image
                        src={model.image}
                        alt={model.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-navy">{model.name}</h4>
                      <p className="text-sm text-bella-500 mt-1">{model.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Sensor Faucets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-navy">Sensor Faucets</h3>
                <p className="text-bella-500 mt-2">Touchless technology for superior hygiene</p>
              </div>
              <Link
                href="/shop?category=107"
                className="hidden md:flex items-center gap-2 text-gold hover:text-gold-dark font-medium"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loader"></div>
              </div>
            ) : sensorFaucets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {sensorFaucets.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-bella-500">
                Sensor faucet products coming soon
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Upgrade Your Bathroom?
            </h2>
            <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Experience the future of bathroom technology. Our smart products combine innovation, design, and functionality for the ultimate bathroom experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-gold/25"
              >
                Shop All Smart Products
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-full font-semibold transition-all hover:bg-white/10"
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
