import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Single Piece Toilets | Seamless Design | Bella Bathwares',
  description: 'Discover our elegant single piece toilets with seamless design, soft close seats, and silent flush technology. Perfect blend of form and function.',
  keywords: 'single piece toilet, one piece toilet, siphonic toilet, seamless toilet, modern toilet, soft close toilet',
};

// Feature icons
const SeamlessIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const SoftCloseIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const QuickFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SilentFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

export default function SiphonicWCPage() {
  return (
    <CategoryShowcase
      configKey="siphonicWC"
      heroTitle="Single Piece Toilets"
      heroSubtitle="Seamless Elegance, Superior Function"
      heroDescription="Experience the beauty of unified design with our single piece toilets. The integrated tank and bowl create a sleek silhouette that's both stunning and incredibly easy to maintain."
      heroImage="https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=1600&q=80"
      heroImageAlt="Elegant single piece toilet in modern bathroom"
      features={[
        {
          icon: SeamlessIcon,
          title: "Seamless One-Piece Design",
          description: "Integrated tank and bowl eliminate crevices where dirt can hide."
        },
        {
          icon: SoftCloseIcon,
          title: "Soft Close Seat",
          description: "Quiet, cushioned closing motion protects the seat and prevents slamming."
        },
        {
          icon: QuickFlushIcon,
          title: "Quick Flush System",
          description: "Powerful siphonic action delivers quick, thorough cleaning every time."
        },
        {
          icon: SilentFlushIcon,
          title: "Silent Operation",
          description: "Quiet and discreet flushing system for peaceful bathroom moments."
        }
      ]}
      stats={[
        { value: "1", label: "Piece Design" },
        { value: "3.5L", label: "Per Flush" },
        { value: "Easy", label: "Cleaning" },
        { value: "10+", label: "Year Warranty" }
      ]}
      benefitsTitle="Simplicity Perfected"
      benefitsDescription="Traditional multi-piece toilets can be cumbersome and difficult to clean. Our single piece design eliminates the hassle while elevating your bathroom's aesthetic."
      benefits={[
        "No gaps between tank and bowl to trap dirt",
        "Easier installation than two-piece models",
        "Modern aesthetics with various style options",
        "Powerful siphonic flushing technology",
        "Premium ceramic with lasting durability",
        "Available in multiple finishes to match your decor"
      ]}
      categoryId={61}
      productsTitle="Single Piece Toilet Collection"
      ctaTitle="Simplify Your Bathroom"
      ctaDescription="Upgrade to the elegance of one-piece design. Our single piece toilets combine beauty with effortless maintenance."
      ctaButtonText="Shop Single Piece Toilets"
    />
  );
}
