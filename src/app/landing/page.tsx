'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Bath,
  ShowerHead,
  Droplets,
  ChevronRight,
  ArrowLeft,
  Search,
  MessageCircle,
  Send,
  Check,
  Home,
  Waves,
  Sparkles
} from 'lucide-react';

// Animated Water Shower Icon Component
const AnimatedShowerIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shower Head */}
        <motion.path
          d="M20 8H44C46.2091 8 48 9.79086 48 12V16C48 18.2091 46.2091 20 44 20H20C17.7909 20 16 18.2091 16 16V12C16 9.79086 17.7909 8 20 8Z"
          fill="currentColor"
          opacity="0.9"
          initial={{ y: -2 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Shower holes */}
        <circle cx="24" cy="14" r="1.5" fill="white" opacity="0.6" />
        <circle cx="32" cy="14" r="1.5" fill="white" opacity="0.6" />
        <circle cx="40" cy="14" r="1.5" fill="white" opacity="0.6" />

        {/* Animated Water Drops - Column 1 */}
        <motion.ellipse
          cx="24"
          cy="28"
          rx="2"
          ry="4"
          fill="currentColor"
          opacity="0.7"
          initial={{ y: -8, opacity: 0, scaleY: 0.5 }}
          animate={{ y: 32, opacity: [0, 0.7, 0.7, 0], scaleY: [0.5, 1, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeIn", delay: 0 }}
        />
        <motion.ellipse
          cx="24"
          cy="28"
          rx="1.5"
          ry="3"
          fill="currentColor"
          opacity="0.5"
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 28, opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeIn", delay: 0.4 }}
        />

        {/* Animated Water Drops - Column 2 */}
        <motion.ellipse
          cx="32"
          cy="28"
          rx="2.5"
          ry="5"
          fill="currentColor"
          opacity="0.8"
          initial={{ y: -8, opacity: 0, scaleY: 0.5 }}
          animate={{ y: 30, opacity: [0, 0.8, 0.8, 0], scaleY: [0.5, 1, 1, 0.5] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeIn", delay: 0.2 }}
        />
        <motion.ellipse
          cx="32"
          cy="28"
          rx="2"
          ry="4"
          fill="currentColor"
          opacity="0.6"
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 26, opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeIn", delay: 0.6 }}
        />

        {/* Animated Water Drops - Column 3 */}
        <motion.ellipse
          cx="40"
          cy="28"
          rx="2"
          ry="4"
          fill="currentColor"
          opacity="0.7"
          initial={{ y: -8, opacity: 0, scaleY: 0.5 }}
          animate={{ y: 34, opacity: [0, 0.7, 0.7, 0], scaleY: [0.5, 1, 1, 0.5] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeIn", delay: 0.1 }}
        />
        <motion.ellipse
          cx="40"
          cy="28"
          rx="1.5"
          ry="3"
          fill="currentColor"
          opacity="0.5"
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 24, opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 0.95, repeat: Infinity, ease: "easeIn", delay: 0.5 }}
        />

        {/* Extra small droplets for detail */}
        <motion.circle
          cx="28"
          cy="30"
          r="1.5"
          fill="currentColor"
          opacity="0.4"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 28, opacity: [0, 0.4, 0.4, 0] }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "easeIn", delay: 0.3 }}
        />
        <motion.circle
          cx="36"
          cy="30"
          r="1.5"
          fill="currentColor"
          opacity="0.4"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 26, opacity: [0, 0.4, 0.4, 0] }}
          transition={{ duration: 1.05, repeat: Infinity, ease: "easeIn", delay: 0.35 }}
        />

        {/* Splash effect at bottom */}
        <motion.path
          d="M22 56C22 56 26 52 32 52C38 52 42 56 42 56"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
        />
      </svg>
    </div>
  );
};
import { useVerification, GCC_COUNTRIES_LIST } from '@/context/VerificationContext';
import { ODOO_CONFIG } from '@/lib/api/config';

// Types
interface BathroomConfig {
  count: number;
  masterBathroom: {
    tubType: 'whirlpool' | 'bathtub' | 'none' | null;
    toiletType: 'wall-hung' | 'single-piece' | 'smart' | null;
    faucetType: 'smart' | 'regular' | null;
  };
  guestBathrooms: {
    toiletType: 'wall-hung' | 'single-piece' | null;
    hasShower: boolean;
  };
}

// Category options for step 2
const categoryOptions = [
  {
    id: 'whole-bathroom',
    title: 'Complete Bathroom',
    subtitle: 'Design your dream space',
    icon: Home,
    isWizard: true,
  },
  {
    id: 'shower',
    title: 'Shower Solutions',
    subtitle: 'Rain showers & enclosures',
    icon: ShowerHead,
    href: '/shop?category=shower',
  },
  {
    id: 'toilets',
    title: 'Toilets & Cisterns',
    subtitle: 'Modern & smart options',
    icon: Droplets,
    href: '/shop?category=toilets',
  },
  {
    id: 'whirlpool',
    title: 'Whirlpool & Bathtubs',
    subtitle: 'Luxury relaxation',
    icon: Waves,
    href: '/jacuzzis',
  },
];

