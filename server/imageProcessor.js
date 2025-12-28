const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Image size variants for responsive images
const IMAGE_VARIANTS = {
    // Mobile: max 640px width
    mobile: { width: 640, suffix: '-mobile' },
    // Tablet: max 1024px width
    tablet: { width: 1024, suffix: '-tablet' },
    // Desktop: max 1920px width (original quality)
    desktop: { width: 1920, suffix: '' }
};

// Quality settings (high quality compression)
const QUALITY_SETTINGS = {
    jpeg: { quality: 85, mozjpeg: true },
    png: { quality: 85, compressionLevel: 9 },
    webp: { quality: 85 }
};

/**
 * Process an uploaded image: compress and create responsive variants
 * @param {string} inputPath - Path to the uploaded file
 * @param {string} outputDir - Directory to save processed images
 * @param {string} baseFilename - Base filename without extension
 * @returns {Object} - Object with URLs for each variant
 */
async function processImage(inputPath, outputDir, baseFilename) {
    const results = {};

    try {
        // Get image metadata
        const metadata = await sharp(inputPath).metadata();
        const format = metadata.format || 'jpeg';
        const originalWidth = metadata.width || 1920;

        // Determine output format (keep original or convert to webp for better compression)
        const outputFormat = ['jpeg', 'jpg', 'png'].includes(format) ? format : 'jpeg';
        const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;

        // Process each variant
        for (const [variantName, settings] of Object.entries(IMAGE_VARIANTS)) {
            // Only create smaller variants, don't upscale
            if (settings.width >= originalWidth && variantName !== 'desktop') {
                continue;
            }

            const outputFilename = `${baseFilename}${settings.suffix}.${extension}`;
            const outputPath = path.join(outputDir, outputFilename);

            let pipeline = sharp(inputPath);

            // Resize if not desktop or if original is larger than desktop max
            if (variantName !== 'desktop' || originalWidth > settings.width) {
                pipeline = pipeline.resize(settings.width, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                });
            }

            // Apply format-specific compression
            if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
                pipeline = pipeline.jpeg(QUALITY_SETTINGS.jpeg);
            } else if (outputFormat === 'png') {
                pipeline = pipeline.png(QUALITY_SETTINGS.png);
            } else if (outputFormat === 'webp') {
                pipeline = pipeline.webp(QUALITY_SETTINGS.webp);
            }

            await pipeline.toFile(outputPath);

            results[variantName] = {
                filename: outputFilename,
                path: outputPath
            };
        }

        // Delete the original unprocessed file
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }

        return {
            success: true,
            variants: results,
            // Return desktop as the main image
            mainImage: results.desktop?.filename || results.tablet?.filename || results.mobile?.filename
        };

    } catch (error) {
        console.error('Image processing error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Middleware to process uploaded images
 * Replaces the original file with optimized versions
 */
async function processUploadedImage(req, res, next) {
    if (!req.file) {
        return next();
    }

    try {
        const inputPath = req.file.path;
        const outputDir = path.dirname(inputPath);

        // Generate a clean base filename
        const originalName = path.parse(req.file.filename).name;
        const timestamp = Date.now();
        const baseFilename = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9-_]/g, '')}`;

        const result = await processImage(inputPath, outputDir, baseFilename);

        if (result.success) {
            // Update req.file with the processed image info
            req.file.processedImages = result.variants;
            req.file.filename = result.mainImage;
            req.file.path = path.join(outputDir, result.mainImage);

            // Store variant URLs for the response
            req.processedVariants = {};
            for (const [variant, info] of Object.entries(result.variants)) {
                const folder = path.basename(outputDir);
                req.processedVariants[variant] = `/images/${folder}/${info.filename}`;
            }
        }

        next();
    } catch (error) {
        console.error('Image processing middleware error:', error);
        next(); // Continue even if processing fails
    }
}

/**
 * Get image info (dimensions, size) without processing
 */
async function getImageInfo(imagePath) {
    try {
        const metadata = await sharp(imagePath).metadata();
        const stats = fs.statSync(imagePath);

        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
        };
    } catch (error) {
        return null;
    }
}

module.exports = {
    processImage,
    processUploadedImage,
    getImageInfo,
    IMAGE_VARIANTS,
    QUALITY_SETTINGS
};
