import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from './auth.js';
import { getUserProfile } from './firestore.js';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      try {
        setError(null);
        if (user) {
          setCurrentUser(user);

          const { userProfile: profile, error: profileError } = await getUserProfile(user.uid);
          if (profileError) {
            setError(profileError);
            setUserProfile(null);
          } else {
            setUserProfile(profile);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        setError(err.message);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    plan: userProfile?.plan || 'starter'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};