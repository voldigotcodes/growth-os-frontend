import { useProfile } from '../context/ProfileContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDynamicTextColor } from '../hooks/useDynamicTextColor.js';
import GlassCard from '../components/GlassCard.jsx';

export default function ProfileDemo() {
  const { profile, displayName, companyName, userInitials } = useProfile();
  const { theme } = useTheme();
  const { primaryText } = useDynamicTextColor();
  const isDark = theme === 'dark';

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <header>
        <h1 className="text-3xl font-semibold theme-text-primary">Profile Integration Demo</h1>
        <p className="mt-2 text-sm theme-text-secondary">
          This page shows how your profile information appears throughout the app.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <GlassCard title="Profile Data" subtitle="Current values from ProfileContext">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Display Name:</span>
              <span className="theme-text-primary font-medium">{displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Company:</span>
              <span className="theme-text-primary font-medium">{companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Email:</span>
              <span className="theme-text-primary font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Timezone:</span>
              <span className="theme-text-primary font-medium">{profile.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Initials:</span>
              <span className="theme-text-primary font-medium">{userInitials}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Live Preview" subtitle="How it appears in the app">
          <div className="space-y-4">
            {/* Header Example */}
            <div className={`p-3 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50/50'}`}>
              <p className="text-sm theme-text-primary font-medium">
                Welcome back, {displayName}.
              </p>
              <p className="text-xs theme-text-muted mt-1">
                Ready to create with {companyName}?
              </p>
            </div>

            {/* Studio Badge Example */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/50'}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="theme-text-muted">{companyName} Studio</span>
            </div>

            {/* Tip Section Example */}
            <div className={`p-3 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50/50'}`}>
              <p className="text-xs uppercase tracking-wider theme-text-muted mb-2">
                {displayName}'s Tip
              </p>
              <p className="text-sm theme-text-secondary">
                Tag every winning hook as soon as you import it.
              </p>
            </div>

            {/* Avatar Example - Updated to use dynamic text colors */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isDark ? 'bg-white/10' : 'bg-slate-200'} ${primaryText}`}>
                {userInitials}
              </div>
              <div>
                <p className="text-sm font-medium theme-text-primary">{displayName}</p>
                <p className="text-xs theme-text-muted">{companyName}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Instructions" subtitle="How to update your profile">
        <div className="prose prose-sm max-w-none theme-text-secondary">
          <ol className="space-y-2">
            <li>1. Go to <strong>Settings</strong> in the sidebar</li>
            <li>2. Update your <strong>Display Name</strong> and <strong>Company/Brand</strong> fields</li>
            <li>3. Click <strong>Save Changes</strong></li>
            <li>4. Your information will update throughout the app instantly!</li>
          </ol>
          <p className="mt-4 text-xs theme-text-muted">
            Changes are automatically saved to localStorage and will persist between sessions.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}