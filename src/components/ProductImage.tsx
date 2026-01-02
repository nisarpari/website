'use client';

import { useState } from 'react';
import Image from 'next/image';

const PLACEHOLDER_IMAGE = '/placeholder-product.jpg';

// Odoo image domains that have auth/CORS issues with Next.js optimization
const UNOPTIMIZED_DOMAINS = [
  'bellagcc-production-13616817.dev.odoo.com',
  'erp.bellastore.in',
  '.odoo.com', // Catch all Odoo domains
];

// Check if image URL should skip optimization (external Odoo images)
function shouldSkipOptimization(src: string): boolean {
  if (!src || src.startsWith('/')) return false; // Local images are optimized
  try {
    const url = new URL(src);
    return UNOPTIMIZED_DOMAINS.some(domain => url.hostname.includes(domain));
  } catch {
    return false;
  }
}

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Product Image wrapper with:
 * - Fallback to placeholder on error
 * - Skip optimization for external Odoo images (auth/CORS issues)
 * - Full Next.js optimization for local images
 */
export function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = '',
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const imageSrc = error || !src ? PLACEHOLDER_IMAGE : src;
  const skipOptimization = shouldSkipOptimization(imageSrc);

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        unoptimized={skipOptimization}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={skipOptimization}
      onError={() => setError(true)}
    />
  );
}
