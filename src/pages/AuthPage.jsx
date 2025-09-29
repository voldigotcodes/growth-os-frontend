import React, { useState, useEffect } from 'react';
import { SignUpForm, LoginForm, useAuth } from '../firebase/index.js';
import { Navigate } from 'react-router-dom';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [message, setMessage] = useState('');
  const { currentUser, loading } = useAuth();

  // Override theme background for auth page - always use default glass background
  useEffect(() => {
    const originalBodyBackground = document.body.style.backgroundImage;
    const originalBodyBackgroundSize = document.body.style.backgroundSize;
    const originalBodyBackgroundPosition = document.body.style.backgroundPosition;
    const originalBodyBackgroundRepeat = document.body.style.backgroundRepeat;
    const originalBodyBackgroundAttachment = document.body.style.backgroundAttachment;

    // Reset to default background (no theme-specific gradient)
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';

    // Cleanup: restore original background when component unmounts
    return () => {
      document.body.style.backgroundImage = originalBodyBackground;
      document.body.style.backgroundSize = originalBodyBackgroundSize;
      document.body.style.backgroundPosition = originalBodyBackgroundPosition;
      document.body.style.backgroundRepeat = originalBodyBackgroundRepeat;
      document.body.style.backgroundAttachment = originalBodyBackgroundAttachment;
    };
  }, []);

  const handleAuthSuccess = (user, profile) => {
    setMessage(`Welcome ${user?.displayName || user?.email}!`);
    // Navigation will be handled automatically by the route protection
  };

  const handleAuthError = (error) => {
    setMessage(`Error: ${error}`);
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

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/10" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold theme-text-primary mb-2">
            Growth OS Studio
          </h1>
          <p className="theme-text-muted text-lg">
            Your creative advertising workspace
          </p>
        </div>

        <div className="glass-panel p-8">
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
            <div className="mt-4 p-3 glass-panel bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">{message}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm theme-text-muted">
            Secure authentication powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;