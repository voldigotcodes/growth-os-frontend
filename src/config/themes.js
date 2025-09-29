/**
 * Predefined background themes for the application
 * Each theme includes gradient backgrounds optimized for both light and dark modes
 */

export const predefinedThemes = [
  {
    id: 'default',
    name: 'Glass Default',
    description: 'Clean glass interface without background',
    preview: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    dark: null,
    category: 'minimal'
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep ocean blues and teals',
    preview: 'linear-gradient(135deg, #667db6 0%, #0082c8 50%, #0052d4 100%)',
    dark: 'linear-gradient(135deg, rgba(102, 125, 182, 0.2) 0%, rgba(0, 130, 200, 0.2) 50%, rgba(0, 82, 212, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset colors',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 154, 158, 0.18) 0%, rgba(254, 207, 239, 0.18) 50%, rgba(255, 207, 139, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'forest',
    name: 'Forest Mist',
    description: 'Natural greens and earth tones',
    preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    dark: 'linear-gradient(135deg, rgba(17, 153, 142, 0.18) 0%, rgba(56, 239, 125, 0.18) 50%, rgba(134, 239, 172, 0.12) 100%)',
    category: 'gradient'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    description: 'Deep space purples and magentas',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    dark: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 50%, rgba(240, 147, 251, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Fiery reds and oranges',
    preview: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff9999 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 142, 83, 0.18) 50%, rgba(255, 153, 153, 0.15) 100%)',
    category: 'gradient'
  }
];

export const themeCategories = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
  { id: 'gradient', name: 'Gradient', description: 'Colorful gradients' }
];

/**
 * Get theme by ID
 * @param {string} themeId
 * @returns {Object|null}
 */
export const getThemeById = (themeId) => {
  return predefinedThemes.find(theme => theme.id === themeId) || null;
};

/**
 * Get themes by category
 * @param {string} categoryId
 * @returns {Array}
 */
export const getThemesByCategory = (categoryId) => {
  return predefinedThemes.filter(theme => theme.category === categoryId);
};

/**
 * Get default theme
 * @returns {Object}
 */
export const getDefaultTheme = () => {
  return predefinedThemes.find(theme => theme.id === 'default');
};

/**
 * Get theme accent colors for selection states
 * @param {string} themeId
 * @returns {Object}
 */
export const getThemeAccentColors = (themeId) => {
  const themeColorMap = {
    'default': {
      border: 'emerald-400/60',
      bg: 'emerald-500/10',
      ring: 'emerald-400/40',
      text: 'emerald-200',
      textMuted: 'emerald-300/80'
    },
    'ocean': {
      border: 'blue-400/60',
      bg: 'blue-500/10',
      ring: 'blue-400/40',
      text: 'blue-200',
      textMuted: 'blue-300/80'
    },
    'sunset': {
      border: 'orange-400/60',
      bg: 'orange-500/10',
      ring: 'orange-400/40',
      text: 'orange-200',
      textMuted: 'orange-300/80'
    },
    'forest': {
      border: 'green-400/60',
      bg: 'green-500/10',
      ring: 'green-400/40',
      text: 'green-200',
      textMuted: 'green-300/80'
    },
    'cosmic': {
      border: 'purple-400/60',
      bg: 'purple-500/10',
      ring: 'purple-400/40',
      text: 'purple-200',
      textMuted: 'purple-300/80'
    },
    'volcano': {
      border: 'red-400/60',
      bg: 'red-500/10',
      ring: 'red-400/40',
      text: 'red-200',
      textMuted: 'red-300/80'
    }
  };

  return themeColorMap[themeId] || themeColorMap['default'];
};