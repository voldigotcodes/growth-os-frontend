import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useSwipeGestures } from './hooks/useSwipeGestures.js';
import Sidebar from './components/Sidebar.jsx';
import OnboardingTour from './components/OnboardingTour.jsx';
import { ThemeContext } from './context/ThemeContext.jsx';
import { usePreferences } from './context/PreferencesContext.jsx';
import { useProfile } from './context/ProfileContext.jsx';
import { useDynamicTextColor } from './hooks/useDynamicTextColor.js';
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx';
import { StatusProvider } from './context/StatusContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { getThemeById, getDefaultTheme } from './config/themes.js';
import { AuthProvider } from './firebase/AuthContext.jsx';
import GlobalCommandPalette from './components/GlobalCommandPalette.jsx';
import ShortcutHints from './components/ShortcutHints.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const TranscribePage = lazy(() => import('./pages/TranscribePage.jsx'));
const TTSPage = lazy(() => import('./pages/TTSPage.jsx'));
const DownloadPage = lazy(() => import('./pages/DownloadPage.jsx'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage.jsx'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage.jsx'));
const WorkflowPage = lazy(() => import('./pages/WorkflowPage.jsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const AuthDemo = lazy(() => import('./pages/AuthDemo.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage.jsx'));

function Shell() {
  const [theme, setTheme] = useState('dark');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [backgroundImages, setBackgroundImages] = useState(() => {
    // Clear any stored gradient data from localStorage to prevent URL errors
    const saved = localStorage.getItem('growth-os-backgrounds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if stored values contain gradients (which should not be stored)
        const hasGradients = Object.values(parsed || {}).some(val =>
          val && typeof val === 'string' && val.includes('linear-gradient')
        );
        if (hasGradients) {
          localStorage.removeItem('growth-os-backgrounds');
          return { light: null, dark: null };
        }
        return parsed;
      } catch {
        localStorage.removeItem('growth-os-backgrounds');
        return { light: null, dark: null };
      }
    }
    return { light: null, dark: null };
  });
  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    // Load selected theme from localStorage
    const saved = localStorage.getItem('growth-os-selected-theme');
    return saved || 'default';
  });
  const { preferences } = usePreferences();
  const { displayName } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryText } = useDynamicTextColor();

  const routes = ['/dashboard', '/download', '/transcribe', '/tts', '/workflows', '/workspace', '/knowledge', '/subscriptions', '/settings', '/pricing'];
  const currentIndex = routes.indexOf(location.pathname);

  const swipeGestureRef = useSwipeGestures({
    onSwipeLeft: () => {
      if (currentIndex < routes.length - 1) {
        navigate(routes[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        navigate(routes[currentIndex - 1]);
      }
    }
  });

  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light');
    body.classList.add(`theme-${theme}`);

    // Apply predefined theme background (dark mode only)
    const selectedTheme = getThemeById(selectedThemeId);
    let currentBg = null;

    if (selectedTheme && selectedTheme.dark) {
      // Use predefined theme gradient - ensure it's properly formatted CSS
      currentBg = selectedTheme.dark;
      // Only apply if it's a valid CSS gradient
      if (currentBg && currentBg.includes('linear-gradient')) {
        body.style.backgroundImage = currentBg;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundAttachment = 'fixed';
      } else {
        // Reset if invalid
        body.style.backgroundImage = '';
      }
    } else if (backgroundImages.dark) {
      // Fallback to custom uploaded image (for backwards compatibility)
      currentBg = backgroundImages.dark;
      // Check if it's a URL or gradient
      if (currentBg.includes('linear-gradient')) {
        body.style.backgroundImage = currentBg;
      } else {
        body.style.backgroundImage = `url(${currentBg})`;
      }
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundRepeat = 'no-repeat';
      body.style.backgroundAttachment = 'fixed';
    } else {
      // Reset to default CSS backgrounds
      body.style.backgroundImage = '';
      body.style.backgroundSize = '';
      body.style.backgroundPosition = '';
      body.style.backgroundRepeat = '';
      body.style.backgroundAttachment = '';
    }
  }, [theme, backgroundImages, selectedThemeId]);


  const setBackgroundImage = (mode, imageUrl) => {
    const newBackgrounds = { ...backgroundImages, [mode]: imageUrl };
    setBackgroundImages(newBackgrounds);
    // Save to localStorage
    localStorage.setItem('growth-os-backgrounds', JSON.stringify(newBackgrounds));
  };

  const setSelectedTheme = (themeId) => {
    setSelectedThemeId(themeId);
    localStorage.setItem('growth-os-selected-theme', themeId);

    // Don't store gradient strings in backgroundImages - they should only contain actual image URLs
    // The gradient application is handled directly in the useEffect
  };

  const getCurrentBackgroundStyle = () => {
    const selectedTheme = getThemeById(selectedThemeId);
    if (!selectedTheme) return null;

    const currentBackground = selectedTheme.dark;
    return currentBackground ? { backgroundImage: currentBackground } : null;
  };

  const resetBackgroundImage = (mode) => {
    const newBackgrounds = { ...backgroundImages, [mode]: null };
    setBackgroundImages(newBackgrounds);
    localStorage.setItem('growth-os-backgrounds', JSON.stringify(newBackgrounds));
  };

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme: () => {}, // Light mode removed - always dark mode
      backgroundImages,
      setBackgroundImage,
      resetBackgroundImage,
      selectedThemeId,
      setSelectedTheme,
      getCurrentBackgroundStyle,
    }),
    [theme, backgroundImages, selectedThemeId]
  );

  const isDark = theme === 'dark';

  const handleCommand = (payload) => {
    if (payload === 'workflow.run') {
      window.dispatchEvent(new CustomEvent('workflow:run')); // listeners can subscribe
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        ref={swipeGestureRef}
        className={[
          'relative flex h-screen overflow-hidden transition-colors duration-500 ease-out',
          primaryText,
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out bg-gradient-to-br from-white/5 via-transparent to-purple-500/10" />
        {/* Left panel with stronger background blur */}
        <div className="relative w-72 shrink-0 h-screen">
          {/* Background overlay for left panel - more blurred - covers full height */}
          <div
            className="fixed top-0 bottom-0 left-0 pointer-events-none z-0"
            style={{
              width: '18rem', // 72 * 0.25rem = 18rem (sidebar width)
              backdropFilter: 'blur(20px) saturate(150%)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)'
            }}
          />
          <div className="relative z-10">
            <Sidebar />
          </div>
        </div>
        {/* Right panel with lighter background blur */}
        <main className="relative flex-1 h-screen">
          {/* Background overlay for right panel - less blurred - covers full scrollable area */}
          <div
            className="fixed top-0 bottom-0 pointer-events-none z-0"
            style={{
              left: '18rem', // 72 * 0.25rem = 18rem (sidebar width)
              right: '0',
              backdropFilter: 'blur(8px) saturate(120%)',
              backgroundColor: 'rgba(15, 23, 42, 0.70)'
            }}
          />
          <div className="relative z-10 h-full overflow-y-auto">
            <div className="flex flex-col gap-8 md:gap-12 px-8 py-8 md:px-12 md:py-12">
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm animate-fade-in">
              <div>
                <p className="text-base font-medium theme-text-primary">Welcome back, {displayName}.</p>
                <p className="theme-text-muted text-xs">
                  Import a competitor clip, shape the script, and ship the ad without leaving this glass dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.45)]"></span>
                <span className="text-xs uppercase tracking-[0.3em] theme-text-muted">Launch Ready</span>
              </div>
            </div>

            <Suspense fallback={<div className="text-sm animate-fade-in" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Charging the glass interface…</div>}>
              <div className="animate-slide-up">
                <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transcribe" element={<TranscribePage />} />
                <Route path="/tts" element={<TTSPage />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/workflows" element={<WorkflowPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/auth-demo" element={<AuthDemo />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Suspense>
            </div>
          </div>
        </main>

        <GlobalCommandPalette onCommand={handleCommand} />
        <ShortcutHints />
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      </div>
    </ThemeContext.Provider>
  );
}

// Main App component that handles routing between auth and protected areas
function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Shell />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <FeatureFlagProvider>
          <StatusProvider>
            <AppRoutes />
          </StatusProvider>
        </FeatureFlagProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
