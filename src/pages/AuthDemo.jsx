import React, { useState } from 'react';
import { SignUpForm, LoginForm, LogoutButton, useAuth, usePlan } from '../firebase/index.js';

const AuthDemo = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [message, setMessage] = useState('');
  const { currentUser, userProfile, loading } = useAuth();
  const plan = usePlan();

  const handleAuthSuccess = (user, profile) => {
    setMessage(`Welcome ${user?.displayName || user?.email}!`);
  };

  const handleAuthError = (error) => {
    setMessage(`Error: ${error}`);
  };

  const handleLogoutSuccess = () => {
    setMessage('Successfully signed out!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="theme-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 text-center mb-8">
            <h1 className="text-3xl font-bold theme-text-primary mb-4">
              🎉 Firebase Auth Working!
            </h1>

            <div className="space-y-4">
              <div className="glass-panel p-4 bg-green-500/10 border border-green-500/20">
                <h2 className="text-lg font-semibold theme-text-primary mb-2">User Information</h2>
                <div className="text-sm theme-text-muted space-y-1">
                  <p><strong>UID:</strong> {currentUser.uid}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Display Name:</strong> {currentUser.displayName}</p>
                </div>
              </div>

              {userProfile && (
                <div className="glass-panel p-4 bg-blue-500/10 border border-blue-500/20">
                  <h2 className="text-lg font-semibold theme-text-primary mb-2">Firestore Profile</h2>
                  <div className="text-sm theme-text-muted space-y-1">
                    <p><strong>Plan:</strong> <span className="capitalize font-medium text-blue-400">{plan}</span></p>
                    <p><strong>Created:</strong> {userProfile.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
                    <p><strong>Updated:</strong> {userProfile.updatedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
                  </div>
                </div>
              )}

              <div className="glass-panel p-4 bg-purple-500/10 border border-purple-500/20">
                <h2 className="text-lg font-semibold theme-text-primary mb-2">Ready for RevenueCat</h2>
                <p className="text-sm theme-text-muted">
                  Your <code className="bg-slate-700 px-2 py-1 rounded text-purple-300">uid</code> can be used as the <strong>app_user_id</strong> when integrating with RevenueCat for subscription management.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <LogoutButton
                onSuccess={handleLogoutSuccess}
                onError={handleAuthError}
                variant="secondary"
                size="md"
              >
                Sign Out
              </LogoutButton>
            </div>

            {message && (
              <div className="mt-4 p-3 glass-panel bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            Firebase Auth Demo
          </h1>
          <p className="theme-text-muted">
            Test the Firebase Authentication + Firestore integration
          </p>
        </div>

        {authMode === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            switchToSignUp={() => setAuthMode('signup')}
          />
        ) : (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            switchToLogin={() => setAuthMode('login')}
          />
        )}

        {message && (
          <div className="mt-4 p-3 glass-panel bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-300">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDemo;