'use client';

import { useState } from 'react';
import Image from 'next/image';

const PLACEHOLDER_IMAGE = '/placeholder.webp';

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

// Wrapper around Next.js Image with fallback handling
// Shows placeholder if Odoo image fails to load
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

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
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
      onError={() => setError(true)}
    />
  );
}
