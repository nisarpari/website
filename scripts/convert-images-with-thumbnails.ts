#!/usr/bin/env npx ts-node
/**
 * Convert Odoo product images to WebP format WITH thumbnail generation
 *
 * This script:
 * 1. Fetches product templates from staging Odoo
 * 2. Downloads each product's main image
 * 3. Converts to WebP format
 * 4. Generates all thumbnail sizes (1024, 512, 256, 128)
 * 5. Updates ALL image fields in Odoo
 *
 * Usage: npx ts-node scripts/convert-images-with-thumbnails.ts [--dry-run] [--limit=N] [--product-id=ID] [--category=ID]
 */

import sharp from 'sharp';

// Staging Odoo configuration
const STAGING_CONFIG = {
  baseUrl: 'https://bellagcc-staging-27058774.dev.odoo.com',
  database: 'bellagcc-staging-27058774',
  apiKey: process.env.ODOO_STAGING_API_KEY || process.env.ODOO_API_KEY || '',
};

interface Product {
  id: number;
  name: string;
  image_1920?: string;
}

interface ImageSizes {
  image_1920: string;
  image_1024: string;
  image_512: string;
  image_256: string;
  image_128: string;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    limit: 0,
    productId: 0,
    categoryId: 0,
  };

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    }
    if (arg.startsWith('--product-id=')) {
      options.productId = parseInt(arg.split('=')[1], 10);
    }
    if (arg.startsWith('--category=')) {
      options.categoryId = parseInt(arg.split('=')[1], 10);
    }
  }

  return options;
}

// Odoo JSON-2 API call (Odoo 19+)
async function odooApiCall<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const url = `${STAGING_CONFIG.baseUrl}/json/2/${model}/${method}`;

  const body: Record<string, unknown> = {};

  if (args.length > 0 && Array.isArray(args[0])) {
    body.domain = args[0];
  }

  if (args.length > 0 && (typeof args[0] === 'number' || (Array.isArray(args[0]) && typeof args[0][0] === 'number' && !Array.isArray(args[0][0])))) {
    body.ids = Array.isArray(args[0]) ? args[0] : [args[0]];
  }

  if (args.length > 1 && typeof args[1] === 'object' && !Array.isArray(args[1])) {
    body.values = args[1];
  }

  for (const [key, value] of Object.entries(kwargs)) {
    body[key] = value;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STAGING_CONFIG.apiKey}`,
  };

  if (STAGING_CONFIG.database) {
    headers['X-Odoo-Database'] = STAGING_CONFIG.database;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Odoo API error (${response.status}): ${errorText}`);
  }

  return await response.json() as T;
}

