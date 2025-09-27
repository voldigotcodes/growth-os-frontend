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
});

export function useTheme() {
  return useContext(ThemeContext);
}
