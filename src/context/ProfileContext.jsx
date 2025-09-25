import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

// Default profile data
const defaultProfile = {
  name: 'Creative Director',
  email: 'creator@growthstudio.com',
  company: 'Growth Studio',
  timezone: 'America/New_York',
  avatar: null,
  bio: '',
  website: '',
  title: 'Creative Director',
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('growth-os-profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({ ...defaultProfile, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load profile from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('growth-os-profile', JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to save profile to localStorage:', error);
      }
    }
  }, [profile, isLoading]);

  const updateProfile = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMultipleFields = (updates) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    localStorage.removeItem('growth-os-profile');
  };

  const contextValue = {
    profile,
    isLoading,
    updateProfile,
    updateMultipleFields,
    resetProfile,
    // Computed values for easy access
    displayName: profile.name || 'Creative Director',
    companyName: profile.company || 'Growth Studio',
    userInitials: (profile.name || 'CD').split(' ').map(n => n[0]).join('').toUpperCase(),
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