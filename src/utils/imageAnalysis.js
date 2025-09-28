/**
 * Analyzes background image brightness to determine optimal text color
 * Uses human perception weighted formula for accurate brightness calculation
 */

/**
 * Calculate the perceived brightness of an image
 * @param {string} imageUrl - URL of the image to analyze
 * @param {Object} options - Configuration options
 * @param {number} options.sampleRate - How many pixels to sample (1 = all pixels, 10 = every 10th pixel)
 * @param {number} options.threshold - Brightness threshold (0-255) to determine light vs dark
 * @returns {Promise<Object>} - Object with brightness, isLight, and recommendedTextColor
 */
export const analyzeImageBrightness = (imageUrl, options = {}) => {
  const { sampleRate = 10, threshold = 128 } = options;

  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve({
        brightness: threshold + 1, // Default to light
        isLight: true,
        recommendedTextColor: 'black'
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Use smaller canvas for performance while maintaining accuracy
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let totalBrightness = 0;
        let pixelCount = 0;

        // Sample pixels based on sampleRate
        const step = 4 * sampleRate; // 4 bytes per pixel (RGBA)

        for (let i = 0; i < imageData.length; i += step) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const alpha = imageData[i + 3];

          // Skip fully transparent pixels
          if (alpha === 0) continue;

          // Human perception weighted brightness calculation
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          totalBrightness += brightness;
          pixelCount++;
        }

        const averageBrightness = pixelCount > 0 ? totalBrightness / pixelCount : threshold + 1;
        const isLight = averageBrightness > threshold;

        resolve({
          brightness: averageBrightness,
          isLight,
          recommendedTextColor: isLight ? 'black' : 'white'
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      // Fallback to default if image fails to load
      resolve({
        brightness: threshold + 1,
        isLight: true,
        recommendedTextColor: 'black'
      });
    };

    img.src = imageUrl;
  });
};

/**
 * Get dynamic text color classes based on background brightness
 * @param {boolean} isLight - Whether the background is light
 * @param {boolean} isDarkTheme - Current theme mode
 * @returns {Object} - Text color classes for different text types
 */
export const getDynamicTextClasses = (isLight, isDarkTheme) => {
  // If no background image, use theme-based classes
  if (isLight === null) {
    return {
      primary: 'theme-text-primary',
      secondary: 'theme-text-secondary',
      muted: 'theme-text-muted'
    };
  }

  // Dynamic classes based on background brightness
  if (isLight) {
    // Light background - use dark text
    return {
      primary: 'text-slate-900',
      secondary: 'text-slate-700',
      muted: 'text-slate-600'
    };
  } else {
    // Dark background - use light text
    return {
      primary: 'text-white',
      secondary: 'text-white/90',
      muted: 'text-white/70'
    };
  }
};

/**
 * Enhanced dynamic text colors with better contrast ratios
 * @param {boolean} isLight - Whether the background is light
 * @param {number} brightness - Actual brightness value (0-255)
 * @returns {Object} - Enhanced text color classes
 */
export const getEnhancedDynamicTextClasses = (isLight, brightness) => {
  if (isLight === null) {
    return {
      primary: 'theme-text-primary',
      secondary: 'theme-text-secondary',
      muted: 'theme-text-muted'
    };
  }

  // Fine-tuned contrast based on actual brightness value
  if (brightness > 180) {
    // Very light background
    return {
      primary: 'text-slate-900',
      secondary: 'text-slate-800',
      muted: 'text-slate-700'
    };
  } else if (brightness > 128) {
    // Medium light background
    return {
      primary: 'text-slate-800',
      secondary: 'text-slate-700',
      muted: 'text-slate-600'
    };
  } else if (brightness > 80) {
    // Medium dark background
    return {
      primary: 'text-white',
      secondary: 'text-white/95',
      muted: 'text-white/80'
    };
  } else {
    // Very dark background
    return {
      primary: 'text-white',
      secondary: 'text-white/90',
      muted: 'text-white/75'
    };
  }
};