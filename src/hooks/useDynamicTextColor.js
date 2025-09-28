import { useState, useEffect, useCallback } from 'react';
import { analyzeImageBrightness, getEnhancedDynamicTextClasses } from '../utils/imageAnalysis.js';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * Hook for dynamic text colors based on background image brightness
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Brightness threshold (default: 128)
 * @param {number} options.sampleRate - Pixel sampling rate (default: 10)
 * @param {boolean} options.enabled - Whether dynamic colors are enabled (default: true)
 * @returns {Object} - Dynamic text color classes and state
 */
export const useDynamicTextColor = (options = {}) => {
  const { threshold = 128, sampleRate = 10, enabled = true } = options;
  const { theme, backgroundImages } = useTheme();
  const [analysis, setAnalysis] = useState({
    brightness: null,
    isLight: null,
    recommendedTextColor: null,
    isAnalyzing: false,
    error: null
  });

  const currentBackgroundImage = backgroundImages?.[theme];

  const analyzeBackground = useCallback(async (imageUrl) => {
    if (!enabled || !imageUrl) {
      setAnalysis({
        brightness: null,
        isLight: null,
        recommendedTextColor: null,
        isAnalyzing: false,
        error: null
      });
      return;
    }

    setAnalysis(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const result = await analyzeImageBrightness(imageUrl, { threshold, sampleRate });
      setAnalysis({
        brightness: result.brightness,
        isLight: result.isLight,
        recommendedTextColor: result.recommendedTextColor,
        isAnalyzing: false,
        error: null
      });
    } catch (error) {
      console.warn('Failed to analyze background image brightness:', error);
      setAnalysis({
        brightness: null,
        isLight: null,
        recommendedTextColor: null,
        isAnalyzing: false,
        error: error.message
      });
    }
  }, [enabled, threshold, sampleRate]);

  useEffect(() => {
    analyzeBackground(currentBackgroundImage);
  }, [currentBackgroundImage, analyzeBackground]);

  // Get dynamic text classes
  const textClasses = getEnhancedDynamicTextClasses(analysis.isLight, analysis.brightness);

  return {
    // Analysis state
    brightness: analysis.brightness,
    isLight: analysis.isLight,
    recommendedTextColor: analysis.recommendedTextColor,
    isAnalyzing: analysis.isAnalyzing,
    error: analysis.error,
    hasBackgroundImage: !!currentBackgroundImage,

    // Text color classes
    textClasses,

    // Individual class getters for convenience
    primaryText: textClasses.primary,
    secondaryText: textClasses.secondary,
    mutedText: textClasses.muted,

    // Utility functions
    getTextClass: (type = 'primary') => textClasses[type] || textClasses.primary,

    // Force re-analysis
    reanalyze: () => analyzeBackground(currentBackgroundImage)
  };
};

/**
 * Simpler hook that just returns the appropriate text color class
 * @param {string} textType - Type of text ('primary', 'secondary', 'muted')
 * @param {Object} options - Configuration options
 * @returns {string} - CSS class for text color
 */
export const useDynamicTextClass = (textType = 'primary', options = {}) => {
  const { textClasses } = useDynamicTextColor(options);
  return textClasses[textType] || textClasses.primary;
};

/**
 * Hook specifically for checking if we should use light or dark text
 * @param {Object} options - Configuration options
 * @returns {Object} - Text color information
 */
export const useAdaptiveTextColor = (options = {}) => {
  const {
    isLight,
    hasBackgroundImage,
    recommendedTextColor,
    brightness
  } = useDynamicTextColor(options);

  return {
    isLight,
    isDark: isLight === false,
    hasBackgroundImage,
    recommendedTextColor,
    brightness,
    shouldUseLightText: isLight === false,
    shouldUseDarkText: isLight === true,
    // Fallback to theme if no background image
    useThemeDefault: !hasBackgroundImage
  };
};