import { useEffect, useState } from 'react';
import { useAuth } from '../firebase/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { useDynamicTextColor } from '../hooks/useDynamicTextColor.js';
import GlassCard from '../components/GlassCard.jsx';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const { primaryText } = useDynamicTextColor();
  const isDark = theme === 'dark';

  const [userData, setUserData] = useState(null);
  const [quotaData, setQuotaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use standard theme text classes for proper contrast
  const labelText = 'theme-text-primary';
  const subtleText = 'theme-text-muted';
  const accentEmerald = isDark
    ? 'liquid-button border-emerald-400/60 bg-emerald-500/15 text-emerald-200 hover:ring-emerald-300/50'
    : 'liquid-button border-emerald-200/70 bg-emerald-100/80 text-emerald-600 hover:ring-emerald-200/60';

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`🔄 Fetching dashboard data for user: ${currentUser.uid}`);

        // Fetch user analytics
        const analyticsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/analytics/user`, {
          method: 'GET',
          headers: {
            'X-User-ID': currentUser.uid,
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'Content-Type': 'application/json'
          },
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setUserData(analyticsData.insights);
        }

        // Fetch quota data
        const quotaResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/credits/quota`, {
          method: 'GET',
          headers: {
            'X-User-ID': currentUser.uid,
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'Content-Type': 'application/json'
          },
        });

        if (quotaResponse.ok) {
          const quotaInfo = await quotaResponse.json();
          setQuotaData(quotaInfo);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser?.uid, addToast]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getEngagementLevel = (score) => {
    if (score >= 80) return { level: 'Power User', color: 'text-purple-400', icon: '🚀' };
    if (score >= 50) return { level: 'Active Creator', color: 'text-emerald-400', icon: '⭐' };
    if (score >= 20) return { level: 'Rising Star', color: 'text-blue-400', icon: '📈' };
    return { level: 'Getting Started', color: 'text-slate-400', icon: '🌱' };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${labelText}`}>Your Growth Dashboard</h1>
            <p className={`text-sm ${subtleText} mt-1`}>Track your creative journey and optimize your workflow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse">
              <div className="h-32 bg-white/5 rounded-md"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  const engagement = userData ? getEngagementLevel(userData.engagement_score) : { level: 'Getting Started', color: 'text-slate-400', icon: '🌱' };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${labelText}`}>Your Growth Dashboard</h1>
          <p className={`text-sm ${subtleText} mt-1`}>Track your creative journey and optimize your workflow</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${engagement.color} flex items-center gap-2`}>
            <span className="text-lg">{engagement.icon}</span>
            <span className="font-medium">{engagement.level}</span>
          </div>
        </div>
      </div>

      {/* Engagement Score */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${labelText}`}>Engagement Score</h2>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold" style={{ color: 'white' }}>
              {userData?.engagement_score || 0}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className={subtleText}>Progress to Power User</span>
            <span className={labelText}>{Math.min(100, userData?.engagement_score || 0)}/100</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, userData?.engagement_score || 0)}%` }}
            ></div>
          </div>

          {userData?.streak_days > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-lg">🔥</span>
              <span className={`${labelText} font-medium`}>
                {userData.streak_days} day{userData.streak_days !== 1 ? 's' : ''} streak!
              </span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className={`text-2xl font-bold ${labelText}`}>{formatNumber(userData?.workflows_run || 0)}</div>
          <div className={`text-sm ${subtleText}`}>Workflows Run</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className={`text-2xl font-bold ${labelText}`}>{formatNumber(userData?.content_generated || 0)}</div>
          <div className={`text-sm ${subtleText}`}>Content Generated</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className={`text-2xl font-bold ${labelText}`}>{formatNumber(userData?.workflows_created || 0)}</div>
          <div className={`text-sm ${subtleText}`}>Workflows Created</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="text-2xl mb-2">📱</div>
          <div className={`text-2xl font-bold ${labelText}`}>{formatNumber(userData?.sessions || 0)}</div>
          <div className={`text-sm ${subtleText}`}>Sessions</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Quotas */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${labelText}`}>Usage & Credits</h2>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              quotaData?.quota.subscription_tier === 'free'
                ? 'bg-slate-500/20 text-slate-400'
                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300'
            }`}>
              {quotaData?.quota.subscription_tier?.toUpperCase() || 'FREE'}
            </div>
          </div>

          <div className="space-y-4">
            {quotaData?.analytics.usage_percentages && Object.entries(quotaData.analytics.usage_percentages).map(([key, percentage]) => {
              const remaining = quotaData.quota.credits_remaining[key] || 0;
              const total = quotaData.analytics.tier_limits[key] || 1;
              const used = total - remaining;

              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={labelText}>{label}</span>
                    <span className={subtleText}>
                      {used}/{total} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {quotaData?.analytics.upgrade_recommended && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-md border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚡</span>
                <span className={`font-medium ${labelText}`}>Upgrade Recommended</span>
              </div>
              <p className={`text-sm ${subtleText} mb-3`}>
                You're using over 80% of your {quotaData.quota.subscription_tier} plan limits.
              </p>
              <button className={accentEmerald}>
                View Pricing Plans
              </button>
            </div>
          )}

          {quotaData?.analytics.days_until_reset !== undefined && (
            <div className="mt-4 text-center">
              <p className={`text-sm ${subtleText}`}>
                Credits reset in <span className={`font-medium ${labelText}`}>
                  {quotaData.analytics.days_until_reset} day{quotaData.analytics.days_until_reset !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          )}
        </GlassCard>

        {/* Top Features */}
        <GlassCard>
          <h2 className={`text-xl font-semibold ${labelText} mb-4`}>Your Favorite Features</h2>
          <div className="space-y-3">
            {userData?.top_features?.slice(0, 5).map((feature, index) => {
              const featureIcons = {
                'workflow_run': '⚡',
                'tts_generate': '🎧',
                'transcribe': '📝',
                'download': '⬇️',
                'workflow_create': '🔧',
                'session_start': '🚀',
                'modify': '✏️'
              };

              return (
                <div key={feature.feature} className="flex items-center justify-between p-3 rounded-md bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{featureIcons[feature.feature] || '📊'}</span>
                    <span className={`font-medium ${labelText}`}>
                      {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${subtleText}`}>{feature.usage}x</span>
                    <div className="w-16 bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (feature.usage / (userData.top_features[0]?.usage || 1)) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {userData?.user_type && (
            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-md border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className={`font-medium ${labelText}`}>User Type: </span>
                <span className="text-emerald-400 font-semibold capitalize">
                  {userData.user_type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Achievement-style Progress */}
      <GlassCard>
        <h2 className={`text-xl font-semibold ${labelText} mb-4`}>Milestones & Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'First Workflow',
              achieved: (userData?.workflows_created || 0) >= 1,
              icon: '🎉',
              description: 'Create your first workflow'
            },
            {
              name: 'Power Creator',
              achieved: (userData?.workflows_run || 0) >= 10,
              icon: '⚡',
              description: 'Run 10 workflows'
            },
            {
              name: 'Content Machine',
              achieved: (userData?.content_generated || 0) >= 50,
              icon: '🏭',
              description: 'Generate 50 pieces of content'
            },
            {
              name: 'Streak Master',
              achieved: (userData?.streak_days || 0) >= 7,
              icon: '🔥',
              description: 'Maintain 7-day streak'
            },
            {
              name: 'Workflow Architect',
              achieved: (userData?.workflows_created || 0) >= 5,
              icon: '🏗️',
              description: 'Create 5 workflows'
            },
            {
              name: 'Growth Champion',
              achieved: (userData?.engagement_score || 0) >= 80,
              icon: '👑',
              description: 'Reach 80+ engagement score'
            }
          ].map((achievement) => (
            <div
              key={achievement.name}
              className={`p-4 rounded-md border transition-all ${
                achievement.achieved
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl ${achievement.achieved ? 'grayscale-0' : 'grayscale'}`}>
                  {achievement.icon}
                </span>
                <span className={`font-medium ${
                  achievement.achieved ? 'text-emerald-400' : subtleText
                }`}>
                  {achievement.name}
                </span>
              </div>
              <p className={`text-sm ${achievement.achieved ? 'text-emerald-300' : subtleText}`}>
                {achievement.description}
              </p>
              {achievement.achieved && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-200 bg-emerald-500/20 rounded-full">
                    ✓ Unlocked
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}