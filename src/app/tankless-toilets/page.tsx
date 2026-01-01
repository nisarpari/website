import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Tankless Toilets | Smart & Sleek Design | Bella Bathwares',
  description: 'Explore our innovative tankless toilets with auto-flush technology, sleek design, and water efficiency. The future of bathroom fixtures is here.',
  keywords: 'tankless toilet, smart toilet, auto flush toilet, modern toilet, water efficient toilet, bathroom technology',
};

// Feature icons
const AutoFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const PowerFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const BatteryLifeIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2h2m4-4v4m4-4v4m-8 8v4m8-4v4M5 8h14l1 8H4l1-8z" />
  </svg>
);

const SleekDesignIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

export default function TanklessToiletsPage() {
  return (
    <CategoryShowcase
      heroTitle="Tankless Toilets"
      heroSubtitle="The Future of Bathroom Technology"
      heroDescription="Experience the next generation of toilet design. Our tankless toilets combine cutting-edge auto-flush technology with sleek, space-saving aesthetics for the ultimate modern bathroom."
      heroImage="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1600&q=80"
      heroImageAlt="Modern tankless toilet in luxury bathroom"
      features={[
        {
          icon: AutoFlushIcon,
          title: "Smart Auto Flush",
          description: "Automatic flushing 45 seconds after use ensures perfect hygiene every time."
        },
        {
          icon: PowerFlushIcon,
          title: "Power Flush System",
          description: "Battery-powered push button delivers efficient, reliable flushing performance."
        },
        {
          icon: BatteryLifeIcon,
          title: "Extended Battery Life",
          description: "Long-lasting battery means months of use without needing replacement."
        },
        {
          icon: SleekDesignIcon,
          title: "Ultra-Sleek Profile",
          description: "No bulky tank means a streamlined look that maximizes bathroom space."
        }
      ]}
      stats={[
        { value: "45s", label: "Auto Flush Timer" },
        { value: "50%", label: "Space Saved" },
        { value: "12+", label: "Month Battery" },
        { value: "100%", label: "Hands-Free" }
      ]}
      benefitsTitle="Innovation Meets Elegance"
      benefitsDescription="Tankless toilets represent the pinnacle of bathroom innovation. Say goodbye to bulky tanks and hello to sleek, efficient design that transforms any bathroom."
      benefits={[
        "Auto flush for touchless, hygienic operation",
        "Integrated jet nozzle for thorough bowl cleaning",
        "Anti-backflow protection for safety",
        "Minimal electrical consumption",
        "Perfect for modern, minimalist bathrooms",
        "Easy installation without tank plumbing"
      ]}
      categoryId={201}
      productsTitle="Tankless Toilet Collection"
      ctaTitle="Step Into the Future"
      ctaDescription="Upgrade to a smarter, sleeker bathroom experience. Our tankless toilets bring tomorrow's technology to your home today."
      ctaButtonText="Shop Tankless Toilets"
    />
  );
}
