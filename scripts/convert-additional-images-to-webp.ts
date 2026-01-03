#!/usr/bin/env npx ts-node
/**
 * Convert Odoo additional product images to WebP format
 *
 * This script handles the product.image model which stores additional product images
 *
 * Usage: npx ts-node scripts/convert-additional-images-to-webp.ts [--dry-run] [--limit=N]
 */

import sharp from 'sharp';

// Staging Odoo configuration
const STAGING_CONFIG = {
  baseUrl: 'https://bellagcc-staging-27058774.dev.odoo.com',
  database: 'bellagcc-staging-27058774',
  apiKey: process.env.ODOO_STAGING_API_KEY || process.env.ODOO_API_KEY || '',
};

interface ProductImage {
  id: number;
  name: string;
  image_1920?: string;
  product_tmpl_id?: [number, string];
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    limit: parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10),
  };
}

// Odoo JSON-RPC API call
async function odooApiCall<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const url = `${STAGING_CONFIG.baseUrl}/jsonrpc`;

  const body = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        STAGING_CONFIG.database,
        2,
        STAGING_CONFIG.apiKey,
        model,
        method,
        args,
        kwargs
      ]
    },
    id: Date.now()
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || JSON.stringify(data.error));
  }

  return data.result !== undefined ? data.result : data;
}

// Convert base64 image to WebP
async function convertToWebP(base64Image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Image, 'base64');
  const webpBuffer = await sharp(imageBuffer)
    .webp({ quality: 85, effort: 4, lossless: false })
    .toBuffer();
  return webpBuffer.toString('base64');
}

// Check if image is already WebP
function isWebP(base64Image: string): boolean {
  const buffer = Buffer.from(base64Image, 'base64');
  return buffer.length > 12 &&
         buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
         buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
}

function getImageFormat(base64Image: string): string {
  const buffer = Buffer.from(base64Image, 'base64');
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'JPEG';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'PNG';
  if (isWebP(base64Image)) return 'WebP';
  return 'Unknown';
}

async function main() {
  const options = parseArgs();

  console.log('🖼️  Odoo Additional Images to WebP Converter');
  console.log('=============================================');
  console.log(`Staging URL: ${STAGING_CONFIG.baseUrl}`);
  console.log(`Dry run: ${options.dryRun}`);
  if (options.limit) console.log(`Limit: ${options.limit}`);
  console.log('');

  if (!STAGING_CONFIG.apiKey) {
    console.error('❌ Error: ODOO_STAGING_API_KEY or ODOO_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Get all additional product images
    console.log('📋 Fetching additional product images...');
    const imageIds = await odooApiCall<number[]>(
      'product.image',
      'search',
      [[]],
      { limit: options.limit || 0, order: 'id asc' }
    );

    console.log(`Found ${imageIds.length} additional images\n`);

    let converted = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < imageIds.length; i++) {
      const imageId = imageIds[i];

      const images = await odooApiCall<ProductImage[]>(
        'product.image',
        'read',
        [[imageId]],
        { fields: ['id', 'name', 'image_1920', 'product_tmpl_id'] }
      );

      if (!images.length) continue;

      const image = images[0];
      const progress = `[${i + 1}/${imageIds.length}]`;
      const productName = image.product_tmpl_id ? image.product_tmpl_id[1] : 'Unknown';

      if (!image.image_1920) {
        console.log(`${progress} ⏭️  ${image.name} (${productName}) - No image`);
        skipped++;
        continue;
      }

      const format = getImageFormat(image.image_1920);
      const originalSize = Math.round(Buffer.from(image.image_1920, 'base64').length / 1024);

      if (isWebP(image.image_1920)) {
        console.log(`${progress} ✅ ${image.name} - Already WebP (${originalSize}KB)`);
        skipped++;
        continue;
      }

      console.log(`${progress} 🔄 ${image.name} (${productName}) - Converting ${format} (${originalSize}KB)...`);

      try {
        const webpBase64 = await convertToWebP(image.image_1920);
        const newSize = Math.round(Buffer.from(webpBase64, 'base64').length / 1024);
        const savings = Math.round((1 - newSize / originalSize) * 100);

        if (options.dryRun) {
          console.log(`   📊 Would convert: ${originalSize}KB → ${newSize}KB (${savings}% smaller)`);
        } else {
          await odooApiCall('product.image', 'write', [[image.id], { image_1920: webpBase64 }]);
          console.log(`   ✅ Converted: ${originalSize}KB → ${newSize}KB (${savings}% smaller)`);
          converted++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n=============================================');
    console.log('📊 Summary:');
    console.log(`   Converted: ${converted}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${imageIds.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
