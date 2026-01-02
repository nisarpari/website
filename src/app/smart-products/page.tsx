'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLocale, useAdmin } from '@/context';
import { OdooAPI, type Product } from '@/lib/api/odoo';
import { ProductImage } from '@/components/ProductImage';
import { getApiUrl } from '@/lib/api/config';

// Types for page content
interface SmartProductsContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  elevatedTitle?: string;
  elevatedDescription?: string;
  hygieneTitle?: string;
  hygieneDescription?: string;
  featuresTitle?: string;
  ctaTitle?: string;
  ctaDescription?: string;
}

// Content Editor Modal
function ContentEditorModal({
  isOpen,
  onClose,
  content,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: SmartProductsContent;
  onSave: (content: SmartProductsContent) => void;
}) {
  const [editedContent, setEditedContent] = useState<SmartProductsContent>(content);
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'cta'>('hero');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = () => {
    onSave(editedContent);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-bella-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">Edit Smart Products Page</h2>
            <button onClick={onClose} className="text-bella-400 hover:text-navy">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {(['hero', 'sections', 'cta'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab ? 'bg-navy text-white' : 'bg-bella-100 text-bella-600 hover:bg-bella-200'
                }`}
              >
                {tab === 'hero' ? 'Hero' : tab === 'sections' ? 'Sections' : 'CTA'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Hero Title Line 1</label>
                <input
                  type="text"
                  value={editedContent.heroTitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, heroTitle: e.target.value })}
                  placeholder="Experience the Difference:"
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Hero Title Line 2 (Gold)</label>
                <input
                  type="text"
                  value={editedContent.heroSubtitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, heroSubtitle: e.target.value })}
                  placeholder="Smart Bathroom"
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Hero Description</label>
                <textarea
                  value={editedContent.heroDescription || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, heroDescription: e.target.value })}
                  placeholder="Blending modern design and advanced technology..."
                  rows={3}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="p-4 bg-bella-50 rounded-lg">
                <h4 className="font-medium text-navy mb-3">Elevated Experience Section</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedContent.elevatedTitle || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, elevatedTitle: e.target.value })}
                    placeholder="Elevated Experience"
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                  />
                  <textarea
                    value={editedContent.elevatedDescription || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, elevatedDescription: e.target.value })}
                    placeholder="A perfect harmony of innovative technology..."
                    rows={2}
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy resize-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-bella-50 rounded-lg">
                <h4 className="font-medium text-navy mb-3">Personalized Hygiene Section</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedContent.hygieneTitle || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, hygieneTitle: e.target.value })}
                    placeholder="Personalized Hygiene"
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                  />
                  <textarea
                    value={editedContent.hygieneDescription || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, hygieneDescription: e.target.value })}
                    placeholder="Changing routines into rituals..."
                    rows={2}
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy resize-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-bella-50 rounded-lg">
                <h4 className="font-medium text-navy mb-3">Features Section</h4>
                <input
                  type="text"
                  value={editedContent.featuresTitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, featuresTitle: e.target.value })}
                  placeholder="Next-Level Smart Toilet Features"
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
              </div>
            </div>
          )}

          {activeTab === 'cta' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">CTA Title</label>
                <input
                  type="text"
                  value={editedContent.ctaTitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, ctaTitle: e.target.value })}
                  placeholder="Ready to Upgrade Your Bathroom?"
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">CTA Description</label>
                <textarea
                  value={editedContent.ctaDescription || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, ctaDescription: e.target.value })}
                  placeholder="Experience the future of bathroom technology..."
                  rows={3}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-bella-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-bella-100 text-bella-700 rounded-lg font-medium hover:bg-bella-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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

// Feature cards for the showcase section (images will be populated from products)
const featureShowcaseData = [
  {
    title: 'Automated Functionality',
    description: 'Hands-free operation with motion sensors that automatically open the lid as you approach.',
  },
  {
    title: 'Personalized Bidet Settings',
    description: 'Customizable water pressure, temperature, and spray patterns for your comfort.',
  },
  {
    title: 'Ultra-Hygienic Features',
    description: 'Self-cleaning nozzles, UV sterilization, and antimicrobial surfaces.',
  }
];

// Product card component
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

export default function SmartProductsPage() {
  const [smartToilets, setSmartToilets] = useState<Product[]>([]);
  const [showcaseToilets, setShowcaseToilets] = useState<Product[]>([]);
  const [sensorFaucets, setSensorFaucets] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [pageContent, setPageContent] = useState<SmartProductsContent>({});
  const [isEditingContent, setIsEditingContent] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { isAdmin, editMode, token } = useAdmin();
  const API_BASE = getApiUrl();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Fetch smart toilets (more for showcase) and sensor faucets
        const [toilets, faucets] = await Promise.all([
          OdooAPI.fetchProductsByPublicCategory(276, 8), // Smart toilets category - fetch more for showcase
          OdooAPI.fetchProductsByPublicCategory(44, 4)   // Sensor faucets category
        ]);
        setShowcaseToilets(toilets.slice(0, 6)); // First 6 for hero and feature showcase
        setSmartToilets(toilets.slice(0, 4));    // First 4 for product grid
        setSensorFaucets(faucets);

        // Fetch page content
        try {
          const contentRes = await fetch(`${API_BASE}/api/admin/page-content/smart-products`);
          if (contentRes.ok) {
            const content = await contentRes.json();
            if (content) setPageContent(content);
          }
        } catch (error) {
          console.error('Failed to fetch page content:', error);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
      setLoading(false);
    };
    loadProducts();
  }, [API_BASE]);

  const savePageContent = async (content: SmartProductsContent) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/page-content/smart-products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });

      if (res.ok) {
        setPageContent(content);
      }
    } catch (error) {
      console.error('Failed to save page content:', error);
    }
  };

  // Get display values with fallbacks
  const heroTitle = pageContent.heroTitle || 'Experience the Difference:';
  const heroSubtitle = pageContent.heroSubtitle || 'Smart Bathroom';
  const heroDescription = pageContent.heroDescription || 'Blending modern design and advanced technology, our smart products transform the bathroom experience with elevated cleanliness, comfort, and convenience.';
  const elevatedTitle = pageContent.elevatedTitle || 'Elevated Experience';
  const elevatedDescription = pageContent.elevatedDescription || 'A perfect harmony of innovative technology, sculptural form, and premium materials, our smart toilets are designed to elevate your bathroom experience.';
  const hygieneTitle = pageContent.hygieneTitle || 'Personalized Hygiene';
  const hygieneDescription = pageContent.hygieneDescription || 'Changing routines into rituals, Bella smart toilets unlock new levels of personalization with customized cleansing sprays, water pressure, and temperature for your ideal comfort and cleanliness.';
  const featuresTitle = pageContent.featuresTitle || 'Next-Level Smart Toilet Features';
  const ctaTitle = pageContent.ctaTitle || 'Ready to Upgrade Your Bathroom?';
  const ctaDescription = pageContent.ctaDescription || 'Experience the future of bathroom technology. Our smart products combine innovation, design, and functionality for the ultimate bathroom experience.';

  return (
    <div className="min-h-screen bg-white dark:bg-navy">
      {/* Admin Edit Button */}
      {isAdmin && editMode && (
        <button
          onClick={() => setIsEditingContent(true)}
          className="fixed bottom-6 right-6 z-50 bg-navy text-white px-6 py-3 rounded-full shadow-lg hover:bg-navy-dark flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Page Content
        </button>
      )}

      {/* Content Editor Modal */}
      <ContentEditorModal
        isOpen={isEditingContent}
        onClose={() => setIsEditingContent(false)}
        content={pageContent}
        onSave={savePageContent}
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[70vh] md:h-screen min-h-[500px] md:min-h-[700px] max-h-[900px] overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-navy-light dark:to-navy">
        <motion.div style={{ opacity: heroOpacity }} className="relative h-full">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center text-xs md:text-sm text-bella-500 dark:text-bella-300 mb-4 md:mb-8"
            >
              <Link href="/" className="hover:text-navy dark:hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-navy dark:text-white">Smart Products</span>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text Content */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-navy dark:text-white leading-tight"
                >
                  {heroTitle}
                  <span className="text-gold block mt-2">{heroSubtitle}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-bella-600 dark:text-bella-300 text-sm md:text-xl mt-4 md:mt-6 leading-relaxed max-w-xl"
                >
                  {heroDescription}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4"
                >
                  <a
                    href="#compare"
                    className="inline-flex items-center justify-center gap-2 bg-navy dark:bg-gold hover:bg-navy-dark dark:hover:bg-gold-dark text-white dark:text-navy px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:scale-105"
                  >
                    Compare Models
                  </a>
                  <a
                    href="#products"
                    className="inline-flex items-center justify-center gap-2 border-2 border-navy dark:border-white/30 text-navy dark:text-white hover:bg-navy hover:text-white dark:hover:bg-white/10 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all"
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
                  {showcaseToilets.slice(0, 3).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center"
                    >
                      <Link href={`/product/${product.slug}`} className="block group">
                        <div className="aspect-square rounded-xl md:rounded-2xl bg-white dark:bg-navy-light shadow-lg p-2 md:p-4 flex items-center justify-center overflow-hidden">
                          <ProductImage
                            src={product.thumbnail || product.image || '/placeholder.jpg'}
                            alt={product.name}
                            width={150}
                            height={150}
                            className="object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <p className="mt-2 md:mt-3 text-xs md:text-sm font-medium text-navy dark:text-white group-hover:text-gold transition-colors line-clamp-1">{product.name}</p>
                      </Link>
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
            className="w-6 h-10 border-2 border-navy/30 dark:border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-navy/50 dark:bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Elevated Experience Section */}
      <section className="py-12 md:py-32 bg-white dark:bg-navy">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-5xl font-light text-navy dark:text-white">
              {elevatedTitle}
            </h2>
            <p className="text-bella-600 dark:text-bella-300 text-sm md:text-xl mt-4 md:mt-6 max-w-3xl mx-auto leading-relaxed">
              {elevatedDescription}
            </p>
          </motion.div>

          {showcaseToilets[0] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-16 relative"
            >
              <Link href={`/product/${showcaseToilets[0].slug}`} className="block group">
                <div className="aspect-[16/9] max-w-2xl mx-auto relative bg-gradient-to-br from-bella-50 to-white dark:from-navy-light dark:to-navy rounded-2xl overflow-hidden">
                  <ProductImage
                    src={showcaseToilets[0].image || showcaseToilets[0].thumbnail || '/placeholder.jpg'}
                    alt={showcaseToilets[0].name}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-center mt-4 text-navy dark:text-white font-medium group-hover:text-gold transition-colors">
                  {showcaseToilets[0].name}
                </p>
              </Link>
            </motion.div>
          )}
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
              {hygieneTitle}
            </h2>
            <p className="text-white/70 text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
              {hygieneDescription}
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
      <section className="py-12 md:py-32 bg-gray-50 dark:bg-navy-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-4xl font-light text-navy dark:text-white mb-8 md:mb-12"
          >
            {featuresTitle}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-1">
            {featureShowcaseData.map((feature, index) => {
              const product = showcaseToilets[index + 1]; // Use products starting from index 1 (0 is used in Elevated Experience)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative aspect-[16/9] md:aspect-[4/5] overflow-hidden cursor-pointer rounded-xl md:rounded-none"
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {product ? (
                    <Link href={`/product/${product.slug}`} className="block w-full h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-bella-100 to-bella-50 dark:from-navy dark:to-navy-light" />
                      <ProductImage
                        src={product.image || product.thumbnail || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium text-sm md:text-lg">{feature.title}</h3>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                          >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.div>
                        </div>

                        <p className="text-white/80 text-xs md:text-sm mt-2 md:mt-3 md:hidden">
                          {feature.description}
                        </p>
                        <AnimatePresence>
                          {activeFeature === index && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-white/80 text-sm mt-3 hidden md:block"
                            >
                              {feature.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <p className="text-gold text-xs mt-2 line-clamp-1">{product.name}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-full bg-bella-100 dark:bg-navy-light flex items-center justify-center">
                      <span className="text-bella-400">Loading...</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Toilet Features Section */}
      <section id="compare" className="py-12 md:py-32 bg-white dark:bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="font-display text-2xl md:text-5xl font-light text-navy dark:text-white">
              Smart Toilet Features
            </h2>
            <p className="text-bella-500 dark:text-bella-300 mt-2 md:mt-4 text-sm md:text-base">Advanced technology for ultimate comfort and hygiene</p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {smartToiletFeatures.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-bella-50 dark:bg-navy-light rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-navy dark:text-white font-medium text-sm md:text-base">{feature.label}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Product Categories */}
      <section id="products" className="py-12 md:py-32 bg-gray-50 dark:bg-navy-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Smart Toilets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-20"
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h3 className="font-display text-xl md:text-3xl font-bold text-navy dark:text-white">Smart Toilets</h3>
                <p className="text-bella-500 dark:text-bella-300 mt-1 md:mt-2 text-sm md:text-base">Experience next-generation bathroom technology</p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {smartToilets.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-bella-500 dark:text-bella-300">
                Smart toilet products coming soon
              </div>
            )}
          </motion.div>

          {/* Sensor Faucets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h3 className="font-display text-xl md:text-3xl font-bold text-navy dark:text-white">Sensor Faucets</h3>
                <p className="text-bella-500 dark:text-bella-300 mt-1 md:mt-2 text-sm md:text-base">Touchless technology for superior hygiene</p>
              </div>
              <Link
                href="/shop?category=44"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {sensorFaucets.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-bella-500 dark:text-bella-300">
                Sensor faucet products coming soon
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-32 bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-gold/10 rounded-full blur-2xl md:blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-white/5 rounded-full blur-2xl md:blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              {ctaTitle}
            </h2>
            <p className="text-white/70 text-sm md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto">
              {ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all hover:scale-105 shadow-lg shadow-gold/25"
              >
                Shop All Smart Products
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