// Typing animation component
const TypingText = ({
  text,
  onComplete,
  speed = 50
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </span>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  const router = useRouter();
  const { markAsVerified, gccCountries } = useVerification();

  // Wizard state
  const [step, setStep] = useState<'welcome' | 'options' | 'wizard' | 'quote' | 'verify' | 'success'>('welcome');
  const [showOptions, setShowOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Bathroom wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [bathroomConfig, setBathroomConfig] = useState<BathroomConfig>({
    count: 1,
    masterBathroom: {
      tubType: null,
      toiletType: null,
      faucetType: null,
    },
    guestBathrooms: {
      toiletType: null,
      hasShower: true,
    },
  });

  // Verification state
  const [selectedCountry, setSelectedCountry] = useState(gccCountries[0] || GCC_COUNTRIES_LIST[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [verifyStep, setVerifyStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  // Handle welcome completion
  const handleWelcomeComplete = useCallback(() => {
    setTimeout(() => setShowOptions(true), 500);
  }, []);

  // Handle category selection
  const handleCategorySelect = (category: typeof categoryOptions[0]) => {
    if (category.isWizard) {
      setStep('wizard');
    } else if (category.href) {
      router.push(category.href);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Wizard questions
  const wizardQuestions = [
    {
      question: 'How many bathrooms are you designing?',
      options: [
        { value: 1, label: '1 Bathroom' },
        { value: 2, label: '2 Bathrooms' },
        { value: 3, label: '3 Bathrooms' },
        { value: 4, label: '4+ Bathrooms' },
      ],
      onSelect: (value: number) => {
        setBathroomConfig(prev => ({ ...prev, count: value }));
        setWizardStep(1);
      },
    },
    {
      question: 'For your master bathroom, would you prefer?',
      options: [
        { value: 'whirlpool', label: 'Whirlpool / Jacuzzi', icon: Waves },
        { value: 'bathtub', label: 'Elegant Bathtub', icon: Bath },
        { value: 'none', label: 'Shower Only', icon: ShowerHead },
      ],
      onSelect: (value: 'whirlpool' | 'bathtub' | 'none') => {
        setBathroomConfig(prev => ({
          ...prev,
          masterBathroom: { ...prev.masterBathroom, tubType: value },
        }));
        setWizardStep(2);
      },
    },
    {
      question: 'What type of toilet do you prefer?',
      options: [
        { value: 'wall-hung', label: 'Wall-Hung Toilet', subtitle: 'Modern & space-saving' },
        { value: 'single-piece', label: 'Single Piece', subtitle: 'Classic & reliable' },
        { value: 'smart', label: 'Smart Toilet', subtitle: 'High-tech comfort' },
      ],
      onSelect: (value: 'wall-hung' | 'single-piece' | 'smart') => {
        setBathroomConfig(prev => ({
          ...prev,
          masterBathroom: { ...prev.masterBathroom, toiletType: value },
        }));
        setWizardStep(3);
      },
    },
    {
      question: 'Would you like smart faucets?',
      options: [
        { value: 'smart', label: 'Yes, Smart Faucets', subtitle: 'Touchless & temperature control' },
        { value: 'regular', label: 'Regular Faucets', subtitle: 'Classic elegance' },
      ],
      onSelect: (value: 'smart' | 'regular') => {
        setBathroomConfig(prev => ({
          ...prev,
          masterBathroom: { ...prev.masterBathroom, faucetType: value },
        }));
        // Generate quote
        setStep('quote');
      },
    },
  ];

  // Generate quote summary
  const generateQuoteSummary = () => {
    const items = [];
    const { count, masterBathroom } = bathroomConfig;

    // Master bathroom items
    if (masterBathroom.tubType === 'whirlpool') {
      items.push({ name: 'Whirlpool / Jacuzzi', qty: 1, estimate: 'OMR 800 - 2,500' });
    } else if (masterBathroom.tubType === 'bathtub') {
      items.push({ name: 'Freestanding Bathtub', qty: 1, estimate: 'OMR 300 - 1,200' });
    }

    if (masterBathroom.toiletType === 'smart') {
      items.push({ name: 'Smart Toilet', qty: count, estimate: `OMR ${400 * count} - ${1500 * count}` });
    } else if (masterBathroom.toiletType === 'wall-hung') {
      items.push({ name: 'Wall-Hung Toilet', qty: count, estimate: `OMR ${150 * count} - ${400 * count}` });
    } else {
      items.push({ name: 'Single Piece Toilet', qty: count, estimate: `OMR ${100 * count} - ${300 * count}` });
    }

    if (masterBathroom.faucetType === 'smart') {
      items.push({ name: 'Smart Faucet Set', qty: count * 2, estimate: `OMR ${200 * count * 2} - ${600 * count * 2}` });
    } else {
      items.push({ name: 'Premium Faucet Set', qty: count * 2, estimate: `OMR ${50 * count * 2} - ${200 * count * 2}` });
    }

    items.push({ name: 'Rain Shower System', qty: count, estimate: `OMR ${100 * count} - ${400 * count}` });

    return items;
  };

  // Handle OTP send
  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/verify/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          countryCode: selectedCountry.code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFullPhone(data.phone);
        if (data.devOtp) setDevOtp(data.devOtp);
        setVerifyStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    }

    setLoading(false);
  };

  // Handle OTP verify
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/verify/check-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        markAsVerified(data.phone, data.token);
        // Submit quote request
        await submitQuoteRequest(data.phone);
        setStep('success');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    }

    setLoading(false);
  };

  // Submit quote request
  const submitQuoteRequest = async (verifiedPhoneNumber: string) => {
    try {
      // In future, this will send to backend
      console.log('Quote request submitted:', {
        config: bathroomConfig,
        phone: verifiedPhoneNumber,
        items: generateQuoteSummary(),
      });
    } catch (err) {
      console.error('Failed to submit quote:', err);
    }
  };

  // Go back handler
  const handleBack = () => {
    if (step === 'wizard' && wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    } else if (step === 'wizard') {
      setStep('options');
    } else if (step === 'quote') {
      setStep('wizard');
      setWizardStep(wizardQuestions.length - 1);
    } else if (step === 'verify') {
      setStep('quote');
      setVerifyStep('phone');
      setOtp('');
      setError('');
    } else if (step === 'options') {
      setStep('welcome');
      setShowOptions(false);
    }
  };

  return (
    <div className="min-h-screen bg-bella-50 dark:bg-navy-dark flex items-center justify-center p-4 sm:p-6">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Back button */}
        <AnimatePresence>
          {step !== 'welcome' && step !== 'success' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={handleBack}
              className="absolute -top-12 left-0 flex items-center gap-2 text-bella-500 dark:text-bella-400 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <AnimatedShowerIcon className="w-16 h-16 text-gold mx-auto mb-4" />
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-navy dark:text-white mb-6 leading-tight">
                <TypingText
                  text="Welcome to Bella Bathwares"
                  onComplete={handleWelcomeComplete}
                  speed={60}
                />
              </h1>

              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-bella-600 dark:text-bella-300 text-lg mb-8">
                      What are you looking for today?
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('options')}
                      className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-medium transition-colors"
                    >
                      Let&apos;s explore
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 2: Options */}
          {step === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl sm:text-3xl font-display text-navy dark:text-white text-center mb-2">
                What brings you here?
              </h2>
              <p className="text-bella-500 dark:text-bella-400 text-center mb-8">
                Choose an option or search for specific products
              </p>

              {/* Category Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {categoryOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategorySelect(option)}
                    className="group relative bg-white dark:bg-navy rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all border border-bella-100 dark:border-navy-light"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 dark:bg-gold/20 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                        <option.icon className="w-6 h-6 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-navy dark:text-white mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-bella-500 dark:text-bella-400">
                          {option.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-bella-300 dark:text-bella-500 group-hover:text-gold transition-colors shrink-0" />
                    </div>
                    {option.isWizard && (
                      <span className="absolute top-3 right-3 text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                        AI Quote
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gold/5 to-transparent rounded-2xl blur-xl" />
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Or search for something specific..."
                    className="w-full px-6 py-4 pl-14 bg-white dark:bg-navy rounded-2xl border border-bella-100 dark:border-navy-light text-navy dark:text-white placeholder:text-bella-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-bella-400" />
                  {searchQuery && (
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold hover:bg-gold-dark text-white p-2 rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 3: Wizard */}
          {step === 'wizard' && (
            <motion.div
              key={`wizard-${wizardStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Progress */}
              <div className="flex justify-center gap-2 mb-8">
                {wizardQuestions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === wizardStep
                        ? 'w-8 bg-gold'
                        : index < wizardStep
                        ? 'w-4 bg-gold/50'
                        : 'w-4 bg-bella-200 dark:bg-navy-light'
                    }`}
                  />
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-display text-navy dark:text-white mb-8">
                {wizardQuestions[wizardStep].question}
              </h2>

              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {wizardQuestions[wizardStep].options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => wizardQuestions[wizardStep].onSelect(option.value as never)}
                    className="group bg-white dark:bg-navy rounded-xl p-4 text-left border border-bella-100 dark:border-navy-light hover:border-gold dark:hover:border-gold transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {(option as { icon?: typeof Bath }).icon && (
                        <div className="w-10 h-10 rounded-lg bg-bella-100 dark:bg-navy-light flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                          {(() => {
                            const IconComponent = (option as { icon: typeof Bath }).icon;
                            return <IconComponent className="w-5 h-5 text-bella-600 dark:text-bella-300 group-hover:text-gold transition-colors" />;
                          })()}
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="font-medium text-navy dark:text-white">
                          {option.label}
                        </span>
                        {(option as { subtitle?: string }).subtitle && (
                          <p className="text-sm text-bella-500 dark:text-bella-400">
                            {(option as { subtitle: string }).subtitle}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-bella-300 group-hover:text-gold transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Quote */}
          {step === 'quote' && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display text-navy dark:text-white mb-2">
                  Your Personalized Quote
                </h2>
                <p className="text-bella-500 dark:text-bella-400">
                  Based on your preferences, here&apos;s an estimate
                </p>
              </div>

              {/* Quote Items */}
              <div className="bg-white dark:bg-navy rounded-2xl border border-bella-100 dark:border-navy-light p-6 mb-6">
                <div className="space-y-4">
                  {generateQuoteSummary().map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-2 border-b border-bella-100 dark:border-navy-light last:border-0"
                    >
                      <div>
                        <p className="font-medium text-navy dark:text-white">{item.name}</p>
                        <p className="text-sm text-bella-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-medium text-gold">{item.estimate}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-bella-200 dark:border-navy-light">
                  <p className="text-xs text-bella-500 dark:text-bella-400 text-center">
                    * Estimates may vary based on specific product selection
                  </p>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('verify')}
                className="w-full flex items-center justify-center gap-3 bg-gold hover:bg-gold-dark text-white py-4 rounded-xl font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Request Detailed Quote via WhatsApp
              </motion.button>
            </motion.div>
          )}

          {/* Step 5: Verification */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl font-display text-navy dark:text-white mb-2">
                  Verify Your WhatsApp
                </h2>
                <p className="text-bella-500 dark:text-bella-400">
                  We&apos;ll send your personalized quote via WhatsApp
                </p>
              </div>

              <div className="bg-white dark:bg-navy rounded-2xl border border-bella-100 dark:border-navy-light p-6">
                {verifyStep === 'phone' ? (
                  <div className="space-y-4">
                    {/* Country Selector */}
                    <div>
                      <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                        Country
                      </label>
                      <select
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const found = gccCountries.find(c => c.code === e.target.value);
                          if (found) setSelectedCountry(found);
                        }}
                        className="w-full px-4 py-3 bg-bella-50 dark:bg-navy-light border border-bella-200 dark:border-navy rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-navy dark:text-white"
                      >
                        {gccCountries.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.dialCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="px-4 py-3 bg-bella-100 dark:bg-navy-light border border-bella-200 dark:border-navy rounded-xl text-navy dark:text-white font-medium min-w-[80px] text-center">
                          {selectedCountry.dialCode}
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9XXXXXXX"
                          className="flex-1 px-4 py-3 bg-bella-50 dark:bg-navy-light border border-bella-200 dark:border-navy rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-navy dark:text-white placeholder:text-bella-400"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-bella-600 dark:text-bella-300 text-center">
                      Enter the code sent to <span className="font-semibold text-navy dark:text-white">{fullPhone}</span>
                    </p>

                    {devOtp && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm text-center">
                          <strong>Dev Mode:</strong> OTP is <span className="font-mono font-bold">{devOtp}</span>
                        </p>
                      </div>
                    )}

                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-4 bg-bella-50 dark:bg-navy-light border border-bella-200 dark:border-navy rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-center text-2xl font-mono tracking-widest text-navy dark:text-white"
                      maxLength={6}
                    />

                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Verify & Submit Quote
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => { setVerifyStep('phone'); setOtp(''); setError(''); }}
                      className="w-full text-bella-500 hover:text-navy dark:hover:text-white py-2 text-sm transition-colors"
                    >
                      Change phone number
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 6: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-display text-navy dark:text-white mb-4">
                Quote Request Submitted!
              </h2>
              <p className="text-bella-600 dark:text-bella-300 mb-8">
                Our team will contact you on WhatsApp with a detailed quote within 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/shop')}
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Browse Products
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setStep('welcome');
                    setShowOptions(false);
                    setWizardStep(0);
                    setBathroomConfig({
                      count: 1,
                      masterBathroom: { tubType: null, toiletType: null, faucetType: null },
                      guestBathrooms: { toiletType: null, hasShower: true },
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-bella-100 dark:bg-navy hover:bg-bella-200 dark:hover:bg-navy-light text-navy dark:text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Start New Quote
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
