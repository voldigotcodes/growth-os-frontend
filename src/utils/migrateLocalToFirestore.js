import {
  getUserPreferences,
  updateUserPreferences,
  migrateLocalStorageToFirestore
} from '../firebase/firestoreService.js';

// Define all localStorage keys that need migration
const MIGRATION_KEYS = {
  // Critical data
  'growth-os-user-id': 'userId',
  'growth-os-session-id': 'sessionId',
  'growth-os-preferences': 'preferences',
  'growth-os-backgrounds': 'backgrounds',
  'growth-os-selected-theme': 'selectedTheme',
  'growth-os-onboarding-completed': 'onboardingCompleted',

  // Debug/development data (can keep local or migrate)
  'workflow-debug': 'workflowDebug'
};

/**
 * Extracts all relevant data from localStorage
 * @returns {Object} Extracted localStorage data
 */
export const extractLocalStorageData = () => {
  const data = {};

  try {
    // Extract each key
    Object.entries(MIGRATION_KEYS).forEach(([localKey, dataKey]) => {
      const value = localStorage.getItem(localKey);
      if (value !== null) {
        try {
          // Try to parse as JSON, fallback to string
          data[dataKey] = localKey.includes('completed') || localKey.includes('debug')
            ? value === 'true'
            : (value.startsWith('{') || value.startsWith('['))
              ? JSON.parse(value)
              : value;
        } catch (e) {
          // If JSON parsing fails, store as string
          data[dataKey] = value;
        }
      }
    });

    // Log what we found
    console.log('📦 Extracted localStorage data:', Object.keys(data));

    return data;
  } catch (error) {
    console.error('❌ Error extracting localStorage data:', error);
    return {};
  }
};

/**
 * Clears migrated data from localStorage
 * @param {Array} keysToKeep - Keys to preserve in localStorage
 */
export const clearMigratedLocalStorage = (keysToKeep = ['workflow-debug']) => {
  try {
    Object.keys(MIGRATION_KEYS).forEach(localKey => {
      if (!keysToKeep.includes(localKey)) {
        localStorage.removeItem(localKey);
        console.log(`🗑️ Cleared localStorage key: ${localKey}`);
      }
    });
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }
};

/**
 * Checks if migration is needed
 * @returns {boolean} True if localStorage contains data that needs migration
 */
export const isMigrationNeeded = () => {
  const criticalKeys = [
    'growth-os-preferences',
    'growth-os-backgrounds',
    'growth-os-selected-theme',
    'growth-os-onboarding-completed'
  ];

  return criticalKeys.some(key => localStorage.getItem(key) !== null);
};

/**
 * Performs the complete migration from localStorage to Firestore
 * @param {string} uid - Firebase user ID
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} Migration result
 */
export const performMigration = async (uid, options = {}) => {
  const {
    clearLocal = true,
    keysToKeep = ['workflow-debug'],
    force = false
  } = options;

  try {
    console.log('🚀 Starting localStorage → Firestore migration for user:', uid);

    // Check if migration is needed (unless forced)
    if (!force && !isMigrationNeeded()) {
      console.log('✅ No migration needed - localStorage is clean');
      return { success: true, migrated: false, message: 'No data to migrate' };
    }

    // Extract localStorage data
    const localData = extractLocalStorageData();

    if (Object.keys(localData).length === 0) {
      console.log('✅ No data found in localStorage to migrate');
      return { success: true, migrated: false, message: 'No data found' };
    }

    // Transform data for Firestore format
    const firestoreData = await transformDataForFirestore(localData);

    // Perform the migration
    const migrationResult = await migrateLocalStorageToFirestore(uid, firestoreData);

    if (!migrationResult.success) {
      throw new Error(migrationResult.error);
    }

    // Clear localStorage if requested
    if (clearLocal) {
      clearMigratedLocalStorage(keysToKeep);
    }

    console.log('✅ Migration completed successfully');
    return {
      success: true,
      migrated: true,
      message: 'Data migrated successfully',
      migratedKeys: Object.keys(localData)
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      migrated: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Transforms localStorage data to Firestore-compatible format
 * @param {Object} localData - Extracted localStorage data
 * @returns {Promise<Object>} Transformed data for Firestore
 */
const transformDataForFirestore = async (localData) => {
  const transformed = {};

  // Handle preferences
  if (localData.preferences) {
    transformed.preferences = typeof localData.preferences === 'string'
      ? JSON.parse(localData.preferences)
      : localData.preferences;
  }

  // Handle theme settings
  if (localData.backgrounds || localData.selectedTheme) {
    transformed.preferences = transformed.preferences || {};

    if (localData.backgrounds) {
      transformed.preferences.backgrounds = typeof localData.backgrounds === 'string'
        ? JSON.parse(localData.backgrounds)
        : localData.backgrounds;
    }

    if (localData.selectedTheme) {
      transformed.preferences.selectedTheme = localData.selectedTheme;
    }
  }

  // Handle onboarding status
  if (localData.onboardingCompleted !== undefined) {
    transformed.preferences = transformed.preferences || {};
    transformed.preferences.onboardingCompleted = localData.onboardingCompleted === true;
  }

  // Handle debug settings (keep in preferences for now)
  if (localData.workflowDebug !== undefined) {
    transformed.preferences = transformed.preferences || {};
    transformed.preferences.workflowDebug = localData.workflowDebug === true;
  }

  return transformed;
};

/**
 * Auto-migration hook - runs on app startup if user is authenticated
 * @param {string} uid - Firebase user ID
 * @returns {Promise<void>}
 */
export const autoMigrateOnStartup = async (uid) => {
  try {
    // Only auto-migrate if there's data to migrate
    if (!isMigrationNeeded()) {
      return;
    }

    console.log('🔄 Auto-migrating localStorage data on startup...');

    const result = await performMigration(uid, {
      clearLocal: true,
      keysToKeep: ['workflow-debug'], // Keep debug settings local
      force: false
    });

    if (result.success && result.migrated) {
      // Show user-friendly notification
      if (window.showMigrationSuccess) {
        window.showMigrationSuccess(result.migratedKeys);
      }
    }

  } catch (error) {
    console.error('❌ Auto-migration failed:', error);
    // Don't block app startup on migration failure
  }
};

/**
 * Manual migration trigger (for user-initiated migration)
 * @param {string} uid - Firebase user ID
 * @returns {Promise<Object>} Migration result
 */
export const triggerManualMigration = async (uid) => {
  return await performMigration(uid, {
    clearLocal: true,
    keysToKeep: ['workflow-debug'],
    force: true // Force migration even if no data detected
  });
};

/**
 * Backup localStorage data before migration
 * @returns {Object} Backup data
 */
export const backupLocalStorage = () => {
  const backup = {};

  try {
    Object.keys(MIGRATION_KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        backup[key] = value;
      }
    });

    // Store backup with timestamp
    const backupData = {
      timestamp: new Date().toISOString(),
      data: backup
    };

    // Save backup to a special localStorage key
    localStorage.setItem('growth-os-migration-backup', JSON.stringify(backupData));

    return backupData;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    return null;
  }
};

/**
 * Restore from backup (emergency restore function)
 * @returns {boolean} Success status
 */
export const restoreFromBackup = () => {
  try {
    const backup = localStorage.getItem('growth-os-migration-backup');
    if (!backup) {
      console.log('No backup found');
      return false;
    }

    const backupData = JSON.parse(backup);

    Object.entries(backupData.data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('✅ Restored from backup:', backupData.timestamp);
    return true;
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
    return false;
  }
};