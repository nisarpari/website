#!/usr/bin/env node

/**
 * Batch Background Removal Script for Bella Bathwares
 *
 * This script fetches all published product images from Odoo,
 * removes white backgrounds using Photoroom API,
 * and updates the images back in Odoo.
 *
 * Usage:
 *   1. Get your Photoroom API key from https://www.photoroom.com/api
 *   2. Run: PHOTOROOM_API_KEY=your_key node scripts/remove-backgrounds.js
 *
 * Options:
 *   --dry-run    Only fetch and process, don't update Odoo
 *   --limit=N    Only process first N products
 *   --test       Process only 3 products for testing
 */

const fs = require('fs');
const path = require('path');

// Load .env file from project root
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Configuration
const CONFIG = {
  odooUrl: process.env.ODOO_URL || 'https://bellagcc-production-13616817.dev.odoo.com',
  odooDatabase: process.env.ODOO_DATABASE || 'bellagcc-production-13616817',
  odooApiKey: process.env.ODOO_API_KEY || '',
  photoroomApiKey: process.env.PHOTOROOM_API_KEY || '',

  // Processing options
  concurrency: 3, // Process 3 images at a time
  retryAttempts: 3,
  retryDelay: 1000,
};

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const TEST_MODE = args.includes('--test');
const LIMIT = TEST_MODE ? 3 : (args.find(a => a.startsWith('--limit='))?.split('=')[1] || 0);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Odoo JSON-RPC API call
async function odooApiCall(model, method, args = [], kwargs = {}) {
  const url = `${CONFIG.odooUrl}/jsonrpc`;

  const body = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        CONFIG.odooDatabase,
        2, // User ID
        CONFIG.odooApiKey,
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

  return data.result;
}

// Fetch all published products with images
async function fetchProducts() {
  log('\nFetching products from Odoo...', 'blue');

  const searchArgs = [[['is_published', '=', true]]];
  const kwargs = {
    fields: ['id', 'name', 'image_1920'],
    order: 'id asc'
  };

  if (LIMIT > 0) {
    kwargs.limit = parseInt(LIMIT);
  }

  const products = await odooApiCall('product.template', 'search_read', searchArgs, kwargs);

  // Filter products that have images
  const productsWithImages = products.filter(p => p.image_1920);

  log(`Found ${products.length} published products, ${productsWithImages.length} have images`, 'green');

  return productsWithImages;
}

// Download image from Odoo (base64) and convert to buffer
function base64ToBuffer(base64String) {
  return Buffer.from(base64String, 'base64');
}

// Remove background using Photoroom API
async function removeBackground(imageBuffer, productName) {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: 'image/png' });
  formData.append('image_file', blob, 'image.png');
  formData.append('format', 'png');
  formData.append('channels', 'rgba'); // Returns image with alpha channel (transparency)

  const response = await fetch('https://sdk.photoroom.com/v1/segment', {
    method: 'POST',
    headers: {
      'x-api-key': CONFIG.photoroomApiKey,
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Photoroom API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Update product image in Odoo
async function updateProductImage(productId, imageBuffer) {
  const base64Image = imageBuffer.toString('base64');

  await odooApiCall('product.template', 'write', [
    [productId],
    { image_1920: base64Image }
  ]);
}

// Process a single product
async function processProduct(product, index, total) {
  const { id, name, image_1920 } = product;

  try {
    log(`\n[${index + 1}/${total}] Processing: ${name} (ID: ${id})`, 'cyan');

    // Convert base64 to buffer
    const imageBuffer = base64ToBuffer(image_1920);
    log(`  - Original image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`, 'reset');

    // Remove background
    log('  - Removing background...', 'yellow');
    const processedBuffer = await removeBackground(imageBuffer, name);
    log(`  - Processed image size: ${(processedBuffer.length / 1024).toFixed(1)} KB`, 'reset');

    // Update in Odoo (unless dry run)
    if (!DRY_RUN) {
      log('  - Updating in Odoo...', 'yellow');
      await updateProductImage(id, processedBuffer);
      log('  - Updated successfully!', 'green');
    } else {
      log('  - [DRY RUN] Would update in Odoo', 'yellow');
    }

    return { success: true, id, name };
  } catch (error) {
    log(`  - ERROR: ${error.message}`, 'red');
    return { success: false, id, name, error: error.message };
  }
}

// Process products with concurrency control
async function processInBatches(products, batchSize) {
  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((product, idx) => processProduct(product, i + idx, products.length))
    );

    batchResults.forEach(result => {
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

// Main function
async function main() {
  log('\n========================================', 'cyan');
  log('  Bella Bathwares Background Remover', 'cyan');
  log('========================================\n', 'cyan');

  // Validate configuration
  if (!CONFIG.odooApiKey) {
    log('ERROR: ODOO_API_KEY environment variable is required', 'red');
    log('Set it in your .env file or run with: ODOO_API_KEY=your_key node scripts/remove-backgrounds.js', 'yellow');
    process.exit(1);
  }

  if (!CONFIG.photoroomApiKey) {
    log('ERROR: PHOTOROOM_API_KEY environment variable is required', 'red');
    log('Get your API key from: https://www.photoroom.com/api', 'yellow');
    log('Then run with: PHOTOROOM_API_KEY=your_key node scripts/remove-backgrounds.js', 'yellow');
    process.exit(1);
  }

  log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will update Odoo)'}`, DRY_RUN ? 'yellow' : 'green');
  if (LIMIT > 0) {
    log(`Limit: Processing first ${LIMIT} products`, 'yellow');
  }
  if (TEST_MODE) {
    log('TEST MODE: Only processing 3 products', 'yellow');
  }

  try {
    // Fetch products
    const products = await fetchProducts();

    if (products.length === 0) {
      log('\nNo products with images found.', 'yellow');
      return;
    }

    // Confirm before proceeding
    log(`\nReady to process ${products.length} products.`, 'blue');
    log(`Estimated cost: ~$${(products.length * 0.02).toFixed(2)} (at $0.02/image)`, 'yellow');

    if (!TEST_MODE && !DRY_RUN) {
      log('\nPress Ctrl+C within 5 seconds to cancel...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Process products
    log('\nStarting batch processing...', 'blue');
    const startTime = Date.now();

    const results = await processInBatches(products, CONFIG.concurrency);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Summary
    log('\n========================================', 'cyan');
    log('  Processing Complete!', 'cyan');
    log('========================================', 'cyan');
    log(`\nTime elapsed: ${elapsed}s`, 'reset');
    log(`Successful: ${results.success.length}`, 'green');
    log(`Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');

    if (results.failed.length > 0) {
      log('\nFailed products:', 'red');
      results.failed.forEach(f => {
        log(`  - ${f.name} (ID: ${f.id}): ${f.error}`, 'red');
      });
    }

    // Save results to file
    const resultsFile = path.join(__dirname, 'bg-removal-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      dryRun: DRY_RUN,
      totalProcessed: products.length,
      successful: results.success.length,
      failed: results.failed.length,
      failedProducts: results.failed
    }, null, 2));
    log(`\nResults saved to: ${resultsFile}`, 'blue');

  } catch (error) {
    log(`\nFatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run
main();
