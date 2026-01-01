import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Concealed Cisterns | Premium In-Wall Flushing Systems | Bella Bathwares',
  description: 'Discover our premium concealed cisterns - space-saving in-wall flushing systems with dual flush technology, quiet operation, and modern design. Perfect for contemporary bathrooms.',
  keywords: 'concealed cisterns, in-wall cistern, hidden cistern, dual flush, space saving toilet, modern bathroom',
};

// Feature icons as SVG components
const DualFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const DurabilityIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const RustProtectionIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const QuietOperationIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

export default function ConcealedCisternsPage() {
  return (
    <CategoryShowcase
      heroTitle="Concealed Cisterns"
      heroSubtitle="Premium In-Wall Flushing Systems"
      heroDescription="Transform your bathroom with our sleek concealed cisterns. Space-saving design meets advanced water efficiency for a clean, modern look that maximizes your bathroom space."
      heroImage="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80"
      heroImageAlt="Modern bathroom with concealed cistern"
      features={[
        {
          icon: DualFlushIcon,
          title: "Dual Flush Technology",
          description: "Choose between full and half flush options to conserve water without compromising performance."
        },
        {
          icon: DurabilityIcon,
          title: "200,000+ Flush Cycles",
          description: "Engineered for exceptional durability with components rated for over 200,000 flush cycles."
        },
        {
          icon: RustProtectionIcon,
          title: "Galvanized Protection",
          description: "Premium galvanized coating ensures long-lasting rust prevention and durability."
        },
        {
          icon: QuietOperationIcon,
          title: "Whisper-Quiet Operation",
          description: "Advanced noise reduction technology for a peaceful, serene bathroom environment."
        }
      ]}
      stats={[
        { value: "200,000+", label: "Flush Cycle Rating" },
        { value: "50%", label: "Water Savings" },
        { value: "15+", label: "Year Warranty" },
        { value: "99%", label: "Customer Satisfaction" }
      ]}
      benefitsTitle="Maximize Space with In-Wall Design"
      benefitsDescription="Our concealed cisterns hide the tank behind the wall, creating a streamlined look that opens up your bathroom. Perfect for modern renovations and compact spaces."
      benefits={[
        "Clean, minimalist aesthetic with hidden components",
        "Easy access flush plates in multiple finishes",
        "Compatible with wall-hung and floor-standing toilets",
        "Water-efficient dual flush reduces utility bills",
        "Simple installation with adjustable frame heights",
        "Premium flush plates available in gold, chrome, black, and more"
      ]}
      categoryId={264}
      productsTitle="Our Concealed Cistern Collection"
      ctaTitle="Ready to Upgrade Your Bathroom?"
      ctaDescription="Explore our complete range of concealed cisterns and matching flush plates. Expert installation support available."
      ctaButtonText="Shop Concealed Cisterns"
    />
  );
}
