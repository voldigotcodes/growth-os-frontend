import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useSwipeGestures } from './hooks/useSwipeGestures.js';
import Sidebar from './components/Sidebar.jsx';
import OnboardingTour from './components/OnboardingTour.jsx';
import { ThemeContext } from './context/ThemeContext.jsx';
import { usePreferences } from './context/PreferencesContext.jsx';
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx';
import { StatusProvider } from './context/StatusContext.jsx';
import GlobalCommandPalette from './components/GlobalCommandPalette.jsx';
import ShortcutHints from './components/ShortcutHints.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const TranscribePage = lazy(() => import('./pages/TranscribePage.jsx'));
const TTSPage = lazy(() => import('./pages/TTSPage.jsx'));
const DownloadPage = lazy(() => import('./pages/DownloadPage.jsx'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage.jsx'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage.jsx'));
const WorkflowPage = lazy(() => import('./pages/WorkflowPage.jsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

function Shell() {
  const [theme, setTheme] = useState('dark');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { preferences } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();

  const routes = ['/dashboard', '/download', '/transcribe', '/tts', '/workflows', '/workspace', '/knowledge', '/settings', '/pricing'];
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
  }, [theme]);


  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
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
          isDark ? 'text-slate-100' : 'text-slate-700',
        ].join(' ')}
      >
        <div
          className={[
            'pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out',
            isDark
              ? 'bg-gradient-to-br from-white/5 via-transparent to-purple-500/10'
              : 'bg-gradient-to-br from-emerald-100/40 via-white/60 to-pink-100/50',
          ].join(' ')}
        />
        <Sidebar />
        <main className="relative flex-1 overflow-y-auto">
          <div className="flex flex-col gap-8 md:gap-12 px-8 py-8 md:px-12 md:py-12">
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm animate-fade-in">
              <div>
                <p className="text-base font-medium theme-text-primary">Welcome back, creator.</p>
                <p className="theme-text-muted text-xs">
                  Import a competitor clip, shape the script, and ship the ad without leaving this glass dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.45)]"></span>
                <span className="text-xs uppercase tracking-[0.3em] theme-text-muted">Launch Ready</span>
              </div>
            </div>

            <Suspense fallback={<div className="text-sm text-white/60 animate-fade-in">Charging the glass interface…</div>}>
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
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Suspense>
          </div>
        </main>

        <GlobalCommandPalette onCommand={handleCommand} />
        <ShortcutHints />
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      </div>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <FeatureFlagProvider>
      <StatusProvider>
        <Shell />
      </StatusProvider>
    </FeatureFlagProvider>
  );
}
