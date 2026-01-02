import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Jacuzzis & Whirlpool Baths | Hydrotherapy Luxury | Bella Bathwares',
  description: 'Experience ultimate relaxation with our premium jacuzzis and whirlpool baths. Advanced hydrotherapy features, powerful massage jets, and elegant design.',
  keywords: 'jacuzzi, whirlpool bath, spa bath, hydrotherapy, massage jets, luxury bathroom, wellness',
};

// Feature icons
const HydrotherapyIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const WaterproofIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ControlPanelIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HeatRetentionIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

export default function JacuzzisPage() {
  return (
    <CategoryShowcase
      configKey="jacuzzis"
      heroTitle="Jacuzzis"
      heroSubtitle="Ultimate Wellness & Luxury"
      heroDescription="Immerse yourself in pure relaxation with our premium jacuzzis. Advanced hydrotherapy, powerful massage jets, and elegant design combine to deliver the ultimate wellness experience."
      heroImage="https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&q=80"
      heroImageAlt="Luxury jacuzzi with LED lights"
      features={[
        {
          icon: HydrotherapyIcon,
          title: "Advanced Hydrotherapy",
          description: "Targeted massage jets soothe muscles and promote wellness through water therapy."
        },
        {
          icon: WaterproofIcon,
          title: "IPX5 Waterproof",
          description: "Professional-grade waterproofing ensures lasting durability and performance."
        },
        {
          icon: ControlPanelIcon,
          title: "Stylish Controls",
          description: "Advanced, dependable control system for effortless operation of all features."
        },
        {
          icon: HeatRetentionIcon,
          title: "Superior Heat Retention",
          description: "Exceptional thermal technology keeps water at your perfect temperature."
        }
      ]}
      stats={[
        { value: "20+", label: "Massage Jets" },
        { value: "7", label: "Color Modes" },
        { value: "3hr+", label: "Heat Retention" },
        { value: "Spa", label: "Experience" }
      ]}
      benefitsTitle="Your Personal Wellness Center"
      benefitsDescription="A jacuzzi is more than a bath - it's an investment in your wellbeing. Experience the therapeutic benefits of hydrotherapy while indulging in unmatched luxury."
      benefits={[
        "Powerful hydrotherapy for muscle relaxation",
        "LED chromotherapy lighting systems",
        "Built-in ozone and UV sterilization",
        "Ergonomic seating for multiple bathers",
        "Whisper-quiet pump technology",
        "Energy-efficient heating systems"
      ]}
      categoryId={49}
      productsTitle="Jacuzzi Collection"
      ctaTitle="Elevate Your Wellness"
      ctaDescription="Transform your bathroom into a private spa. Our jacuzzis deliver professional-grade hydrotherapy and unmatched relaxation."
      ctaButtonText="Explore Jacuzzis"
    />
  );
}
