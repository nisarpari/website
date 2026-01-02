import { Metadata } from 'next';
import { CategoryShowcase } from '@/components/CategoryShowcase';

export const metadata: Metadata = {
  title: 'Wall Hung Toilets | Modern Space-Saving Design | Bella Bathwares',
  description: 'Discover our premium wall hung toilets featuring tornado flush technology, soft close seats, and contemporary design. Perfect for modern bathrooms seeking elegance and efficiency.',
  keywords: 'wall hung toilet, wall mounted toilet, floating toilet, modern toilet, tornado flush, soft close toilet',
};

// Feature icons
const TornadoFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SoftCloseIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const SilentFlushIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

const CleanDesignIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default function WallHungToiletsPage() {
  return (
    <CategoryShowcase
      configKey="wallHungToilets"
      heroTitle="Wall Hung Toilets"
      heroSubtitle="Contemporary Space-Maximizing Design"
      heroDescription="Elevate your bathroom with our stunning wall hung toilets. Floating elegance meets powerful performance, creating the perfect blend of style and functionality for modern living."
      heroImage="https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=1600&q=80"
      heroImageAlt="Modern wall hung toilet in contemporary bathroom"
      features={[
        {
          icon: TornadoFlushIcon,
          title: "Tornado Flush Technology",
          description: "Powerful swirling action cleans the entire bowl with less water for superior hygiene."
        },
        {
          icon: SoftCloseIcon,
          title: "Soft Close Mechanism",
          description: "Gentle, quiet seat closure prevents slamming and extends seat life."
        },
        {
          icon: SilentFlushIcon,
          title: "Silent Flush System",
          description: "Advanced acoustic engineering for whisper-quiet operation day and night."
        },
        {
          icon: CleanDesignIcon,
          title: "Easy Clean Design",
          description: "Rimless bowl and wall-mounted design make cleaning effortless."
        }
      ]}
      stats={[
        { value: "4.5L", label: "Per Flush" },
        { value: "360°", label: "Tornado Clean" },
        { value: "40%", label: "Space Saved" },
        { value: "25+", label: "Design Awards" }
      ]}
      benefitsTitle="Float Above the Ordinary"
      benefitsDescription="Wall hung toilets create an illusion of space and make floor cleaning a breeze. The concealed cistern and floating design bring a touch of luxury to any bathroom."
      benefits={[
        "Adjustable height installation for perfect comfort",
        "360° rimless bowl for thorough cleaning",
        "Concealed fixings for seamless appearance",
        "Dual flush system for water conservation",
        "Compatible with all our concealed cisterns",
        "Premium ceramic with anti-bacterial glaze"
      ]}
      categoryId={62}
      productsTitle="Wall Hung Toilet Collection"
      ctaTitle="Transform Your Bathroom Today"
      ctaDescription="Experience the perfect fusion of modern design and innovative technology. Our wall hung toilets redefine bathroom elegance."
      ctaButtonText="Explore Wall Hung Toilets"
      breadcrumbParent={{ name: "Basin & WC", href: "/washlet" }}
    />
  );
}
