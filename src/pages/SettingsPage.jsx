import { useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';

export default function SettingsPage() {
  const { theme, toggleTheme, backgroundImages, setBackgroundImage, resetBackgroundImage } = useTheme();
  const { addToast } = useToast();
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  const { profile, updateProfile, updateMultipleFields, resetProfile } = useProfile();
  const isDark = theme === 'dark';


  // Use standard theme text classes for proper contrast
  const labelText = 'theme-text-primary';
  const subtleText = 'theme-text-muted';
  const accentPurple = isDark
    ? 'liquid-button border-purple-400/60 bg-purple-500/15 text-purple-200 hover:ring-purple-300/50'
    : 'liquid-button border-purple-200/70 bg-purple-100/80 text-purple-600 hover:ring-purple-200/60';

  const handleProfileChange = (field, value) => {
    updateProfile(field, value);
  };


  const handleSaveSettings = () => {
    // Profile is auto-saved by context, preferences are auto-saved by context
    addToast('Settings saved successfully!', 'success');
  };

  const handleBackgroundImageUpload = (mode, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file', 'error');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addToast('Image file size must be less than 10MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(mode, e.target.result);
        addToast(`${mode === 'dark' ? 'Dark' : 'Light'} mode background updated!`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBackground = (mode) => {
    resetBackgroundImage(mode);
    addToast(`${mode === 'dark' ? 'Dark' : 'Light'} mode background reset to default`, 'success');
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
        <PrimaryButton icon="💾" onClick={handleSaveSettings}>
          Save Changes
        </PrimaryButton>
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
                  placeholder="Your display name"
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
                  placeholder="your.email@company.com"
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
                  placeholder="e.g. Growth Studio, Acme Corp"
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

              {/* Background Image Settings */}
              <div className="space-y-3">
                <span className="block text-xs uppercase tracking-[0.3em] theme-text-muted">
                  Background Images
                </span>

                {/* Dark Mode Background */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${labelText}`}>
                    Dark Mode Background
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="dark-background"
                        accept="image/*"
                        onChange={(e) => handleBackgroundImageUpload('dark', e)}
                        className="hidden"
                      />
                      <label
                        htmlFor="dark-background"
                        className={[
                          'flex cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm transition-colors',
                          isDark
                            ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900',
                        ].join(' ')}
                      >
                        <span className="mr-2">🖼️</span>
                        {backgroundImages.dark ? 'Change Dark Background' : 'Upload Dark Background'}
                      </label>
                    </div>
                    {backgroundImages.dark && (
                      <button
                        type="button"
                        onClick={() => handleResetBackground('dark')}
                        className={[
                          'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                          isDark
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                        ].join(' ')}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {backgroundImages.dark && (
                    <div className="mt-2">
                      <div className="h-20 w-32 rounded-lg border border-white/20 bg-cover bg-center bg-no-repeat"
                           style={{ backgroundImage: `url(${backgroundImages.dark})` }}>
                      </div>
                      <p className={`mt-1 text-xs ${subtleText}`}>Preview (dark mode background)</p>
                    </div>
                  )}
                </div>

                {/* Light Mode Background */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${labelText}`}>
                    Light Mode Background
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="light-background"
                        accept="image/*"
                        onChange={(e) => handleBackgroundImageUpload('light', e)}
                        className="hidden"
                      />
                      <label
                        htmlFor="light-background"
                        className={[
                          'flex cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm transition-colors',
                          isDark
                            ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900',
                        ].join(' ')}
                      >
                        <span className="mr-2">🌅</span>
                        {backgroundImages.light ? 'Change Light Background' : 'Upload Light Background'}
                      </label>
                    </div>
                    {backgroundImages.light && (
                      <button
                        type="button"
                        onClick={() => handleResetBackground('light')}
                        className={[
                          'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                          isDark
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                        ].join(' ')}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {backgroundImages.light && (
                    <div className="mt-2">
                      <div className="h-20 w-32 rounded-lg border border-white/20 bg-cover bg-center bg-no-repeat"
                           style={{ backgroundImage: `url(${backgroundImages.light})` }}>
                      </div>
                      <p className={`mt-1 text-xs ${subtleText}`}>Preview (light mode background)</p>
                    </div>
                  )}
                </div>

                <p className={`text-xs ${subtleText}`}>
                  Custom backgrounds will override the default gradient backgrounds. Recommended size: 1920x1080 or higher.
                </p>
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

        {/* Preferences Column */}
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
                    resetProfile();
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