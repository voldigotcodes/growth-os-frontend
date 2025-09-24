import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import DownloadPage from './pages/DownloadPage.jsx';
import TTSPage from './pages/TTSPage.jsx';
import TranscribePage from './pages/TranscribePage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import KnowledgePage from './pages/KnowledgePage.jsx';
import { ThemeContext } from './context/ThemeContext.jsx';

export default function App() {
  const [theme, setTheme] = useState('dark');

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

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={[
          'relative flex min-h-screen transition-colors duration-500 ease-out',
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
        <main className="relative flex-1 overflow-y-auto px-10 py-12">
          <div className="flex h-full flex-col gap-12">
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm">
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

            <Routes>
              <Route path="/" element={<Navigate to="/download" replace />} />
              <Route path="/transcribe" element={<TranscribePage />} />
              <Route path="/tts" element={<TTSPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="*" element={<Navigate to="/download" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
