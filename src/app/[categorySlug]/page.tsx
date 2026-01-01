// Dynamic route for category landing pages with clean URLs
// e.g., /concealed-cisterns, /wall-hung-toilets, /freestanding-bathtubs
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import CategoryLandingPageClient from './CategoryLandingPageClient';

// Force dynamic rendering - required for headers() and dynamic category lookup
export const dynamic = 'force-dynamic';

// Get the base URL dynamically from headers (works on Vercel)
async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

// Fetch categories to find by slug
async function getCategoryBySlug(slug: string) {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/public-categories`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) return null;

    const categories = await response.json();

    // Find category by slug (case-insensitive)
    const category = categories.find((c: { slug: string }) =>
      c.slug.toLowerCase() === slug.toLowerCase()
    );

    return category || null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

// Reserved paths that should NOT be handled by this route
const RESERVED_PATHS = [
  'shop',
  'cart',
  'checkout',
  'wishlist',
  'product',
  'category',
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'account',
  'orders',
  'contact',
  'about',
  'faq',
  'privacy',
  'terms',
  'search',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml'
];

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  // Skip reserved paths
  if (RESERVED_PATHS.includes(categorySlug.toLowerCase())) {
    return {};
  }

  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: 'Category Not Found | Bella Bathwares'
    };
  }

  return {
    title: `${category.name} | Bella Bathwares`,
    description: `Browse our collection of ${category.name.toLowerCase()}. Premium bathroom products and fixtures.`
  };
}

export default async function CategorySlugPage({ params }: PageProps) {
  const { categorySlug } = await params;

  // Skip reserved paths - let Next.js handle 404
  if (RESERVED_PATHS.includes(categorySlug.toLowerCase())) {
    notFound();
  }

  // Try to find category by slug
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Render the category landing page with the found category ID
  return <CategoryLandingPageClient categoryId={category.id} />;
}
