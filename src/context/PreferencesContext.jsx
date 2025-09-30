import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../firebase/AuthContext.jsx';
import { updateUserPreferences, resetUserPreferences } from '../firebase/firestoreService.js';

const PreferencesContext = createContext({
  preferences: {
    interface: {
      compactMode: false,
      showDescriptions: true,
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
  const { currentUser, userPreferences, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync preferences from Firebase when user auth state changes
  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to finish loading
    }

    if (!currentUser) {
      // User not authenticated - use default preferences
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    if (userPreferences) {
      // Merge Firestore preferences with defaults to ensure all fields exist
      const mergedPreferences = {
        ...defaultPreferences,
        interface: { ...defaultPreferences.interface, ...userPreferences.ui },
        notifications: { ...defaultPreferences.notifications, ...userPreferences.notifications },
        workflow: { ...defaultPreferences.workflow, ...userPreferences.workflow },
      };

      setPreferences(mergedPreferences);
      setLoading(false);
      console.log('🔄 Preferences loaded from Firestore');
    } else {
      // No preferences in Firestore yet - use defaults
      setPreferences(defaultPreferences);
      setLoading(false);
    }
  }, [currentUser, userPreferences, authLoading]);

  const updatePreference = useCallback(async (category, field, value) => {
    if (!currentUser) {
      console.warn('Cannot update preferences: user not authenticated');
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));

      // Prepare the update for Firestore (map categories to Firestore structure)
      const firestoreUpdate = {};

      if (category === 'interface') {
        firestoreUpdate['ui'] = {
          ...userPreferences?.ui,
          [field]: value
        };
      } else if (category === 'notifications') {
        firestoreUpdate['notifications'] = {
          ...userPreferences?.notifications,
          [field]: value
        };
      } else if (category === 'workflow') {
        firestoreUpdate['workflow'] = {
          ...userPreferences?.workflow,
          [field]: value
        };
      }

      // Update Firestore
      const result = await updateUserPreferences(currentUser.uid, firestoreUpdate);

      if (result.error) {
        console.error('Failed to update preferences in Firestore:', result.error);
        setError(result.error);

        // Revert local state on error
        setPreferences(prev => {
          const reverted = { ...prev };
          if (reverted[category] && reverted[category][field] !== undefined) {
            delete reverted[category][field];
          }
          return reverted;
        });
      } else {
        console.log(`✅ Updated preference: ${category}.${field} = ${value}`);
        setError(null);
      }

    } catch (error) {
      console.error('Error updating preference:', error);
      setError(error.message);

      // Revert local state on error
      setPreferences(prev => {
        const reverted = { ...prev };
        if (reverted[category] && reverted[category][field] !== undefined) {
          delete reverted[category][field];
        }
        return reverted;
      });
    }
  }, [currentUser, userPreferences]);

  const resetPreferences = useCallback(async () => {
    if (!currentUser) {
      console.warn('Cannot reset preferences: user not authenticated');
      return;
    }

    try {
      setLoading(true);

      // Reset to defaults locally
      setPreferences(defaultPreferences);

      // Reset in Firestore
      const result = await resetUserPreferences(currentUser.uid);

      if (result.error) {
        console.error('Failed to reset preferences in Firestore:', result.error);
        setError(result.error);
      } else {
        console.log('✅ Preferences reset successfully');
        setError(null);
      }

    } catch (error) {
      console.error('Error resetting preferences:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Apply preferences to document body for CSS access
  useEffect(() => {
    const body = document.body;

    // Remove existing preference classes
    body.classList.remove('compact-mode', 'hide-descriptions');

    // Apply current preferences
    if (preferences.interface.compactMode) {
      body.classList.add('compact-mode');
    }

    if (!preferences.interface.showDescriptions) {
      body.classList.add('hide-descriptions');
    }
  }, [preferences.interface.compactMode, preferences.interface.showDescriptions]);

  const contextValue = useMemo(
    () => ({
      preferences,
      loading,
      error,
      updatePreference,
      resetPreferences,
      isAuthenticated: !!currentUser,
    }),
    [preferences, loading, error, updatePreference, resetPreferences, currentUser]
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