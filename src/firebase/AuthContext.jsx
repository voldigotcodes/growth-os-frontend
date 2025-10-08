import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from './auth.js';
import { getUserProfile } from './firestore.js';
import {
  getUserPreferences,
  getUserSubscription,
  subscribeToUserPreferences,
  subscribeToUserSubscription,
  syncSubscriptionFromBackend
} from './firestoreService.js';
import { autoMigrateOnStartup } from '../utils/migrateLocalToFirestore.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePlan = () => {
  const { userProfile } = useAuth();
  return userProfile?.plan || 'starter';
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);

  useEffect(() => {
    let preferencesUnsubscribe = null;
    let subscriptionUnsubscribe = null;
    let syncInterval = null;

    const unsubscribe = onAuthStateChange(async (user) => {
      try {
        setError(null);
        setLoading(true);

        if (user) {
          console.log('🔐 User authenticated, setting up Firestore integration...');
          setCurrentUser(user);

          // Persist authenticated identity for backend credit checks
          try {
            localStorage.setItem('growth-os-user-id', user.uid);
          } catch (storageError) {
            console.warn('⚠️ Unable to persist user ID to localStorage:', storageError);
          }

          // Perform auto-migration from localStorage if needed
          try {
            setMigrationStatus('migrating');
            const migrationResult = await autoMigrateOnStartup(user.uid);
            setMigrationStatus(migrationResult?.migrated ? 'completed' : 'not_needed');

            if (migrationResult?.migrated) {
              console.log('✅ Auto-migration completed:', migrationResult.migratedKeys);
            }
          } catch (migrationError) {
            console.warn('⚠️ Migration failed:', migrationError);
            setMigrationStatus('failed');
          }

          // Get user profile
          const { userProfile: profile, error: profileError } = await getUserProfile(user.uid);
          if (profileError) {
            console.warn('Profile error:', profileError);
          } else {
            setUserProfile(profile);
          }

          // Sync subscription data from backend to Firestore
          // This ensures Firestore has the latest subscription info from Stripe/backend
          try {
            console.log('🔄 Syncing subscription from backend to Firestore...');
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const syncResult = await syncSubscriptionFromBackend(user.uid, apiBaseUrl);

            if (syncResult.synced) {
              console.log('✅ Subscription synced successfully:', syncResult.subscription?.tier);
            } else {
              console.warn('⚠️ Subscription sync failed:', syncResult.error);
            }
          } catch (syncError) {
            console.warn('⚠️ Failed to sync subscription from backend:', syncError);
          }

          // Set up real-time listeners for Firestore data
          try {
            // Subscribe to user preferences
            preferencesUnsubscribe = subscribeToUserPreferences(user.uid, ({ preferences, error }) => {
              if (error) {
                console.warn('Preferences subscription error:', error);
              } else {
                setUserPreferences(preferences);
                console.log('🔄 User preferences updated from Firestore');
              }
            });

            // Subscribe to user subscription
            subscriptionUnsubscribe = subscribeToUserSubscription(user.uid, ({ subscription, error }) => {
              if (error) {
                console.warn('Subscription subscription error:', error);
              } else {
                setUserSubscription(subscription);
                console.log('🔄 User subscription updated from Firestore');
              }
            });

          } catch (firestoreError) {
            console.warn('Firestore subscription setup failed:', firestoreError);
          }

          // Set up periodic sync from backend to Firestore (every 30 seconds)
          // This ensures subscription changes from Stripe are picked up quickly
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          syncInterval = setInterval(async () => {
            try {
              const syncResult = await syncSubscriptionFromBackend(user.uid, apiBaseUrl);
              if (syncResult.synced) {
                console.log('🔄 Periodic subscription sync completed:', syncResult.subscription?.tier);
              }
            } catch (error) {
              console.warn('⚠️ Periodic sync failed:', error);
            }
          }, 30000); // Sync every 30 seconds

        } else {
          // User signed out - clean up
          console.log('🔓 User signed out, cleaning up...');
          setCurrentUser(null);
          setUserProfile(null);
          setUserPreferences(null);
          setUserSubscription(null);
          setMigrationStatus(null);

          // Clean up subscriptions and intervals
          if (preferencesUnsubscribe) {
            preferencesUnsubscribe();
            preferencesUnsubscribe = null;
          }
          if (subscriptionUnsubscribe) {
            subscriptionUnsubscribe();
            subscriptionUnsubscribe = null;
          }
          if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
          }

          try {
            localStorage.removeItem('growth-os-user-id');
            localStorage.removeItem('growth-os-session-id');
          } catch (storageError) {
            console.warn('⚠️ Unable to clear stored user identity:', storageError);
          }
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setCurrentUser(null);
        setUserProfile(null);
        setUserPreferences(null);
        setUserSubscription(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
      if (preferencesUnsubscribe) preferencesUnsubscribe();
      if (subscriptionUnsubscribe) subscriptionUnsubscribe();
      if (syncInterval) clearInterval(syncInterval);
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    userPreferences,
    userSubscription,
    loading,
    error,
    migrationStatus,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    plan: userProfile?.plan || userSubscription?.tier || 'starter',

    // Helper methods for accessing specific data
    getPreference: (key, defaultValue = null) => {
      if (!userPreferences) return defaultValue;
      return key.split('.').reduce((obj, k) => obj?.[k], userPreferences) ?? defaultValue;
    },

    // Subscription helpers
    hasActiveSubscription: () => userSubscription?.status === 'active',
    getCreditsRemaining: () => userSubscription?.credits || {},
    getUsage: () => userSubscription?.usage || {},

    // Migration helpers
    isMigrationComplete: () => migrationStatus === 'completed' || migrationStatus === 'not_needed',
    isMigrationInProgress: () => migrationStatus === 'migrating'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
