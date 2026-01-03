// Convert all static images in public folder to WebP format
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

interface ConversionResult {
  file: string;
  originalSize: number;
  newSize: number;
  savings: number;
  savingsPercent: number;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Directories and files to process
const TARGETS = [
  'images/categories',
  'images/hero',
  'images/uploads',
  'placeholder-product.jpg',
  'bella_logo.png',
  'bella_logo_white.png',
];

// Skip these (already converted or not needed)
const SKIP_PATTERNS = [
  /hero-images\/.*\.jpg$/,  // Old hero images (already have webp versions)
  /\.webp$/,                // Already webp
];

async function findImages(targetPath: string): Promise<string[]> {
  const fullPath = path.join(PUBLIC_DIR, targetPath);
  const images: string[] = [];

  if (!fs.existsSync(fullPath)) {
    console.log(`Path does not exist: ${fullPath}`);
    return images;
  }

  const stat = fs.statSync(fullPath);

  if (stat.isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      images.push(fullPath);
    }
  } else if (stat.isDirectory()) {
    const files = fs.readdirSync(fullPath, { recursive: true }) as string[];
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      if (fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          images.push(filePath);
        }
      }
    }
  }

  return images;
}

async function convertToWebP(imagePath: string): Promise<ConversionResult | null> {
  // Check skip patterns
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(imagePath)) {
      console.log(`Skipping: ${imagePath}`);
      return null;
    }
  }

  const originalSize = fs.statSync(imagePath).size;
  const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  // Skip if webp already exists
  if (fs.existsSync(webpPath)) {
    console.log(`WebP already exists: ${webpPath}`);
    return null;
  }

  try {
    const isPng = imagePath.toLowerCase().endsWith('.png');

    // For PNG, preserve transparency
    const sharpInstance = sharp(imagePath);

    if (isPng) {
      await sharpInstance
        .webp({ quality: 85, lossless: false })
        .toFile(webpPath);
    } else {
      await sharpInstance
        .webp({ quality: 85 })
        .toFile(webpPath);
    }

    const newSize = fs.statSync(webpPath).size;
    const savings = originalSize - newSize;
    const savingsPercent = (savings / originalSize) * 100;

    console.log(`Converted: ${path.basename(imagePath)}`);
    console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB -> WebP: ${(newSize / 1024).toFixed(1)}KB`);
    console.log(`  Savings: ${(savings / 1024).toFixed(1)}KB (${savingsPercent.toFixed(1)}%)`);

    return {
      file: imagePath,
      originalSize,
      newSize,
      savings,
      savingsPercent,
    };
  } catch (error) {
    console.error(`Failed to convert ${imagePath}:`, error);
    return null;
  }
}

async function main() {
  console.log('Converting static images to WebP...\n');

  const allImages: string[] = [];

  for (const target of TARGETS) {
    const images = await findImages(target);
    allImages.push(...images);
  }

  console.log(`Found ${allImages.length} images to process\n`);

  const results: ConversionResult[] = [];

  for (const image of allImages) {
    const result = await convertToWebP(image);
    if (result) {
      results.push(result);
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Converted: ${results.length} images`);

  if (results.length > 0) {
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    const totalSavings = totalOriginal - totalNew;

    console.log(`Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total new size: ${(totalNew / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)}MB (${((totalSavings / totalOriginal) * 100).toFixed(1)}%)`);
  }

  console.log('\nDone! Now update code references to use .webp files.');
}

main().catch(console.error);