// Convert base64 image to WebP at specified size
async function convertToWebP(base64Image: string, maxSize?: number): Promise<string> {
  const imageBuffer = Buffer.from(base64Image, 'base64');

  let pipeline = sharp(imageBuffer);

  if (maxSize) {
    pipeline = pipeline.resize(maxSize, maxSize, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  const webpBuffer = await pipeline
    .webp({
      quality: 85,
      effort: 4,
      lossless: false,
    })
    .toBuffer();

  return webpBuffer.toString('base64');
}

// Generate all image sizes
async function generateAllSizes(base64Image: string): Promise<ImageSizes> {
  const [image_1920, image_1024, image_512, image_256, image_128] = await Promise.all([
    convertToWebP(base64Image, 1920),
    convertToWebP(base64Image, 1024),
    convertToWebP(base64Image, 512),
    convertToWebP(base64Image, 256),
    convertToWebP(base64Image, 128),
  ]);

  return { image_1920, image_1024, image_512, image_256, image_128 };
}

// Check if image is already WebP
function isWebP(base64Image: string): boolean {
  const buffer = Buffer.from(base64Image, 'base64');
  return buffer.length > 12 &&
         buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
         buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
}

// Get image format
function getImageFormat(base64Image: string): string {
  const buffer = Buffer.from(base64Image, 'base64');
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'JPEG';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'PNG';
  if (isWebP(base64Image)) return 'WebP';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'GIF';
  return 'Unknown';
}

// Update all product image sizes in Odoo
async function updateProductImages(productId: number, sizes: ImageSizes): Promise<boolean> {
  try {
    await odooApiCall(
      'product.template',
      'write',
      [[productId], sizes]
    );
    return true;
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error);
    return false;
  }
}

// Main function
async function main() {
  const options = parseArgs();

  console.log('🖼️  Odoo Image to WebP Converter (with thumbnails)');
  console.log('==================================================');
  console.log(`Staging URL: ${STAGING_CONFIG.baseUrl}`);
  console.log(`Dry run: ${options.dryRun}`);
  if (options.limit) console.log(`Limit: ${options.limit}`);
  if (options.productId) console.log(`Product ID: ${options.productId}`);
  if (options.categoryId) console.log(`Category ID: ${options.categoryId}`);
  console.log('');

  if (!STAGING_CONFIG.apiKey) {
    console.error('❌ Error: ODOO_STAGING_API_KEY or ODOO_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Build search domain
    const domain: unknown[][] = [['is_published', '=', true]];
    if (options.productId) {
      domain.push(['id', '=', options.productId]);
    }
    if (options.categoryId) {
      domain.push(['public_categ_ids', 'in', [options.categoryId]]);
    }

    console.log('📋 Fetching product list...');
    const productIds = await odooApiCall<number[]>(
      'product.template',
      'search',
      [domain],
      { limit: options.limit || 0, order: 'id asc' }
    );

    console.log(`Found ${productIds.length} published products\n`);

    let converted = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];

      const products = await odooApiCall<Product[]>(
        'product.template',
        'read',
        [[productId]],
        { fields: ['id', 'name', 'image_1920'] }
      );

      if (!products.length) {
        console.log(`⚠️  Product ${productId} not found`);
        continue;
      }

      const product = products[0];
      const progress = `[${i + 1}/${productIds.length}]`;

      if (!product.image_1920) {
        console.log(`${progress} ⏭️  ${product.name} (ID: ${product.id}) - No image`);
        skipped++;
        continue;
      }

      const format = getImageFormat(product.image_1920);
      const originalSize = Math.round(Buffer.from(product.image_1920, 'base64').length / 1024);

      if (isWebP(product.image_1920)) {
        console.log(`${progress} ✅ ${product.name} (ID: ${product.id}) - Already WebP (${originalSize}KB)`);
        skipped++;
        continue;
      }

      console.log(`${progress} 🔄 ${product.name} (ID: ${product.id}) - Converting ${format} (${originalSize}KB)...`);

      try {
        const sizes = await generateAllSizes(product.image_1920);

        const size1920 = Math.round(Buffer.from(sizes.image_1920, 'base64').length / 1024);
        const size512 = Math.round(Buffer.from(sizes.image_512, 'base64').length / 1024);
        const size128 = Math.round(Buffer.from(sizes.image_128, 'base64').length / 1024);
        const savings = Math.round((1 - size1920 / originalSize) * 100);

        if (options.dryRun) {
          console.log(`   📊 Would convert: ${originalSize}KB → ${size1920}KB (${savings}% smaller)`);
          console.log(`   📊 Thumbnails: 512=${size512}KB, 128=${size128}KB`);
        } else {
          const success = await updateProductImages(product.id, sizes);
          if (success) {
            console.log(`   ✅ Converted: ${originalSize}KB → ${size1920}KB (${savings}% smaller)`);
            console.log(`   📐 Thumbnails: 1024, 512=${size512}KB, 256, 128=${size128}KB`);
            converted++;
          } else {
            console.log(`   ❌ Failed to update in Odoo`);
            failed++;
          }
        }
      } catch (error) {
        console.log(`   ❌ Conversion error: ${error instanceof Error ? error.message : error}`);
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n==================================================');
    console.log('📊 Summary:');
    console.log(`   Converted: ${converted}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${productIds.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
