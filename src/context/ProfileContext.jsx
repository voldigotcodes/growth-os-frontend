import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext.jsx';
import { updateUserProfile } from '../firebase/firestore.js';

const ProfileContext = createContext();

// Default profile data
const defaultProfile = {
  name: '',
  email: '',
  company: '',
  timezone: 'America/New_York',
  avatar: null,
  bio: '',
  website: '',
  title: '',
};

export function ProfileProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [profile, setProfile] = useState(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from Firebase userProfile when available
  useEffect(() => {
    if (userProfile) {
      // Map Firebase userProfile to our profile format
      const firebaseProfile = {
        name: userProfile.displayName || currentUser?.displayName || '',
        email: userProfile.email || currentUser?.email || '',
        company: userProfile.company || '',
        timezone: userProfile.timezone || 'America/New_York',
        avatar: userProfile.avatar || null,
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        title: userProfile.title || '',
      };
      setProfile({ ...defaultProfile, ...firebaseProfile });
      setIsLoading(false);
    } else if (currentUser && !userProfile) {
      // If we have currentUser but no userProfile yet, use currentUser data
      const basicProfile = {
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        company: '',
        timezone: 'America/New_York',
        avatar: null,
        bio: '',
        website: '',
        title: '',
      };
      setProfile({ ...defaultProfile, ...basicProfile });
      setIsLoading(false);
    } else if (!currentUser) {
      // No user logged in, reset to defaults
      setProfile(defaultProfile);
      setIsLoading(false);
    }
  }, [currentUser, userProfile]);

  const updateProfile = async (field, value) => {
    const newProfile = {
      ...profile,
      [field]: value
    };

    // Update local state immediately for responsive UI
    setProfile(newProfile);

    // Update Firebase if user is logged in
    if (currentUser) {
      try {
        await updateUserProfile(currentUser.uid, {
          [field]: value,
          // Map our profile fields to Firebase fields
          displayName: field === 'name' ? value : profile.name,
          company: field === 'company' ? value : profile.company,
          timezone: field === 'timezone' ? value : profile.timezone,
          avatar: field === 'avatar' ? value : profile.avatar,
          bio: field === 'bio' ? value : profile.bio,
          website: field === 'website' ? value : profile.website,
          title: field === 'title' ? value : profile.title,
        });
      } catch (error) {
        console.error('Failed to update profile in Firebase:', error);
        // Revert local state on Firebase error
        setProfile(profile);
      }
    }
  };

  const updateMultipleFields = async (updates) => {
    const newProfile = {
      ...profile,
      ...updates
    };

    // Update local state immediately for responsive UI
    setProfile(newProfile);

    // Update Firebase if user is logged in
    if (currentUser) {
      try {
        await updateUserProfile(currentUser.uid, {
          ...updates,
          // Ensure displayName is properly mapped
          displayName: updates.name || profile.name,
        });
      } catch (error) {
        console.error('Failed to update profile in Firebase:', error);
        // Revert local state on Firebase error
        setProfile(profile);
      }
    }
  };

  const resetProfile = async () => {
    setProfile(defaultProfile);

    // Reset Firebase profile if user is logged in
    if (currentUser) {
      try {
        await updateUserProfile(currentUser.uid, defaultProfile);
      } catch (error) {
        console.error('Failed to reset profile in Firebase:', error);
      }
    }
  };

  const contextValue = {
    profile,
    isLoading,
    updateProfile,
    updateMultipleFields,
    resetProfile,
    // Computed values for easy access
    displayName: profile.name || currentUser?.displayName || 'User',
    companyName: profile.company || 'Your Company',
    userInitials: (profile.name || currentUser?.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase(),
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext;