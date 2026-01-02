import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Luxury Bathtubs | Freestanding & Soaking Tubs | Bella Bathwares',
  description: 'Discover our collection of luxury bathtubs - freestanding, soaking, and corner tubs. Premium materials with exceptional heat retention for the ultimate relaxation experience.',
  keywords: 'bathtub, freestanding bathtub, soaking tub, luxury bath, bathroom tub, acrylic bathtub, modern bathtub',
};

// Feature icons
const ScratchResistantIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const WaterproofIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
  </svg>
);

const HeatRetentionIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

const ErgonomicIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default function BathtubsPage() {
  return (
    <CategoryShowcase
      configKey="bathtubs"
      heroTitle="Luxury Bathtubs"
      heroSubtitle="Artistic Design Meets Peak Functionality"
      heroDescription="Indulge in the ultimate bathing experience with our collection of luxury bathtubs. From elegant freestanding designs to space-efficient corner tubs, find your perfect sanctuary."
      heroImage="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1600&q=80"
      heroImageAlt="Luxurious freestanding bathtub in spa-like bathroom"
      features={[
        {
          icon: ScratchResistantIcon,
          title: "Scratch & Stain Resistant",
          description: "Premium acrylic surface maintains its pristine appearance for years."
        },
        {
          icon: WaterproofIcon,
          title: "IPX5 Waterproof Shield",
          description: "Advanced waterproofing technology for ultimate protection and durability."
        },
        {
          icon: HeatRetentionIcon,
          title: "Superior Heat Retention",
          description: "Efficient insulation keeps your bath water warm longer for extended relaxation."
        },
        {
          icon: ErgonomicIcon,
          title: "Ergonomic Comfort",
          description: "Thoughtfully contoured design supports your body for maximum comfort."
        }
      ]}
      stats={[
        { value: "2hr+", label: "Heat Retention" },
        { value: "IPX5", label: "Water Rating" },
        { value: "15+", label: "Style Options" },
        { value: "100%", label: "Relaxation" }
      ]}
      benefitsTitle="Your Personal Spa Retreat"
      benefitsDescription="Transform your daily routine into a luxurious escape. Our bathtubs are designed to deliver spa-like relaxation in the comfort of your own home."
      benefits={[
        "Available in freestanding, drop-in, and corner designs",
        "Premium acrylic for lightweight yet durable construction",
        "Variety of shapes: oval, rectangular, and contemporary",
        "Easy-clean surfaces resist stains and buildup",
        "Optional hydrotherapy jets for massage experience",
        "Multiple sizes to fit any bathroom layout"
      ]}
      categoryId={48}
      productsTitle="Bathtub Collection"
      ctaTitle="Create Your Home Spa"
      ctaDescription="Every bath should be an experience. Explore our range of stunning bathtubs and transform your bathroom into a personal retreat."
      ctaButtonText="Explore Bathtubs"
    />
  );
}
