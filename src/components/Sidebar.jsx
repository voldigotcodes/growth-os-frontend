import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import DisabledMenu from './DisabledMenu.jsx';

const navigationSections = [
  {
    title: 'Studio',
    items: [
      { name: 'Dashboard', description: 'Growth metrics & insights', icon: '📊', to: '/dashboard' },
      { name: 'Inspiration Vault', description: 'Collect competitor ads', icon: '💡', to: '/download' },
      { name: 'Script Polish', description: 'Refine transcripts', icon: '✏️', to: '/transcribe' },
      { name: 'Voice Studio', description: 'Generate AI voiceovers', icon: '🎙️', to: '/tts' },
    ]
  },
  {
    title: 'Automate',
    items: [
      { name: 'Workflows', description: 'Visual automation builder', icon: '🔗', to: '/workflows' },
      { name: 'Workspace', description: 'Saved drafts & exports', icon: '📁', to: '/workspace' },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Knowledge', description: 'AI context & prompts', icon: '🧠', to: '/knowledge' },
      { name: 'Settings', description: 'Profile & preferences', icon: '⚙️', to: '/settings' },
      { name: 'Upgrade', description: 'Pricing & billing', icon: '💎', to: '/pricing', highlight: true },
    ]
  }
];

const futureFeatures = [
  { name: 'Growth Pulse', description: 'Workflow nudges & launch analytics tuned by live performance data.', icon: '📈' },
  { name: 'Competitor Library', description: 'Deep pulls from Facebook Ad Library with angle tagging.', icon: '📊' },
  { name: 'Full Project Mode', description: 'Idea → script → audio → video in guided sprint.', icon: '🚀' },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { preferences } = usePreferences();
  const { displayName, companyName } = useProfile();
  const isDark = theme === 'dark';

  return (
    <aside className={`relative flex h-screen w-72 flex-col overflow-hidden border-r transition-all duration-500 ease-out ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}>
      {/* Sticky Header Section */}
      <div className="shrink-0 space-y-4 px-6 py-10">
        {/* Company badge */}
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-widest ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm animate-pulse"></span>
          {companyName} Studio
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold theme-text-primary">
            Launch ads with {displayName}&apos;s workflow
          </h1>
          <p className="text-sm leading-relaxed theme-text-muted">
            Move from swipe file to polished creative without bouncing between tools.
          </p>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-4 py-3 text-left text-sm font-medium w-full rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
        >
          <div className={`flex h-9 w-9 items-center justify-center text-lg rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {isDark ? '🌤️' : '🌙'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold theme-text-primary">
              {isDark ? 'Activate Light Mode' : 'Return to Midnight Mode'}
            </p>
            {preferences.interface.showDescriptions && (
              <p className="text-xs theme-text-muted tracking-wide">
                {isDark ? 'Infuse the glass with aurora hues.' : 'Slide back into the midnight studio.'}
              </p>
            )}
          </div>
          <span className="text-xs uppercase tracking-[0.2em] theme-text-muted">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pr-4 space-y-8 sidebar-scrollable">
        <nav className="space-y-4">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="px-4">
                <h3 className="text-xs uppercase tracking-[0.3em] theme-text-muted font-semibold">
                  {section.title}
                </h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-900'
                          : item.highlight
                          ? isDark
                            ? 'text-fuchsia-300 hover:bg-fuchsia-900/20'
                            : 'text-fuchsia-700 hover:bg-fuchsia-50'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                    title={item.description}
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1">
                      <span className="block">{item.name}</span>
                      {preferences.interface.showDescriptions && (
                        <span className="text-xs opacity-60 group-hover:opacity-80 transition-opacity">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Coming Soon Section */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] theme-text-muted px-4">Coming Soon</p>
          <div className="space-y-1">
            {futureFeatures.map((feature) => (
              <DisabledMenu
                key={feature.name}
                icon={feature.icon}
                name={feature.name}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        {/* Tip section */}
        <div className={`p-4 rounded-xl transition-colors duration-300 ${isDark ? 'bg-slate-800/50 text-white/70' : 'bg-slate-50 text-slate-600'}`}>
          <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">{displayName}&apos;s Tip</p>
          <p className="mt-2 text-sm theme-text-secondary">
            Tag every winning hook as soon as you import it—future you will thank you at launch time.
          </p>
        </div>
      </div>
    </aside>
  );
}