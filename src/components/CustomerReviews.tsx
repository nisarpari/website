'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Customer reviews data
const reviews = [
  {
    text: "The well organized showroom offers a wide variety of outdoor living solutions, from luxurious furniture to high-quality outdoor & indoor kitchen appliances. Also the staff were knowledgeable and helpful.",
    author: "Ahmed Al-Rashid",
    location: "Muscat, Oman",
    rating: 5
  },
  {
    text: "I can't describe this company enough. First of all the range of products and specialties related to bathroom, gardens and kitchens are amazing and interesting. The team is very knowledgeable and professional. Their customer service support is excellent.",
    author: "Priya Sharma",
    location: "Mumbai, India",
    rating: 5
  },
  {
    text: "Premium sanitary products with top quality, amazing design. Thank you Bella for the best product and excellent customer service. Thanks to Ms Umida for her quality service. Highly recommend!",
    author: "Mohammed Al-Farsi",
    location: "Dubai, UAE",
    rating: 5
  },
  {
    text: "Excellent quality products and outstanding service. The showroom staff helped us choose the perfect fixtures for our new villa. Delivery was prompt and installation support was great.",
    author: "Sarah Johnson",
    location: "Doha, Qatar",
    rating: 5
  },
  {
    text: "Best sanitaryware brand in the region. We've been using Bella products for years and the quality is consistently excellent. Their after-sales service is commendable.",
    author: "Rajesh Patel",
    location: "Ahmedabad, India",
    rating: 5
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate reviews
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setReviewIndex(index);
  };

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-navy-light">
      <div className="px-5 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-navy dark:text-white text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Customer Reviews
        </motion.h2>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Desktop: Show 3 reviews */}
          <div className="hidden md:flex items-center gap-6 justify-center">
            {[-1, 0, 1].map((offset) => {
              const index = (reviewIndex + offset + reviews.length) % reviews.length;
              const review = reviews[index];
              const isCenter = offset === 0;
              return (
                <motion.div
                  key={`${index}-${offset}`}
                  className={`transition-all duration-500 ${
                    isCenter
                      ? 'w-[400px] opacity-100 scale-100'
                      : 'w-[300px] opacity-50 scale-95'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isCenter ? 1 : 0.5, scale: isCenter ? 1 : 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className={`bg-white dark:bg-navy rounded-2xl p-6 ${isCenter ? 'shadow-xl border border-bella-200 dark:border-white/10' : ''}`}>
                    <p className={`text-gray-600 dark:text-bella-300 mb-4 ${isCenter ? 'text-base' : 'text-sm'} line-clamp-5`}>
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-4xl text-bella-300 dark:text-bella-500">&ldquo;</span>
                    </div>
                    <div className="mb-2">
                      <StarRating rating={review.rating} />
                    </div>
                    {isCenter && (
                      <div className="text-center">
                        <p className="font-semibold text-navy dark:text-white">{review.author}</p>
                        <p className="text-sm text-gray-500 dark:text-bella-400">{review.location}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: Show 1 review */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-navy rounded-2xl p-6 shadow-lg border border-bella-200 dark:border-white/10 mx-auto max-w-sm"
              >
                <p className="text-gray-600 dark:text-bella-300 mb-4 text-sm">
                  &ldquo;{reviews[reviewIndex].text}&rdquo;
                </p>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl text-bella-300 dark:text-bella-500">&ldquo;</span>
                </div>
                <div className="mb-3">
                  <StarRating rating={reviews[reviewIndex].rating} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-navy dark:text-white">{reviews[reviewIndex].author}</p>
                  <p className="text-sm text-gray-500 dark:text-bella-400">{reviews[reviewIndex].location}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-navy rounded-full shadow-lg flex items-center justify-center hover:bg-bella-50 dark:hover:bg-navy-light transition-colors z-10"
            aria-label="Previous review"
          >
            <svg className="w-5 h-5 text-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-navy rounded-full shadow-lg flex items-center justify-center hover:bg-bella-50 dark:hover:bg-navy-light transition-colors z-10"
            aria-label="Next review"
          >
            <svg className="w-5 h-5 text-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2.5 rounded-full transition-all ${
                  reviewIndex === index ? 'bg-navy dark:bg-gold w-6' : 'bg-gray-300 dark:bg-bella-600 w-2.5'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Visit Our Showrooms Link */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray-500 dark:text-bella-400 mb-4">Experience our products in person</p>
          <a
            href="https://maps.google.com/?q=Bella+Bathware"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-navy dark:bg-gold text-white dark:text-navy font-semibold px-6 py-3 rounded-full hover:bg-navy-light dark:hover:bg-gold-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Visit Our Showrooms
          </a>
        </motion.div>
      </div>
    </section>
  );
}
