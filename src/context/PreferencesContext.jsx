import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PreferencesContext = createContext({
  preferences: {
    interface: {
      compactMode: false,
      showDescriptions: true,
      accentColor: 'purple',
    },
    notifications: {
      workflowComplete: true,
      creditLimitReached: true,
      weeklyDigest: false,
      newFeatures: true,
    },
    workflow: {
      autoSave: true,
      showTooltips: true,
      animationSpeed: 'normal',
    },
  },
  updatePreference: () => {},
  resetPreferences: () => {},
});

const defaultPreferences = {
  interface: {
    compactMode: false,
    showDescriptions: true,
    accentColor: 'purple',
  },
  notifications: {
    workflowComplete: true,
    creditLimitReached: true,
    weeklyDigest: false,
    newFeatures: true,
  },
  workflow: {
    autoSave: true,
    showTooltips: true,
    animationSpeed: 'normal',
  },
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('growth-os-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(prevPrefs => ({
          ...defaultPreferences,
          ...parsed,
          interface: { ...defaultPreferences.interface, ...parsed.interface },
          notifications: { ...defaultPreferences.notifications, ...parsed.notifications },
          workflow: { ...defaultPreferences.workflow, ...parsed.workflow },
        }));
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('growth-os-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:', error);
    }
  }, [preferences]);

  const updatePreference = useCallback((category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem('growth-os-preferences');
    } catch (error) {
      console.warn('Failed to remove preferences from localStorage:', error);
    }
  }, []);

  // Apply preferences to document body for CSS access
  useEffect(() => {
    const body = document.body;

    // Remove existing preference classes
    body.classList.remove('compact-mode', 'hide-descriptions');
    body.classList.remove('accent-purple', 'accent-blue', 'accent-emerald', 'accent-pink');

    // Apply current preferences
    if (preferences.interface.compactMode) {
      body.classList.add('compact-mode');
    }

    if (!preferences.interface.showDescriptions) {
      body.classList.add('hide-descriptions');
    }

    body.classList.add(`accent-${preferences.interface.accentColor}`);
  }, [preferences.interface.compactMode, preferences.interface.showDescriptions, preferences.interface.accentColor]);

  const contextValue = useMemo(
    () => ({
      preferences,
      updatePreference,
      resetPreferences,
    }),
    [preferences, updatePreference, resetPreferences]
  );

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}