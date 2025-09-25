import { useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  const isDark = theme === 'dark';

  const [profile, setProfile] = useState({
    name: 'Creative Director',
    email: 'creator@growthstudio.com',
    company: 'Growth Studio',
    timezone: 'America/New_York',
  });


  const subtleText = isDark ? 'text-white/60' : 'text-slate-500';
  const labelText = isDark ? 'text-white/80' : 'text-slate-700';
  const accentPurple = isDark
    ? 'liquid-button border-purple-400/60 bg-purple-500/15 text-purple-200 hover:ring-purple-300/50'
    : 'liquid-button border-purple-200/70 bg-purple-100/80 text-purple-600 hover:ring-purple-200/60';

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };


  const handleSaveSettings = () => {
    // Save profile to localStorage (preferences are auto-saved by context)
    localStorage.setItem('growth-os-profile', JSON.stringify(profile));
    addToast('Settings saved successfully!', 'success');
  };


  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold theme-text-primary">Settings & Profile</h1>
          <p className={['mt-2 max-w-2xl text-sm', subtleText].join(' ')}>
            Customize your Growth OS experience and manage your creative workspace preferences.
          </p>
        </div>
        <button type="button" className={accentPurple} onClick={handleSaveSettings}>
          Save Changes
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="space-y-6">
          <GlassCard title="Profile Information" subtitle="Update your personal details and workspace info.">
            <div className="space-y-4">
              <label className={`block text-sm ${labelText}`}>
                <span className="mb-2 block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Display Name
                </span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                />
              </label>

              <label className={`block text-sm ${labelText}`}>
                <span className="mb-2 block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Email Address
                </span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                />
              </label>

              <label className={`block text-sm ${labelText}`}>
                <span className="mb-2 block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Company/Brand
                </span>
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                />
              </label>

              <label className={`block text-sm ${labelText}`}>
                <span className="mb-2 block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Timezone
                </span>
                <select
                  value={profile.timezone}
                  onChange={(e) => handleProfileChange('timezone', e.target.value)}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">CET</option>
                </select>
              </label>
            </div>
          </GlassCard>

          <GlassCard title="Interface Preferences" subtitle="Customize the look and feel of your workspace.">
            <div className="space-y-4">
              <div>
                <span className="mb-3 block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Theme
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={[
                    'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                    isDark
                      ? 'border-white/15 bg-white/5 hover:bg-white/10'
                      : 'border-slate-200/70 bg-white/80 hover:bg-white/90',
                  ].join(' ')}
                >
                  <span className="text-2xl">{isDark ? '🌙' : '🌤️'}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${labelText}`}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className={`text-xs ${subtleText}`}>
                      {isDark ? 'Current theme: Midnight glass' : 'Current theme: Aurora glass'}
                    </p>
                  </div>
                  <span className={`text-xs ${subtleText}`}>Switch</span>
                </button>
              </div>


              <div className="space-y-3">
                <span className="block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Display Options
                </span>
                <label className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-medium ${labelText}`}>Compact Mode</span>
                    <p className={`text-xs ${subtleText}`}>Reduce spacing and padding</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.interface.compactMode}
                    onChange={(e) => updatePreference('interface', 'compactMode', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-medium ${labelText}`}>Show Descriptions</span>
                    <p className={`text-xs ${subtleText}`}>Display helper text under navigation items</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.interface.showDescriptions}
                    onChange={(e) => updatePreference('interface', 'showDescriptions', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                </label>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <GlassCard title="Notifications" subtitle="Choose what updates you want to receive.">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${labelText}`}>Workflow Complete</span>
                  <p className={`text-xs ${subtleText}`}>Get notified when workflows finish running</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.workflowComplete}
                  onChange={(e) => updatePreference('notifications', 'workflowComplete', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${labelText}`}>Credit Limit Reached</span>
                  <p className={`text-xs ${subtleText}`}>Alert when approaching usage limits</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.creditLimitReached}
                  onChange={(e) => updatePreference('notifications', 'creditLimitReached', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${labelText}`}>Weekly Digest</span>
                  <p className={`text-xs ${subtleText}`}>Summary of your creative activity</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.weeklyDigest}
                  onChange={(e) => updatePreference('notifications', 'weeklyDigest', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${labelText}`}>New Features</span>
                  <p className={`text-xs ${subtleText}`}>Updates about new tools and capabilities</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications.newFeatures}
                  onChange={(e) => updatePreference('notifications', 'newFeatures', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
              </label>
            </div>
          </GlassCard>

          <GlassCard title="Workflow Preferences" subtitle="Configure how automation tools behave.">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${labelText}`}>Auto-save</span>
                  <p className={`text-xs ${subtleText}`}>Automatically save workflow changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.workflow.autoSave}
                  onChange={(e) => updatePreference('workflow', 'autoSave', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${labelText}`}>Show Tooltips</span>
                  <p className={`text-xs ${subtleText}`}>Display help text when hovering over tools</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.workflow.showTooltips}
                  onChange={(e) => updatePreference('workflow', 'showTooltips', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
              </label>
              <div>
                <label className={`block text-sm ${labelText}`}>
                  <span className="mb-2 block text-xs uppercase tracking-[0.3em] theme-text-muted">
                    Animation Speed
                  </span>
                  <select
                    value={preferences.workflow.animationSpeed}
                    onChange={(e) => updatePreference('workflow', 'animationSpeed', e.target.value)}
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                      isDark
                        ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                        : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                    ].join(' ')}
                  >
                    <option value="fast">Fast</option>
                    <option value="normal">Normal</option>
                    <option value="slow">Slow</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Account Actions" subtitle="Manage your account and data.">
            <div className="space-y-3">
              <button
                type="button"
                className="liquid-button w-full text-sm border-blue-400/60 bg-blue-500/15 text-blue-200 hover:ring-blue-300/50"
                onClick={() => {
                  const data = {
                    profile,
                    preferences,
                    exportDate: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'growth-os-settings.json';
                  a.click();
                  URL.revokeObjectURL(url);
                  addToast('Settings exported successfully!', 'success');
                }}
              >
                Export Settings
              </button>
              <button
                type="button"
                className="liquid-button w-full text-sm border-orange-400/60 bg-orange-500/15 text-orange-200 hover:ring-orange-300/50"
                onClick={() => {
                  if (confirm('This will reset all settings to defaults. Continue?')) {
                    localStorage.removeItem('growth-os-profile');
                    resetPreferences();
                    addToast('Settings reset to defaults!', 'success');
                  }
                }}
              >
                Reset to Defaults
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}