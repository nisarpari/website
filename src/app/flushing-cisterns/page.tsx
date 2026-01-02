import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Flushing Cisterns | Exposed & Concealed Systems | Bella Bathwares',
  description: 'Explore our complete range of flushing cisterns including exposed and concealed options. Dual flush technology, water-efficient designs, and premium flush plates for modern bathrooms.',
  keywords: 'flushing cisterns, exposed cistern, concealed cistern, dual flush, toilet cistern, flush plates, bathroom cisterns',
};

// Feature icons as SVG components
const DualFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const WaterSavingIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DurabilityIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const VarietyIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

export default function FlushingCisternsPage() {
  return (
    <CategoryShowcase
      configKey="flushingCisterns"
      heroTitle="Flushing Cisterns"
      heroSubtitle="Complete Flushing Solutions"
      heroDescription="From sleek concealed systems to classic exposed designs, discover our comprehensive range of flushing cisterns. Premium quality, water-efficient technology, and stylish flush plates for every bathroom style."
      heroImage="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80"
      heroImageAlt="Modern bathroom with flushing cistern system"
      features={[
        {
          icon: DualFlushIcon,
          title: "Dual Flush Technology",
          description: "Choose between full and half flush options to conserve water without compromising performance."
        },
        {
          icon: WaterSavingIcon,
          title: "Water Efficient",
          description: "Engineered to minimize water usage while maintaining powerful, effective flushing performance."
        },
        {
          icon: DurabilityIcon,
          title: "Built to Last",
          description: "Premium materials and construction rated for over 200,000 flush cycles for years of reliable use."
        },
        {
          icon: VarietyIcon,
          title: "Wide Selection",
          description: "Choose from exposed, concealed, and semi-concealed options with matching flush plates in various finishes."
        }
      ]}
      stats={[
        { value: "200,000+", label: "Flush Cycle Rating" },
        { value: "50%", label: "Water Savings" },
        { value: "15+", label: "Year Warranty" },
        { value: "100+", label: "Design Options" }
      ]}
      benefitsTitle="The Perfect Flush for Every Bathroom"
      benefitsDescription="Whether you're renovating a modern space or updating a classic bathroom, our flushing cisterns offer the perfect balance of style, efficiency, and reliability."
      benefits={[
        "Exposed cisterns for traditional and vintage aesthetics",
        "Concealed in-wall systems for minimalist modern designs",
        "Premium flush plates in chrome, gold, black, and brushed finishes",
        "Water-efficient dual flush reduces utility bills",
        "Easy installation with comprehensive support",
        "Compatible with wall-hung and floor-standing toilets"
      ]}
      categoryId={63}
      productsTitle="Flushing Cistern Collection"
      ctaTitle="Find Your Perfect Flushing System"
      ctaDescription="Browse our complete range of cisterns and flush plates. Expert advice and installation support available."
      ctaButtonText="Shop Flushing Cisterns"
      breadcrumbParent={{ name: "Basin & WC", href: "/washlet" }}
    />
  );
}
