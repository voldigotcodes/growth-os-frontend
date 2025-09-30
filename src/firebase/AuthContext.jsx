import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from './auth.js';
import { getUserProfile } from './firestore.js';
import {
  getUserPreferences,
  getUserSubscription,
  subscribeToUserPreferences,
  subscribeToUserSubscription
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

    const unsubscribe = onAuthStateChange(async (user) => {
      try {
        setError(null);
        setLoading(true);

        if (user) {
          console.log('🔐 User authenticated, setting up Firestore integration...');
          setCurrentUser(user);

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
            // Fetch current subscription tier from backend for the profile
            try {
              const quotaResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/credits/quota`, {
                method: 'GET',
                headers: {
                  'X-User-ID': user.uid,
                  'Content-Type': 'application/json'
                }
              });

              if (quotaResponse.ok) {
                const quotaData = await quotaResponse.json();
                profile.plan = quotaData.quota.subscription_tier;
                console.log(`🔄 Updated user plan from backend: ${profile.plan}`);
              }
            } catch (quotaError) {
              console.warn('Failed to fetch subscription tier from backend:', quotaError);
            }

            setUserProfile(profile);
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

        } else {
          // User signed out - clean up
          console.log('🔓 User signed out, cleaning up...');
          setCurrentUser(null);
          setUserProfile(null);
          setUserPreferences(null);
          setUserSubscription(null);
          setMigrationStatus(null);

          // Clean up subscriptions
          if (preferencesUnsubscribe) {
            preferencesUnsubscribe();
            preferencesUnsubscribe = null;
          }
          if (subscriptionUnsubscribe) {
            subscriptionUnsubscribe();
            subscriptionUnsubscribe = null;
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