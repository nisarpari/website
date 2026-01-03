/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose CF transform URL to client-side for image optimization
  env: {
    NEXT_PUBLIC_CF_IMAGE_TRANSFORM_URL: process.env.CF_IMAGE_TRANSFORM_URL || '',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "bellagcc-production-13616817.dev.odoo.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "me7aitdbxq.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "erp.bellastore.in",
      },
      {
        protocol: "https",
        hostname: "web.bellastore.in",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Add caching headers for static assets
  async headers() {
    return [
      {
        // Cache video files for 1 year (immutable)
        source: '/:path*.mp4',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images for 1 year
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache WebP images for 1 year
        source: '/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
