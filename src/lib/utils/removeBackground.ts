// Client-side white background removal utility
// Uses Canvas API to make white/near-white pixels transparent

export async function removeWhiteBackground(
  imageUrl: string,
  threshold: number = 240 // Pixels with RGB values above this are considered white
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is white or near-white
        if (r >= threshold && g >= threshold && b >= threshold) {
          // Make it transparent
          data[i + 3] = 0;
        }
      }

      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);

      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      // If loading fails (e.g., CORS), return original URL
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}

// Hook for using background removal in React components
import { useState, useEffect } from 'react';

export function useRemoveBackground(
  imageUrl: string | undefined,
  enabled: boolean = true,
  threshold: number = 240
): { processedUrl: string | undefined; isProcessing: boolean } {
  const [processedUrl, setProcessedUrl] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!imageUrl || !enabled) {
      setProcessedUrl(imageUrl);
      return;
    }

    let cancelled = false;
    setIsProcessing(true);

    removeWhiteBackground(imageUrl, threshold)
      .then((url) => {
        if (!cancelled) {
          setProcessedUrl(url);
          setIsProcessing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProcessedUrl(imageUrl);
          setIsProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, enabled, threshold]);

  return { processedUrl, isProcessing };
}
