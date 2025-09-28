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
    light: null, // No background - uses default theme
    dark: null,
    category: 'minimal'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Ethereal aurora-inspired gradients',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    light: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 50%, rgba(255, 154, 158, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 50%, rgba(255, 154, 158, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep ocean blues and teals',
    preview: 'linear-gradient(135deg, #667db6 0%, #0082c8 50%, #0052d4 100%)',
    light: 'linear-gradient(135deg, rgba(102, 125, 182, 0.12) 0%, rgba(0, 130, 200, 0.12) 50%, rgba(0, 82, 212, 0.08) 100%)',
    dark: 'linear-gradient(135deg, rgba(102, 125, 182, 0.2) 0%, rgba(0, 130, 200, 0.2) 50%, rgba(0, 82, 212, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset colors',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    light: 'linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.12) 50%, rgba(255, 207, 139, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 154, 158, 0.18) 0%, rgba(254, 207, 239, 0.18) 50%, rgba(255, 207, 139, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'forest',
    name: 'Forest Mist',
    description: 'Natural greens and earth tones',
    preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    light: 'linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.12) 50%, rgba(134, 239, 172, 0.08) 100%)',
    dark: 'linear-gradient(135deg, rgba(17, 153, 142, 0.18) 0%, rgba(56, 239, 125, 0.18) 50%, rgba(134, 239, 172, 0.12) 100%)',
    category: 'gradient'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    description: 'Deep space purples and magentas',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    light: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 50%, rgba(240, 147, 251, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 50%, rgba(240, 147, 251, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Subtle light tones',
    preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    light: 'linear-gradient(135deg, rgba(255, 236, 210, 0.15) 0%, rgba(252, 182, 159, 0.15) 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 236, 210, 0.08) 0%, rgba(252, 182, 159, 0.08) 100%)',
    category: 'minimal'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Clean black and white gradients',
    preview: 'linear-gradient(135deg, #525252 0%, #3d3d3d 50%, #262626 100%)',
    light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(248, 250, 252, 0.08) 100%)',
    dark: 'linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(30, 41, 59, 0.1) 100%)',
    category: 'minimal'
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    description: 'Vibrant coral and pink tones',
    preview: 'linear-gradient(135deg, #ff7b7b 0%, #ff8e8e 50%, #ff6b9d 100%)',
    light: 'linear-gradient(135deg, rgba(255, 123, 123, 0.1) 0%, rgba(255, 142, 142, 0.12) 50%, rgba(255, 107, 157, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 123, 123, 0.15) 0%, rgba(255, 142, 142, 0.18) 50%, rgba(255, 107, 157, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'arctic',
    name: 'Arctic Breeze',
    description: 'Cool blues and whites',
    preview: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #74b9ff 100%)',
    light: 'linear-gradient(135deg, rgba(116, 185, 255, 0.12) 0%, rgba(9, 132, 227, 0.12) 50%, rgba(116, 185, 255, 0.08) 100%)',
    dark: 'linear-gradient(135deg, rgba(116, 185, 255, 0.18) 0%, rgba(9, 132, 227, 0.18) 50%, rgba(116, 185, 255, 0.12) 100%)',
    category: 'gradient'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Fiery reds and oranges',
    preview: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff9999 100%)',
    light: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.12) 50%, rgba(255, 153, 153, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 142, 83, 0.18) 50%, rgba(255, 153, 153, 0.15) 100%)',
    category: 'gradient'
  },
  {
    id: 'lavender',
    name: 'Lavender Fields',
    description: 'Soft lavender and purple hues',
    preview: 'linear-gradient(135deg, #c471ed 0%, #f64f59 50%, #c471ed 100%)',
    light: 'linear-gradient(135deg, rgba(196, 113, 237, 0.1) 0%, rgba(246, 79, 89, 0.1) 50%, rgba(196, 113, 237, 0.08) 100%)',
    dark: 'linear-gradient(135deg, rgba(196, 113, 237, 0.15) 0%, rgba(246, 79, 89, 0.15) 50%, rgba(196, 113, 237, 0.12) 100%)',
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