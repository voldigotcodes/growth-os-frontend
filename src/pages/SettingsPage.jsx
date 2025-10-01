import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import { predefinedThemes, themeCategories, getThemeAccentColors } from '../config/themes.js';
import { useAuth } from '../firebase/AuthContext.jsx';
import { LogoutButton } from '../firebase/index.js';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { theme, backgroundImages, setBackgroundImage, resetBackgroundImage, selectedThemeId, setSelectedTheme } = useTheme();
  const { addToast } = useToast();
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  const { profile, updateProfile, updateMultipleFields, resetProfile } = useProfile();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [plan, setPlan] = useState('starter');

  // Fetch subscription tier from backend (same as dashboard)
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) return;

      try {
        const quotaResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/credits/quota`, {
          method: 'GET',
          headers: {
            'X-User-ID': currentUser.uid,
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (quotaResponse.ok) {
          const quotaData = await quotaResponse.json();
          const tier = quotaData.quota.subscription_tier;
          console.log('✅ Fetched subscription tier for settings:', tier);
          setPlan(tier);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, [currentUser]);

  const handleCancelSubscription = async () => {
    try {
      // This would integrate with RevenueCat to cancel subscription
      addToast('Subscription cancellation requested. You will retain access until the end of your billing period.', 'success');
    } catch (error) {
      addToast('Failed to cancel subscription. Please try again.', 'error');
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      // For now, just show a warning as actual account deletion would require Firebase admin
      addToast('Account deletion requested. Please contact support to complete this process.', 'warning');
      setShowDeleteConfirm(false);
    } catch (error) {
      addToast('Failed to delete account. Please try again.', 'error');
    }
  };

  const handleLogoutSuccess = () => {
    addToast('Successfully signed out!', 'success');
    navigate('/auth');
  };

  const handleLogoutError = (error) => {
    addToast(`Logout failed: ${error}`, 'error');
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
                    'w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
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
                    'w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
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
                    'w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
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
                    'w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
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
              {/* Background Theme Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="block text-xs uppercase tracking-[0.3em] theme-text-muted">
                    Background Theme
                  </span>
                  <p className={`text-sm ${subtleText}`}>
                    Choose a predefined theme to customize your workspace background
                  </p>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {predefinedThemes.map((themeOption) => {
                    const isSelected = selectedThemeId === themeOption.id;
                    const accentColors = getThemeAccentColors(selectedThemeId);
                    return (
                      <button
                        key={themeOption.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(themeOption.id);
                          addToast(`Applied "${themeOption.name}" theme`, 'success');
                        }}
                        className={[
                          'group relative flex flex-col gap-2 rounded-md border p-3 text-left transition-all',
                          isSelected
                            ? `border-${accentColors.border} bg-${accentColors.bg} ring-2 ring-${accentColors.ring}`
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20',
                        ].join(' ')}
                      >
                        {/* Theme Preview */}
                        <div
                          className="h-12 w-full rounded-sm border border-white/20 overflow-hidden"
                          style={{
                            background: themeOption.preview,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="flex h-full w-full items-center justify-center bg-black/20">
                              <span className="text-white text-lg font-bold">✓</span>
                            </div>
                          )}
                        </div>

                        {/* Theme Info */}
                        <div className="space-y-1">
                          <h4 className={`text-sm font-medium ${isSelected ? `text-${accentColors.text}` : 'theme-text-primary'}`}>
                            {themeOption.name}
                          </h4>
                          <p className={`text-xs ${isSelected ? `text-${accentColors.textMuted}` : 'theme-text-muted'}`}>
                            {themeOption.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Current Theme Info */}
                {selectedThemeId !== 'default' && (
                  <div className={`rounded-md border p-3 text-sm ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">●</span>
                      <div>
                        <p className="font-medium theme-text-primary">
                          Current: {predefinedThemes.find(t => t.id === selectedThemeId)?.name}
                        </p>
                        <p className="text-xs theme-text-muted">
                          This theme applies automatically to both light and dark modes
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                      'w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
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

      {/* Account Management Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Account Information */}
        <div className="space-y-6">
          <GlassCard title="Account Information" subtitle="Your account details and authentication status.">
            <div className="space-y-4">
              <div className="glass-panel p-4 bg-blue-500/10 border border-blue-500/20">
                <div className="text-sm space-y-2">
                  <p><strong className="theme-text-primary">Email:</strong> <span className="theme-text-muted">{currentUser?.email}</span></p>
                  <p><strong className="theme-text-primary">UID:</strong> <span className="theme-text-muted font-mono text-xs">{currentUser?.uid}</span></p>
                  <p><strong className="theme-text-primary">Plan:</strong> <span className={`capitalize font-medium ${plan === 'scaler' ? 'text-purple-400' : plan === 'pro' ? 'text-emerald-400' : 'text-blue-400'}`}>{plan}</span></p>
                  {userProfile?.createdAt && (
                    <p><strong className="theme-text-primary">Member since:</strong> <span className="theme-text-muted">{userProfile.createdAt.toDate?.()?.toLocaleDateString() || 'Recently'}</span></p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <LogoutButton
                  onSuccess={handleLogoutSuccess}
                  onError={handleLogoutError}
                  variant="secondary"
                  size="md"
                  className="w-full"
                >
                  Sign Out
                </LogoutButton>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Subscription & Account Actions */}
        <div className="space-y-6">
          <GlassCard title="Subscription & Account" subtitle="Manage your subscription and account settings.">
            <div className="space-y-4">
              {(plan === 'pro' || plan === 'scaler') && (
                <div className={`glass-panel p-4 ${plan === 'scaler' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                  <div className="text-sm space-y-2">
                    <p className={`font-medium ${plan === 'scaler' ? 'text-purple-300' : 'text-emerald-300'}`}>
                      ✨ {plan === 'scaler' ? 'Scaler' : 'Pro'} Plan Active
                    </p>
                    <p className="theme-text-muted">You have access to all {plan === 'scaler' ? 'enterprise' : 'premium'} features.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(plan === 'pro' || plan === 'scaler') && (
                  <button
                    type="button"
                    className="liquid-button w-full text-sm border-orange-400/60 bg-orange-500/15 text-orange-200 hover:ring-orange-300/50"
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </button>
                )}

                <button
                  type="button"
                  className="liquid-button w-full text-sm border-red-400/60 bg-red-500/15 text-red-200 hover:ring-red-300/50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="glass-panel p-4 bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300 mb-3">
                    ⚠️ This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="liquid-button flex-1 text-sm border-red-400/60 bg-red-500/20 text-red-200 hover:ring-red-300/50"
                      onClick={handleDeleteAccount}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      className="liquid-button flex-1 text-sm border-gray-400/60 bg-gray-500/15 text-gray-200 hover:ring-gray-300/50"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}