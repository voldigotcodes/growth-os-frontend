import { createContext, useContext } from 'react';

export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  backgroundImages: {
    light: null,
    dark: null
  },
  setBackgroundImage: () => {},
  resetBackgroundImage: () => {},
  // New predefined theme support
  selectedThemeId: 'default',
  setSelectedTheme: () => {},
  getCurrentBackgroundStyle: () => null,
});

export function useTheme() {
  return useContext(ThemeContext);
}
